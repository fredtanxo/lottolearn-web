<template>
  <el-dialog
    title="加入课程"
    :visible.sync="dialog"
    class="join-dialog"
    @close="beforeClose">
    <el-form
      ref="formJoin"
      v-if="step === 0"
      :model="formJoin"
      :rules="formJoinRules">
      <el-form-item
        prop="invitationCode"
        label="课程邀请码">
        <el-input
          ref="codeInputRef"
          v-model.trim="formJoin.invitationCode"
          clearable
          :disabled="loadingJoin"
          @keydown.enter.native.prevent="handleJoinCourse"
          placeholder="请输入课程邀请码">
        </el-input>
      </el-form-item>
      <el-form-item
        prop="userNickname"
        label="身份（课程内使用的昵称）">
        <el-input
          v-model="formJoin.userNickname"
          clearable
          :disabled="loadingJoin"
          placeholder="默认身份为当前用户名">
        </el-input>
      </el-form-item>
    </el-form>
    <result
      v-else
      :result="result"
      mode="join"
      :callback="handleLearn">
    </result>
    <span
      v-if="step === 0"
      slot="footer">
      <el-button
        type="primary"
        icon="el-icon-connection"
        @click="handleJoinCourse"
        :loading="loadingJoin">
        加入
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

import Result from './result'

import { joinCourse, findJoinCourseResult } from '@/api/course'

export default {
  components: {
    Result
  },
  props: {
    joinDialog: Boolean,
    setJoinDialog: Function,
    callback: Function
  },
  data() {
    return {
      dialog: false,
      timer: null,
      loadingJoin: false,
      formJoin: {
        invitationCode: '',
        userNickname: ''
      },
      formJoinRules: {
        invitationCode: [
          { required: true, message: '必须提供邀请码才能加入', trigger: 'blur'}
        ]
      },
      step: 0,
      result: {
        success: false,
        message: '',
        courseId: ''
      }
    }
  },
  computed: mapGetters(['nickname']),
  watch: {
    joinDialog(val) {
      this.$nextTick(() => this.dialog = val)
    },
    dialog(val) {
      if (val) {
        this.step = 0
        this.result = {}
        this.formJoin = { userNickname: localStorage.getItem('join_nickname') || this.nickname }
        this.$nextTick(() => this.$refs.codeInputRef.focus())
      }
    }
  },
  methods: {
    // 邀请码加入课程
    handleJoinCourse() {
      this.$refs.formJoin.validate(valid => {
        if (valid) {
          this.loadingJoin = true
          joinCourse(this.formJoin)
            .then(response => {
              const data = response.data
              this.handleQueryJoinCourse(data, 0)
            })
            .catch(() => {
              this.$message.error('加入失败')
              this.loadingJoin = false
            })
          localStorage.setItem('join_nickname', this.formJoin.userNickname)
        }
      })
    },
    // 查询加入课程状态
    handleQueryJoinCourse(id, timeout) {
      this.timer = setTimeout(() => {
        findJoinCourseResult(id)
          .then(response => {
            const data = response.data
            if (data) {
              clearTimeout(this.timer)
              this.result = {
                success: data.code === 200,
                message: data.message,
                courseId: data.courseId
              }
              this.callback()
              this.step++
              this.loadingJoin = false
            } else {
              this.handleQueryJoinCourse(id, timeout >= 3 ? 3 : timeout + 1)
            }
          })
          .catch(() => this.$message.error('请重试'))
      }, timeout * 1000)
    },
    beforeClose() {
      this.setJoinDialog(false)
      if (this.$refs.formJoin) {
        this.$refs.formJoin.resetFields()
      }
    },
    handleLearn(path) {
      this.setJoinDialog(false)
      setTimeout(() => {
        this.$router.push(path)
      }, 300)
    }
  }
}
</script>

<style scoped>
.join-dialog >>> .el-dialog {
  position: fixed;
  width: 520px;
  right: 20px;
  bottom: 75px;
}
</style>
