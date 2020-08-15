<template>
  <div class="login-container">
    <div class="logo-wrapper">
      <h2>LotToLearn</h2>
    </div>
    <div class="login-form-wrapper">
      <el-form
        ref="loginForm"
        :model="login"
        :rules="rules">
        <el-form-item
          prop="username">
          <el-input
            v-model="login.username"
            autofocus
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"
            @keydown.enter.native="requestLogin">
          </el-input>
        </el-form-item>
        <el-form-item
          prop="password">
          <el-input
            type="password"
            v-model="login.password"
            prefix-icon="el-icon-lock"
            placeholder="请输入密码"
            @keydown.enter.native="requestLogin">
          </el-input>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        :loading="loginLoading"
        @click="requestLogin"
        style="width: 100%;">
        登录
      </el-button>
    </div>
    <div class="third-party-wrapper">
      <span style="font-size: 14px;">社交账号登录</span>
      <span class="third-party-logo-wrapper">
        <button
          class="third-party-link"
          @click="requestThirdPartyLogin('github')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="64 64 896 896" focusable="false" class="third-party-logo third-party-github" data-icon="github" width="1em" height="1em" fill="#606266" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
        </button>
        <button class="third-party-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="64 64 896 896" focusable="false" class="third-party-logo third-party-weibo" data-icon="weibo-circle" width="1em" height="1em" fill="#606266" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-44.4 672C353.1 736 236 680.4 236 588.9c0-47.8 30.2-103.1 82.3-155.3 69.5-69.6 150.6-101.4 181.1-70.8 13.5 13.5 14.8 36.8 6.1 64.6-4.5 14 13.1 6.3 13.1 6.3 56.2-23.6 105.2-25 123.1.7 9.6 13.7 8.6 32.8-.2 55.1-4.1 10.2 1.3 11.8 9 14.1 31.7 9.8 66.9 33.6 66.9 75.5.2 69.5-99.7 156.9-249.8 156.9zm207.3-290.8a34.9 34.9 0 00-7.2-34.1 34.68 34.68 0 00-33.1-10.7 18.24 18.24 0 01-7.6-35.7c24.1-5.1 50.1 2.3 67.7 21.9 17.7 19.6 22.4 46.3 14.9 69.8a18.13 18.13 0 01-22.9 11.7 18.18 18.18 0 01-11.8-22.9zm106 34.3s0 .1 0 0a21.1 21.1 0 01-26.6 13.7 21.19 21.19 0 01-13.6-26.7c11-34.2 4-73.2-21.7-101.8a104.04 104.04 0 00-98.9-32.1 21.14 21.14 0 01-25.1-16.3 21.07 21.07 0 0116.2-25.1c49.4-10.5 102.8 4.8 139.1 45.1 36.3 40.2 46.1 95.1 30.6 143.2zm-334.5 6.1c-91.4 9-160.7 65.1-154.7 125.2 5.9 60.1 84.8 101.5 176.2 92.5 91.4-9.1 160.7-65.1 154.7-125.3-5.9-60.1-84.8-101.5-176.2-92.4zm80.2 141.7c-18.7 42.3-72.3 64.8-117.8 50.1-43.9-14.2-62.5-57.7-43.3-96.8 18.9-38.4 68-60.1 111.5-48.8 45 11.7 68 54.2 49.6 95.5zm-93-32.2c-14.2-5.9-32.4.2-41.2 13.9-8.8 13.8-4.7 30.2 9.3 36.6 14.3 6.5 33.2.3 42-13.8 8.8-14.3 4.2-30.6-10.1-36.7zm34.9-14.5c-5.4-2.2-12.2.5-15.4 5.8-3.1 5.4-1.4 11.5 4.1 13.8 5.5 2.3 12.6-.3 15.8-5.8 3-5.6 1-11.8-4.5-13.8z"></path></svg>
        </button>
      </span>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'

import { login } from '@/api/auth'

export default {
  data() {
    return {
      loginTrying: false,
      loginLoading: false,
      login: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '必须提供用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '必须提供密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    requestLogin() {
      if (this.loginTrying) {
        return
      }
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loginTrying = true
          this.loginLoading = true
          login(this.login)
            .then(response => {
              if (response.status === 200) {
                const authHeader = response.headers['authorization']
                const jwt = authHeader.substr("Bearer ".length)
                Cookies.set('token', jwt, {
                  path: '/',
                  domain: 'lottolearn.com'
                })
                // location跳转，刷新整个应用
                location.href = '/'
              }
            })
            .catch(error => {
              if (error.response && error.response.status === 401) {
                // 前端防止恶意登录
                return new Promise(resolve => {
                  setTimeout(() => {
                    this.$message.error('用户名或密码错误')
                    resolve()
                  }, 3000)
                })
              } else {
                this.$message.error('网络异常')
              }
              console.log(error)
            })
            .finally(() => {
              this.loginTrying = false
              this.loginLoading = false
            })
        }
      })
    },
    requestThirdPartyLogin(registrationId) {
      location.href = `https://api.lottolearn.com/oauth2/authorization/${registrationId}`
    }
  },
  mounted() {
    if (Cookies.get('token')) {
      this.$router.push('/')
    }
    if (location.search.indexOf('failure=true') !== -1) {
      this.$message.error('授权登录失败')
    }
  }
}
</script>

<style>
.login-container {
  width: 365px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  height: 100vh;
}
.logo-wrapper {
  text-align: center;
  padding: 15px 0;
}
.login-form-wrapper {
  margin-top: 10px;
}
.third-party-wrapper {
  margin: 10px 0;
  line-height: 60px;
  color: #606266;
}
.third-party-logo-wrapper {
  text-align: right;
  float: right;
  margin-top: 0.5em;
}
.third-party-logo {
  width: 2em;
  height: 2em;
  transition: all .2s ease-out;
}
.third-party-github:hover {
  fill: #303133;
}
.third-party-weibo:hover {
  fill: #F56C6C;
}
.third-party-link {
  margin: 0 5px;
  display: inline-block;
  border: transparent;
  background-color: transparent;
  cursor: pointer;
  line-height: inherit;
}
</style>
