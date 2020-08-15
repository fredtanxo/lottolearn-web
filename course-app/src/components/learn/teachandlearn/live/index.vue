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
        size="medium"
        @click="handleLiveCourse">
        开始直播
      </el-button>
      <el-button
        v-else
        type="primary"
        size="medium"
        @click="handleRefresh">
        刷新
      </el-button>
    </div>
    <stream v-if="live" />
    <chat v-if="live" />
    <div style="text-align: center; padding: 48px 0 0;">
      <el-popconfirm
        v-if="live"
        title="确定下课？"
        confirmButtonText="下课"
        iconColor="red"
        @onConfirm="handleLiveCourseEnd">
        <el-button
          slot="reference"
          type="danger"
          size="medium"
          plain
          :disabled="down">
          {{ down ? '已下课' : '下课' }}
        </el-button>
      </el-popconfirm>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { UPDATE_COURSE } from '@/store/mutations'
import { requestLiveCourse, requestLiveCourseEnd } from '@/api/learn'

import Chat from './chat'
import Stream from './stream'

export default {
  components: {
    Chat,
    Stream
  },
  data() {
    return {
      courseId: this.$route.params.courseId,
      loading: true,
      down: false
    }
  },
  computed: mapState({
    live: state => !!state.course.live && !!state.user.id, // 可能出现userId为undefined
    isTeacher: state => state.course.teacherId === state.user.id
  }),
  methods: {
    ...mapActions(['updateCourse']),
    handleRefresh() {
      this.updateCourse(this.courseId)
      this.$message.success('已刷新')
    },
    handleLiveCourse() {
      requestLiveCourse(this.courseId)
        .then(response => {
          const data = response.data
          this.$store.commit(UPDATE_COURSE, data.payload)
        })
        .catch(() => this.$message.error('开始直播失败'))
    },
    handleLiveCourseEnd() {
      requestLiveCourseEnd(this.courseId)
        .then(() => {
          this.down = true
          this.$message.success('下课成功，未退出的成员可继续在直播间聊天')
        })
        .catch(() => this.$message.error('下课失败'))
    }
  },
  mounted() {
    this.updateCourse(this.courseId)
  },
  updated() {
    this.loading = false
  }
}
</script>

<style>
.live-container{
  min-height: 78vh;
}
.no-live {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
