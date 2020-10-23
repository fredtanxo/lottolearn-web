<template>
  <basic-framework>
    <el-menu
      router
      :default-active="activeMenu"
      slot="menu">
      <el-menu-item :index="`/learn/${courseId}/teach-and-learn`">
        <i class="el-icon-reading"></i>
        <span>教学</span>
      </el-menu-item>
      <el-menu-item :index="`/learn/${courseId}/announcement`">
        <i class="el-icon-guide"></i>
        <span>公告</span>
      </el-menu-item>
      <el-menu-item
        v-if="isTeacher"
        :index="`/learn/${courseId}/library`">
        <i class="el-icon-video-play"></i>
        <span>资源</span>
      </el-menu-item>
      <el-menu-item :index="`/learn/${courseId}/members`">
        <i class="el-icon-user"></i>
        <span>成员</span>
      </el-menu-item>
      <el-menu-item :index="`/learn/${courseId}/settings`">
        <i class="el-icon-setting"></i>
        <span>设置</span>
      </el-menu-item>
    </el-menu>
    <el-page-header
      @back="goBack"
      :content="courseName"
      slot="logo"
      class="learn-header">
    </el-page-header>
  </basic-framework>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

import BasicFramework from './index'

export default {
  components: {
    BasicFramework
  },
  watch: {
    $route(val) {
      this.activeMenu = `/learn/${this.courseId}/${val.matched[1].name}`
    }
  },
  data() {
    return {
      courseId: this.$route.params.courseId,
      activeMenu: ''
    }
  },
  computed: {
    ...mapGetters(['isTeacher']),
    ...mapState({
      courseName: state => state.learning ? state.learning : state.course.name,
      learning: state => state.learning
    })
  }
  ,
  methods: {
    ...mapActions(['updateCourse', 'setCourse']),
    goBack() {
      if (this.learning) {
        this.$router.back()
      } else {
        this.$router.push('/course')
        this.setCourse({})
      }
    }
  },
  mounted() {
    this.updateCourse(this.courseId)
    this.activeMenu = `/learn/${this.courseId}/${this.$route.matched[1].name}`
  }
}
</script>

<style scoped>
.learn-header {
  float: left;
  line-height: 60px;
}
</style>
