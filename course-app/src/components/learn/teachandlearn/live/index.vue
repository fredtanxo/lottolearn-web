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
    <div style="text-align: center; padding: 14px 0 23px;"></div>
  </div>
</template>

<script>
import Sign from './sign'

import { mapActions, mapGetters } from 'vuex'

import { requestLiveCourse, queryLiveCourse } from '@/api/learn'

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
      timer: null
    }
  },
  computed: mapGetters(['isTeacher']),
  methods: {
    ...mapActions(['setMembers']),
    handleLiveCourse() {
      requestLiveCourse(this.courseId)
        .then(() => this.refreshLiveCourse())
        .catch(() => this.$message.error('开始直播失败'))
    },
    handleRefresh() {
      this.loading = true
      this.refreshLiveCourse()
    },
    refreshLiveCourse(flag) {
      queryLiveCourse(this.courseId)
        .then(response => {
          const data = response.data
          this.live = data.payload
        })
        .catch(() => {
          if (!flag) {
            this.$message.error('无法获取课程直播状态')
          }
        })
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
    // 自动刷新，时间间隔线性增加，上限30秒
    autoRefreshHandler(timeout) {
      this.timer = setTimeout(() => {
        this.refreshLiveCourse(true)
        this.autoRefreshHandler(timeout < 30 ? timeout + 1 : timeout)
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
    this.setMembers(new Map())
  }
}
</script>

<style>
.no-live {
  text-align: center;
}
</style>
