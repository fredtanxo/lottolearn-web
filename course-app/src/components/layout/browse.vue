<template>
  <basic-framework>
    <el-menu router :default-active="activeMenu" slot="menu">
      <el-menu-item index="course">
        <i class="el-icon-collection"></i>
        <span>课程</span>
      </el-menu-item>
      <el-menu-item index="discovery">
        <i class="el-icon-discover"></i>
        <span>发现</span>
      </el-menu-item>
      <el-menu-item index="collections">
        <i class="el-icon-star-off"></i>
        <span>收藏</span>
      </el-menu-item>
    </el-menu>
  </basic-framework>
</template>

<script>
import BasicFramework from './index'

export default {
  name: 'browse',
  components: {
    BasicFramework
  },
  watch: {
    $route(val) {
      this.activeMenu = val.path.substring(1)
    }
  },
  data() {
    return {
      activeMenu: ''
    }
  },
  mounted() {
    this.activeMenu = this.$route.path.substring(1)
  }
}
</script>

<style>

</style>
