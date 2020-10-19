<template>
  <div>
    <div
      v-if="isTeacher && initialized"
      class="teacher-tool-wrapper">
      <el-popover
        v-if="initialized"
        placement="bottom"
        trigger="click">
        <div style="text-align: center;">
          <el-button
            icon="el-icon-time"
            @click="requestSign(15)"
            :disabled="signDisable">
            15秒
          </el-button>
          <el-button
            icon="el-icon-time"
            @click="requestSign(30)"
            :disabled="signDisable">
            30秒
          </el-button>
          <el-button
            icon="el-icon-time"
            @click="requestSign(60)"
            :disabled="signDisable">
            1分钟
          </el-button>
          <el-button
            icon="el-icon-time"
            @click="requestSign(300)"
            :disabled="signDisable">
            5分钟
          </el-button>
        </div>
        <el-button
          slot="reference"
          icon="el-icon-timer"
          :disabled="signDisable">
          签到
        </el-button>
      </el-popover>
      <el-popover
        style="margin-left: 10px;"
        placement="bottom"
        trigger="click">
        <div style="text-align: center;">
          <el-button
            icon="el-icon-magic-stick"
            @click="requestElect">
            随机
          </el-button>
        </div>
        <el-button
          slot="reference"
          icon="el-icon-chat-dot-square">
          提问
        </el-button>
      </el-popover>
    </div>
    <div
      v-if="initialized"
      class="course-members-wrapper">
      <el-popover
        style="margin-left: 10px;"
        placement="left"
        trigger="click">
        <div class="course-members">
          <template v-for="member in onlineMembers">
            <div
              :key="member.userId"
              class="course-member-item">
              <el-avatar
                :size="32"
                :src="member.userAvatar">
              </el-avatar>
              <span class="course-member-label">{{ member.userNickname }}</span>
              <el-button
                v-if="user.id === member.userId"
                icon="el-icon-edit"
                circle
                size="mini"
                class="member-change-name"
                @click="changeMyNickname(member.userNickname)">
              </el-button>
            </div>
          </template>
          <template v-for="member in offlineMembers">
            <div
              :key="member.userId"
              class="course-member-item course-member-offline">
              <el-avatar
                :size="32"
                :src="member.userAvatar">
              </el-avatar>
              <span class="course-member-label">{{ member.userNickname }}</span>
            </div>
          </template>
        </div>
        <el-button
          slot="reference"
          icon="el-icon-user">
          {{ onlineMembers.length + '/' + members.size }}
        </el-button>
      </el-popover>
      <el-dialog
        :visible.sync="editNickname"
        :close-on-click-modal="false"
        width="250px">    
        <el-input
          v-model="currentNickname"
          autofocus
          clearable
          @keydown.enter.native.prevent="handleChangeNickname">
        </el-input>
        <span slot="footer">
          <el-button
            type="primary"
            icon="el-icon-check"
            @click="handleChangeNickname">
            完成
          </el-button>
        </span>
      </el-dialog>
    </div>
    <div
      ref="dialog"
      class="dialog-card-wrapper"
      :style="`display: ${this.initialized ? 'block' : 'none'}`">
      <el-card
        class="dialog-card"
        style="height: 75vh;"
        shadow="hover">
          <div
            slot="header"
            class="dialog-header"
            @click="toggleDialog">
            <i class="el-icon-chat-dot-square"></i>
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
        <div ref="chatInput" class="chat-input-wrapper">
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
    <div style="text-align: center; margin-top: 10px;">
      <el-popconfirm
        v-if="isTeacher && initialized"
        title="确定结束直播？"
        confirmButtonText="结束"
        iconColor="red"
        @onConfirm="handleLiveCourseEnd">
        <el-button
          slot="reference"
          type="danger"
          icon="el-icon-switch-button"
          size="medium"
          plain
          :loading="ending">
          结束直播
        </el-button>
      </el-popconfirm>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { Client } from '@stomp/stompjs'

