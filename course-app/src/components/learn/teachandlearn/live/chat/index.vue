<template>
  <div>
    <div
      v-if="isTeacher"
      class="teacher-tool-wrapper">
      <el-popover
        placement="bottom"
        width="400"
        trigger="click">
        <div style="text-align: center;">
          <el-button
            @click="requestSign(15)"
            :disabled="signDisable">
            15秒
          </el-button>
          <el-button
            @click="requestSign(30)"
            :disabled="signDisable">
            30秒
          </el-button>
          <el-button
            @click="requestSign(60)"
            :disabled="signDisable">
            1分钟
          </el-button>
          <el-button
            @click="requestSign(300)"
            :disabled="signDisable">
            5分钟
          </el-button>
        </div>
        <el-button
          slot="reference"
          :disabled="signDisable">
          签到
        </el-button>
      </el-popover>
      <el-popover
        style="margin-left: 10px;"
        placement="bottom"
        width="400"
        trigger="click">
        <div style="text-align: center;">
          <el-button>随机</el-button>
        </div>
        <el-button slot="reference">提问</el-button>
      </el-popover>
    </div>
    <div
      class="dialog-card-wrapper"
      ref="dialog">
      <el-card
        class="dialog-card"
        style="height: 75vh;"
        shadow="hover">
          <div
            slot="header"
            class="dialog-header"
            @click="toggleDialog">
            对话
            <el-badge
              :value="newMessages"
              :hidden="hideBadge"
              class="item">
            </el-badge>
          </div>
        <div
          class="chat-item-wrapper"
          ref="chat"
          v-loading="connecting">
          <chat-item
            v-for="(history, index) in chatHistory"
            :key="index"
            v-bind="history" />
        </div>
        <div class="chat-input-wrapper">
          <el-input
            type="textarea"
            autosize
            @keydown.enter.native.exact.prevent="handleSendMessage"
            placeholder="请输入内容"
            :disabled="connecting"
            v-model="chatInput">
          </el-input>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Client } from '@stomp/stompjs'

import config from '@/config'
import { requestLiveCourseSign, handleLiveCourseSign } from '@/api/learn'

import ChatItem from './item'

