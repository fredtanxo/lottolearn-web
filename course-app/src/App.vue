<template>
  <router-view></router-view>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['updateUser'])
  },
  mounted() {
    this.updateUser()
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
