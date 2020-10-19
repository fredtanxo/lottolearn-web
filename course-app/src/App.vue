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
body {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  margin: 0;
}
* {
  outline: none;
}
</style>