export default {
  props: {
    roomId: String
  },
  components: {
    ChatItem
  },
  data() {
    return {
      connecting: true,
      chatClient: null,
      chatSubscription: null,
      show: false,
      autoScroll: true,
      chatRef: null,
      chatInput: '',
      chatHistory: [],
      signDisable: false,
      newMessages: 0,
      hideBadge: true
    }
  },
  computed: mapState({
    isTeacher: state => state.course.teacherId === state.user.id,
    user: state => state.user,
    courseId: state => state.course.id
  }),
  methods: {
    toggleDialog() {
      if (this.show) {
        this.$refs.dialog.classList.remove('dialog-show')
      } else {
        this.$refs.dialog.classList.add('dialog-show')
        this.newMessages = 0
        this.hideBadge = true
      }
      this.show = !this.show
    },
    handleScroll() {
      const chat = this.chatRef
      this.autoScroll = chat.scrollTop + chat.offsetHeight + 10 >= chat.scrollHeight
    },
    sendMessage(type, content) {
      this.chatClient.publish({
        destination: `/in/${this.roomId}`,
        body: JSON.stringify({
          type,
          userId: this.user.id,
          nickname: this.user.nickname,
          avatar: this.user.avatar,
          content,
          roomId: this.roomId
        })
      })
    },
    // 发送聊天消息
    handleSendMessage() {
      if (this.chatInput.trim() === '') {
        return
      }
      this.sendMessage('CHAT', this.chatInput)
      this.chatInput = ''
    },
    // 发起签到
    requestSign(timeout) {
      if (this.isTeacher) {
        requestLiveCourseSign(this.courseId, timeout, {
          type: 'SIGN',
          userId: this.user.id,
          nickname: this.user.nickname,
          avatar: this.user.avatar,
          roomId: this.roomId
        })
        .then(() => {
          this.$message.success('已发起签到')
          this.signDisable = true
          setTimeout(() => {
            this.signDisable = false
          }, timeout * 1000);
        })
        .catch(() => this.$message.error('发起签到失败'))
      }
    },
    // 发起提问
    // content的定义如下：
    // {
    //   userId: "123",
    //   nickanme: "fred"
    // }
    requestElect(userId) {
      if (this.isTeacher) {
        const content = JSON.stringify({ userId })
        this.sendMessage('ELECT', content)
      }
    },
    // 签到
    // content的定义如下：
    // {
    //   timeout: 5,
    //   signId: "61f1b085-93bd-423d-9750-3ef539ba7e80"
    // }
    handleSign(teacherName, content) {
      const timer = setTimeout(() => {
        handleLiveCourseSign({
          userId: this.user.id,
          signId: content.signId,
          userNickname: this.user.nickname
        })
        .finally(() => this.$notify.error({
          title: '签到',
          message: `错过 ${teacherName} 发起的 ${content.timeout} 秒签到`,
          duration: 0
        }))
      }, content.timeout * 1000)

      const notify = this.$notify.info({
        title: '签到',
        message: `${teacherName} 发起的 ${content.timeout} 秒签到`,
        duration: content.timeout * 1000,
        showClose: false,
        customClass: 'sign-notification',
        onClick: () => {
          clearTimeout(timer)
          handleLiveCourseSign({
            userId: this.user.id,
            signId: content.signId,
            userNickname: this.user.nickname
          })
          .then(response => {
            const code = response.data.code
            if (code === 200) {
              this.$message.success('签到成功')
            } else {
              this.$message.error('签到失败，已超过签到时限')
            }
            notify.close()
          })
          .catch(() => this.$message.error('网络错误'))
        }
      });
    }
  },
  mounted() {
    this.chatRef = this.$refs.chat

    const token = sessionStorage.getItem('token')
    const client = new Client({
      brokerURL: `wss://${config.liveBaseUrl}${config.chatBaseUri}/classroom`,
      connectHeaders: {
        user: this.user.nickname,
        authorization: token
      }
    })
    this.chatClient = client

    client.onConnect = frame => {
      console.debug('onConnect:', frame)
      this.connecting = false
      // 订阅房间
      const subscription = client.subscribe(`/out/${this.roomId}`, message => {
        const msg = JSON.parse(message.body)
        const me = msg.userId === this.user.id
        let content
        switch (msg.type) {
          case 'CHAT':
            this.chatHistory.push({
              ...msg,
              me
            })
            if (!this.show) {
              this.newMessages++
              this.hideBadge = false
            }
            break
          case 'SIGN':
            content = JSON.parse(msg.content)
            console.log(content)
            if (msg.userId === this.user.id) {
              msg.content = `[我发起 ${content.timeout} 秒签到]`
            } else {
              msg.content = `[${msg.nickname} 发起 ${content.timeout} 秒签到]`
            }
            this.chatHistory.push({
              ...msg,
              me
            })
            if (msg.userId !== this.user.id) {
              this.handleSign(msg.nickname, content)
            }
            break
          case 'ELECT':
            if (msg.content === this.user.id) {
              msg.content = `[${msg.nickname} 向你发起提问]`
            } else {
              msg.content = `[${msg.nickname} 发起提问]`
            }
            break
        }
        
      }, { id: this.roomId })
      this.chatSubscription = subscription
    }

    client.onWebSocketClose = () => this.connecting = true

    client.onDisconnect = () => this.connecting = true

    client.onStompError = frame => {
      this.$message.error(frame.headers['message'])
      console.error('stompError', frame.body)
    }

    client.activate()

    // 聊天页面滚动
    this.chatRef.addEventListener('scroll', this.handleScroll)
  },
  updated() {
    // 由于Vue的异步更新机制，需要在组件完成更新之后再作出滚动，
    // 否则只能滚动到n-1的位置
    if (this.autoScroll) {
      this.chatRef.scrollTo(0, this.chatRef.scrollHeight)
    }
  },
  beforeDestroy() {
    this.chatRef.removeEventListener('scroll', this.handleScroll)
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe()
    }
    if (this.chatClient) {
      this.chatClient.deactivate()
    }
  }
}
</script>

<style>
.dialog-card .el-card__header {
  height: 50px;
  padding: 0;
  cursor: pointer;
  position: fixed;
  background: #fff;
  width: 298px;
}
.dialog-card .el-card__body {
  padding: 0;
  margin-top: 50px;
}
.dialog-header {
  padding: 13px 20px;
}
.dialog-card-wrapper {
  position: fixed;
  width: 300px;
  height: 75vh;
  bottom: calc(50px - 75vh);
  right: 32px;
  transition: .32s cubic-bezier(0.21, 0.76, 1, 0.99);
}
.dialog-show {
  bottom: 0 !important;
}
.chat-item-wrapper {
  padding: 20px 15px 0;
  height: calc(75vh - 105px);
  overflow: auto;
}
.teacher-tool-wrapper {
  position: fixed;
  top: 10px;
  left: 50vw;
  z-index: 100;
}
.sign-notification {
  cursor: pointer;
}
.chat-content {
  font-size: 14px;
}
</style>
