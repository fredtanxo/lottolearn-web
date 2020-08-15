<template>
  <div>
    <el-tabs
      v-model="activeTab"
      @tab-click="handleTabChange">
      <el-tab-pane name="chapter">
        <el-badge
          is-dot
          :hidden="true"
          slot="label">
          <span>章节学习</span>
        </el-badge>
      </el-tab-pane>
      <el-tab-pane name="live">
        <el-badge
          is-dot
          :hidden="viewed ? true : !live"
          slot="label">
          <span>课程直播</span>
        </el-badge>
      </el-tab-pane>
    </el-tabs>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      courseId: this.$route.params.courseId,
      activeTab: 'chapter',
      viewed: false
    }
  },
  computed: mapState({
    live: state => !!state.course.live
  }),
  methods: {
    ...mapActions(['updateCourse']),
    handleTabChange(tab) {
      switch (tab.name) {
        case 'chapter':
          this.$router.push(`/learn/${this.courseId}/teach-and-learn/chapter`)
          break;
        case 'live':
          this.viewed = true
          this.$router.push(`/learn/${this.courseId}/teach-and-learn/live`)
          break;
      }
    }
  },
  mounted() {
    if (this.$route.name === 'live') {
      this.viewed = true
      this.activeTab = 'live'
    } else {
      this.activeTab = 'chapter'
    }
    // this.updateCourse(this.courseId)
  }
}
</script>

<style>
.el-badge__content.is-fixed.is-dot {
  right: 0 !important;
  top: 8px !important;
}
.el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}
</style>
