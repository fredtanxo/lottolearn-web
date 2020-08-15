<template>
  <el-container>
    <el-aside width="200px">
      <slot name="menu"></slot>
    </el-aside>
    <el-container>
      <el-header style="font-size: 12px">
        <slot name="logo">
          <h2 class="site-logo">LotToLearn</h2>
        </slot>
        <el-dropdown
          style="float: right;"
          trigger="click"
          @command="handleCommand">
          <span style="cursor: pointer; user-select: none;">
            <el-avatar
              :size="32"
              :src="avatar"
              class="user-avatar">
            </el-avatar>
            <span class="user-nickname">{{ nickname }}</span>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>个人资料</el-dropdown-item>
            <el-dropdown-item command="requestLogout">退出登陆</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'

import Cookies from 'js-cookie'

export default {
  computed: mapState({
    nickname: state => state.user.nickname,
    avatar: state => state.user.avatar
  }),
  methods: {
    handleCommand(command) {
      switch (command) {
        case 'requestLogout':
          this.requestLogout()
          break
        default:
          break
      }
    },
    requestLogout() {
      Cookies.remove('token', { path: '/', domain: 'lottolearn.com' })
      sessionStorage.removeItem('token')
      location.href = '/'
    }
  }
}
</script>

<style scoped>
.el-header {
  position: fixed;
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  width: 100%;
  border-bottom: 1px solid #e6e6e6;
  z-index: 5;
}

.el-aside {
  position: fixed;
  top: 60px;
  bottom: 0;
  color: #333;
  border-right: solid 1px #e6e6e6;
}

.el-menu {
  border-right: unset;
}

.el-main {
  margin-top: 60px;
  margin-left: 200px;
}

.site-logo {
  display: inline-block;
  line-height: 60px;
  margin: 0;
  padding: 0;
  color: #303133;
}

.user-avatar {
  margin-top: -5px;
}
.user-nickname {
  margin-left: 10px;
}
</style>
