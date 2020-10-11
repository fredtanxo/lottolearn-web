<template>
  <div
    class="live-container"
    v-loading="loading">
    <div
      class="no-live"
      v-if="!live">
      <div style="margin: 30vh 0 35px;">
        课程还没有开始直播
      </div>
      <el-button
        v-if="isTeacher"
        type="primary"
        icon="el-icon-video-camera"
        @click="handleLiveCourse">
        开始直播
      </el-button>
      <el-button
        v-if="isTeacher"
        icon="el-icon-finished"
        @click="courseSignDialog = true">
        签到记录
      </el-button>
      <el-button
        v-else
        type="primary"
        icon="el-icon-refresh"
        size="medium"
        @click="handleRefresh">
        刷新
      </el-button>
      <sign
        v-if="isTeacher && courseSignDialog"
        :setSignDialog="setSignDialog"
        :courseSignDialog="courseSignDialog">
      </sign>
    </div>
    <stream v-if="live" :roomId="live" />
    <chat v-if="live" :roomId="live" />
    <div style="text-align: center; padding: 48px 0 0;">
      <el-popconfirm
        v-if="isTeacher && live"
        title="确定关闭直播？直播关闭后其他人将无法进入直播间"
        confirmButtonText="关闭"
        iconColor="red"
        @onConfirm="handleLiveCourseEnd">
        <el-button
          slot="reference"
          type="danger"
          icon="el-icon-switch-button"
          size="medium"
          plain
          :disabled="down">
          {{ down ? '直播已关闭' : '关闭直播' }}
        </el-button>
      </el-popconfirm>
    </div>
  </div>
</template>

<script>
import Sign from './sign'

import { mapState } from 'vuex'

import {
  requestLiveCourse,
  queryLiveCourse,
  requestLiveCourseEnd
} from '@/api/learn'

import Chat from './chat'
import Stream from './stream'

export default {
  components: {
    Chat,
    Stream,
    Sign
  },
  data() {
    return {
      courseSignDialog: false,
      courseId: this.$route.params.courseId,
      loading: true,
      live: false,
      down: false,
      timer: null
    }
  },
  computed: mapState({
    isTeacher: state => state.course.teacherId === state.user.id
  }),
  methods: {
    handleLiveCourse() {
      requestLiveCourse(this.courseId)
        .then(() => this.refreshLiveCourse())
        .catch(() => this.$message.error('开始直播失败'))
    },
    handleLiveCourseEnd() {
      requestLiveCourseEnd(this.courseId)
        .then(() => {
          this.down = true
        })
        .catch(() => this.$message.error('下课失败'))
    },
    handleRefresh() {
      this.loading = true
      this.refreshLiveCourse()
    },
    refreshLiveCourse() {
      queryLiveCourse(this.courseId)
        .then(response => {
          const data = response.data
          this.live = data.payload
        })
        .catch(() => this.$message.error('无法查询课程直播状态'))
        .finally(() => this.loading = false)
    },
    autoRefresh() {
      if (this.live) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
      } else {
        if (!this.timer) {
          this.autoRefreshHandler(1)
        }
      }
    },
    // 自动刷新，时间间隔线性增加
    autoRefreshHandler(timeout) {
      this.timer = setTimeout(() => {
        this.refreshLiveCourse()
        this.autoRefreshHandler(timeout + 1)
      }, timeout * 1000)
    },
    setSignDialog() {
      this.courseSignDialog = false
    }
  },
  mounted() {
    this.refreshLiveCourse()
    this.autoRefresh()
  },
  updated() {
    this.autoRefresh()
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
}
</script>

<style>
.no-live {
  text-align: center;
}
</style>
