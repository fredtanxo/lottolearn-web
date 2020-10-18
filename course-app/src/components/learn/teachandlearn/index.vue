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
          <span>章节</span>
        </el-badge>
      </el-tab-pane>
      <el-tab-pane name="live">
        <el-badge
          is-dot
          :hidden="viewed ? true : !live"
          slot="label">
          <span>直播</span>
        </el-badge>
      </el-tab-pane>
    </el-tabs>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { queryLiveCourse } from '@/api/learn'

export default {
  data() {
    return {
      courseId: this.$route.params.courseId,
      activeTab: 'chapter',
      viewed: false,
      live: false
    }
  },
  watch: {
    $route(val) {
      if (val.name === 'live') {
        this.activeTab = 'live'
      } else {
        this.activeTab = 'chapter'
      }
    }
  },
  methods: {
    ...mapActions(['updateCourse']),
    handleTabChange(tab) {
      switch (tab.name) {
        case 'chapter':
          this.$router.push(`/learn/${this.courseId}/teach-and-learn/chapter`)
          break
        case 'live':
          this.viewed = true
          this.$router.push(`/learn/${this.courseId}/teach-and-learn/live`)
          break
      }
    },
    refreshLiveCourse() {
      queryLiveCourse(this.courseId)
        .then(response => {
          const data = response.data
          this.live = data.payload
        })
    }
  },
  mounted() {
    if (this.$route.name === 'live') {
      this.viewed = true
      this.activeTab = 'live'
    } else {
      this.activeTab = 'chapter'
      this.refreshLiveCourse()
    }
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
