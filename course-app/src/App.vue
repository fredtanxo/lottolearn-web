<template>
  <keep-alive include="browse">
    <router-view></router-view>
  </keep-alive>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['setAutoplay']),
    handleClick() {
      new Audio(`${process.env.BASE_URL}blank.mp3`).play()
      this.setAutoplay()
      document.removeEventListener('click', this.handleClick)
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClick)
  }
}
</script>

<style>
/* 样式修复 */
body {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  margin: 0;
}
span:focus {
  outline: none;
}
.el-tabs__item:focus.is-active.is-focus:not(:active) {
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}
.el-radio-button:focus {
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}
button, input, select, textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

/* 全局自定义样式 */
.el-avatar {
  vertical-align: middle;
}
.el-menu {
  border-right: none;
}
.empty-tip {
  font-size: 14px;
  line-height: 60px;
  color: #909399;
  text-align: center;
}
</style>