import config from '@/config'
import { findCourseMembers } from '@/api/course'
import {
  requestLiveCourseSign,
  handleLiveCourseSign,
  requestLiveCourseEnd
} from '@/api/learn'

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
      initialized: false,
      me: null,
      courseId: this.$route.params.courseId,
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
      hideBadge: true,
      onlineMembers: [],
      offlineMembers: [],
      currentNickname: '',
      editNickname: false,
      ending: false
    }
  },
  computed: {
    ...mapGetters(['isTeacher']),
    ...mapState(['autoplay', 'ready', 'user', 'members']),
    ...mapState({
      teacherId: state => state.course.teacherId
    })
  },
  watch: {
    ready(val) {
      if (val && !this.initialized) {
        this.init()
      }
    }
  },
  methods: {
    ...mapActions(['setChatReady', 'setMembers']),
    init() {
      if (!this.user.id) { // 未拉取到用户数据
        setTimeout(() => {
          this.init()
        }, 800)
        return
      }
      this.currentNickname = this.getCachedNicknameOrDefault()
      const token = sessionStorage.getItem(config.accessTokenKey)
      const client = new Client({
        brokerURL: `wss://${config.liveBaseUrl}${config.chatBaseUri}/classroom`,
        connectHeaders: {
          user: this.currentNickname,
          authorization: token
        }
      })
      this.chatClient = client

      client.onConnect = () => {
        // 将自己放入房间
        const me = this.members.get(this.user.id)
        me.userNickname = this.currentNickname
        this.onlineMembers.unshift(me)
        this.me = me
        // 订阅房间
        const subscription = client.subscribe(
          `/out/${this.roomId}`,
          this.handleReceiveMessage,
          { id: this.roomId, nickname: this.currentNickname }
        )
        this.connecting = false
        this.chatSubscription = subscription
      }

      client.onWebSocketClose = () => this.connecting = true

      client.onDisconnect = () => this.connecting = true

      client.onStompError = frame => {
        this.$message.error(frame.headers['message'])
        console.error('stompError', frame.body)
      }

      client.activate()

      this.initialized = true
    },
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
    handleReceiveMessage(message) {
      const msg = JSON.parse(message.body)
      switch (msg.type) {
        case 'MEMBERS':
          this.handleMembersMessage(msg)
          break
        case 'NEW_MEMBER':
          this.handleNewMemberMessage(msg)
          break
        case 'MEMBER_LEAVE':
          this.handleMemberLeaveMessage(msg)
          break
        case 'MEMBER_NICKNAME_CHANGED':
          this.handleMemberNicknameChanged(msg)
          break
        case 'CHAT':
          this.handleChatMessage(msg)
          break
        case 'SIGN':
          this.handleSignMessage(msg)
          break
        case 'ELECT':
          this.handleElectMessage(msg)
          break
        case 'END':
          this.handleEndMessage(msg)
          break
      }
    },
    // 处理房间成员列表消息
    handleMembersMessage(message) {
      const members = JSON.parse(message.content)
      this.refreshMembers(members)
    },
    // 处理新成员消息
    handleNewMemberMessage(message) {
      if (message.userId === this.user.id) {
        return
      }
      const member = this.members.get(message.userId)
      if (member.userNickname !== message.content) {
        member.userNickname = message.content
      }
      this.offlineMembers = this.offlineMembers.filter(m => m !== member)
      this.onlineMembers.splice(1, 0, member)
    },
    // 处理成员离开消息
    handleMemberLeaveMessage(message) {
      const member = this.members.get(message.userId)
      member.userNickname = member.oldNickname
      this.members.set(message.userId, member)
      this.onlineMembers = this.onlineMembers.filter(m => m !== member)
      this.offlineMembers.unshift(member)
    },
    // 处理更名消息
    handleMemberNicknameChanged(message) {
      const member = this.members.get(message.userId)
      member.userNickname = message.content
      this.onlineMembers = this.onlineMembers.slice()
    },
    // 处理聊天消息
    handleChatMessage(message) {
      const member = this.members.get(message.userId)
      this.chatHistory.push({
        ...message,
        nickname: member.userNickname,
        avatar: member.userAvatar,
        me: message.userId === this.user.id
      })
      if (!this.show) {
        this.newMessages++
        this.hideBadge = false
      }
    },
    // 处理签到消息
    handleSignMessage(message) {
      const member = this.members.get(message.userId)
      const content = JSON.parse(message.content)
      if (message.userId === this.user.id) {
        message.content = `[我发起${content.timeout}秒签到]`
      } else {
        message.content = `[${member.userNickname}发起${content.timeout}秒签到]`
      }
      this.chatHistory.push({
        ...message,
        nickname: member.userNickname,
        avatar: member.userAvatar,
        me: message.userId === this.user.id
      })
      if (message.userId !== this.user.id) {
        this.handleSign(member.userNickname, content)
      }
    },
    // 处理提问消息
    handleElectMessage(message) {
      const content = JSON.parse(message.content)
      const member1 = this.members.get(content.userId)
      const member2 = this.members.get(message.userId)
      if (member1.userId === this.user.id) {
        this.$notify.info({
          title: '提问',
          message: `${member2.userNickname} 向你发起提问`,
          duration: 60000
        })
        message.content = `[${member2.userNickname} 向你发起提问]`
      } else {
        message.content = `[${member2.userNickname} 向 ${member1.userNickname} 发起提问]`
      }
      this.handleChatMessage(message)
    },
    // 处理结束直播消息
    handleEndMessage(message) {
      if (message.userId === this.teacherId) {
        this.$notify({
          title: '直播结束',
          message: this.isTeacher ? '你结束了直播' : '教师结束了直播',
          type: 'success',
          duration: 60000
        })
        this.$router.push(`/learn/${this.courseId}/teach-and-learn/chapter`)
      }
    },
    // 发送消息
    sendMessage(type, content) {
      this.chatClient.publish({
        destination: `/in/${this.roomId}`,
        body: JSON.stringify({
          type,
          userId: this.user.id,
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
    //   userId: 1
    // }
    requestElect() {
      if (this.isTeacher) {
        const mLen = this.onlineMembers.length
        if (mLen <= 1) {
          this.$message.error('房间内没有其他在线成员')
          return
        }
        let member
        do {
          const pos = Number.parseInt(Math.random() * mLen)
          member = this.onlineMembers[pos]
        } while (member.userId === this.user.id)
        const content = JSON.stringify({ userId: member.userId })
        this.sendMessage('ELECT', content)
        this.$message.success(`向 ${member.userNickname} 发起提问`)
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
          userNickname: this.currentNickname
        })
        .finally(() => this.$notify.error({
          title: '签到',
          message: `错过 ${teacherName} 发起的 ${content.timeout} 秒签到`,
          duration: 120000
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
            userNickname: this.members.get(this.user.id).userNickname
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
      })
    },
    // 刷新成员列表
    refreshMembers(members) {
      const onlineMap = new Map()
      members.forEach(member => onlineMap.set(member.userId, member.userNickname))

      const online = []
      const offline = []
      const entries = this.members.entries()
      let entry = entries.next()
      while (!entry.done) {
        const k = entry.value[0]
        if (k !== this.me.userId) {
          let v = entry.value[1]
          if (onlineMap.has(k)) {
            const e = onlineMap.get(k)
            if (v.userNickname !== e) {
              v.userNickname = e
            }
            online.push(v)
          } else {
            offline.push(v)
          }
        }
        entry = entries.next()
      }
      online.unshift(this.me)
      this.onlineMembers = online
      this.offlineMembers = offline
    },
    changeMyNickname(nickname) {
      this.currentNickname = nickname
      this.editNickname = true
    },
    handleChangeNickname() {
      this.sendMessage('MEMBER_NICKNAME_CHANGED', this.currentNickname)
      this.editNickname = false
      this.$message.success(`已更名为：${this.currentNickname}`)
      this.cacheNickname()
    },
    getCachedNicknameOrDefault() {
      return localStorage.getItem(`live_nickname:${this.courseId}`) || this.user.nickname
    },
    cacheNickname() {
      return localStorage.setItem(`live_nickname:${this.courseId}`, this.currentNickname)
    },
    handleLiveCourseEnd() {
      this.ending = true
      requestLiveCourseEnd(this.courseId)
        .then(() => {
          this.sendMessage('END')
        })
        .catch(() => this.$message.error('无法结束直播'))
    }
  },
  mounted() {
    this.chatRef = this.$refs.chat

    // 聊天页面滚动
    this.chatRef.addEventListener('scroll', this.handleScroll)

    // 先获取成员列表
    findCourseMembers(this.courseId)
      .then(response => {
        const data = response.data
        const members = data.payload.data
        members.forEach(member => this.members.set(member.userId, {
          ...member,
          oldNickname: member.userNickname
        }))
        this.setChatReady(true)
      })
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
    this.setChatReady(false)
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
  right: -150px;
  transition: .35s ease-out;
}
.dialog-show {
  bottom: 0 !important;
  right: 0 !important;
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

.course-members-wrapper {
  position: absolute;
  right: 20px;
  top: 132px;
}
.course-members {
  min-width: 200px;
  max-height: 80vh;
  overflow: auto;
}
.course-member-item {
  padding: 13px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #efefef;
  transition: all .2s ease-out;
}
.course-member-item:hover {
  color: #409eff;
  border: 1px solid #c6e2ff;
  background-color: #ecf5ff;
}
.course-member-label {
  margin-left: 15px;
}
.course-member-offline {
  filter: opacity(0.5);
}
.member-change-name{
  float: right;
  right: 8px;
}
</style>
