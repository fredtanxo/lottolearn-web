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
            <el-dropdown-item command="editProfile">个人资料</el-dropdown-item>
            <el-dropdown-item command="requestLogout">退出登陆</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-drawer
        title="修改个人资料"
        :visible.sync="edit"
        :show-close="false"
        @open="handleOpen"
        :before-close="handleClose">
        <el-form
          ref="editProfile"
          style="padding: 15px;"
          v-loading="drawerLoading"
          :model="editProfileForm"
          label-width="68px"
          :rules="editProfileRules">
          <div style="padding: 0 0 45px; text-align: center;">
            <el-avatar
              :size="64"
              :src="editProfileForm.avatar">
            </el-avatar>
          </div>
          <el-form-item
            label="头像"
            prop="avatar">
            <el-input
              v-model="editProfileForm.avatar"
              placeholder="请粘贴图片链接"
              autocomplete="off"
              clearable>
            </el-input>
          </el-form-item>
          <el-form-item
            label="昵称"
            prop="nickname">
            <el-input
              v-model="editProfileForm.nickname"
              placeholder="请输入昵称"
              autocomplete="off"
              clearable>
            </el-input>
          </el-form-item>
          <el-form-item
            label="性别"
            prop="gender">
            <el-radio-group
              v-model="editProfileForm.gender"
              size="medium">
              <el-radio-button :label="false">女</el-radio-button>
              <el-radio-button :label="true">男</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="简介"
            prop="description">
            <el-input
              v-model="editProfileForm.description"
              placeholder="介绍一下自己"
              autocomplete="off"
              clearable>
            </el-input>
          </el-form-item>
          <el-form-item
            label="登录方式">
            <!-- 用户名密码 -->
            <el-button
              v-if="this.password"
              type="primary"
              @click="handleChangeAccount(2)"
              size="small">
              <svg viewBox="64 64 896 896" focusable="false" class="" data-icon="lock" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true"><path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM540 701v53c0 4.4-3.6 8-8 8h-40c-4.4 0-8-3.6-8-8v-53a48.01 48.01 0 1156 0zm152-237H332V240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224z"></path></svg>
            </el-button>
            <el-button
              v-else
              @click="handleChangeAccount(2)"
              size="small">
              <svg viewBox="64 64 896 896" focusable="false" class="" data-icon="lock" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true"><path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM540 701v53c0 4.4-3.6 8-8 8h-40c-4.4 0-8-3.6-8-8v-53a48.01 48.01 0 1156 0zm152-237H332V240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224z"></path></svg>
            </el-button>
            <!-- GitHub -->
            <el-button
              v-if="this.github"
              type="primary"
              @click="handleChangeAccount(0)"
              size="small">
              <svg viewBox="64 64 896 896" focusable="false" class="" data-icon="github" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
            </el-button>
            <el-button
              v-else
              @click="handleCloseAccount(0)"
              size="small">
              <svg viewBox="64 64 896 896" focusable="false" class="" data-icon="github" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
            </el-button>
            <!-- 微博 -->
            <el-button
              v-if="this.weibo"
              type="primary"
              @click="handleChangeAccount(1)"
              size="small">
              <svg viewBox="64 64 896 896" focusable="false" class="" data-icon="weibo-circle" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-44.4 672C353.1 736 236 680.4 236 588.9c0-47.8 30.2-103.1 82.3-155.3 69.5-69.6 150.6-101.4 181.1-70.8 13.5 13.5 14.8 36.8 6.1 64.6-4.5 14 13.1 6.3 13.1 6.3 56.2-23.6 105.2-25 123.1.7 9.6 13.7 8.6 32.8-.2 55.1-4.1 10.2 1.3 11.8 9 14.1 31.7 9.8 66.9 33.6 66.9 75.5.2 69.5-99.7 156.9-249.8 156.9zm207.3-290.8a34.9 34.9 0 00-7.2-34.1 34.68 34.68 0 00-33.1-10.7 18.24 18.24 0 01-7.6-35.7c24.1-5.1 50.1 2.3 67.7 21.9 17.7 19.6 22.4 46.3 14.9 69.8a18.13 18.13 0 01-22.9 11.7 18.18 18.18 0 01-11.8-22.9zm106 34.3s0 .1 0 0a21.1 21.1 0 01-26.6 13.7 21.19 21.19 0 01-13.6-26.7c11-34.2 4-73.2-21.7-101.8a104.04 104.04 0 00-98.9-32.1 21.14 21.14 0 01-25.1-16.3 21.07 21.07 0 0116.2-25.1c49.4-10.5 102.8 4.8 139.1 45.1 36.3 40.2 46.1 95.1 30.6 143.2zm-334.5 6.1c-91.4 9-160.7 65.1-154.7 125.2 5.9 60.1 84.8 101.5 176.2 92.5 91.4-9.1 160.7-65.1 154.7-125.3-5.9-60.1-84.8-101.5-176.2-92.4zm80.2 141.7c-18.7 42.3-72.3 64.8-117.8 50.1-43.9-14.2-62.5-57.7-43.3-96.8 18.9-38.4 68-60.1 111.5-48.8 45 11.7 68 54.2 49.6 95.5zm-93-32.2c-14.2-5.9-32.4.2-41.2 13.9-8.8 13.8-4.7 30.2 9.3 36.6 14.3 6.5 33.2.3 42-13.8 8.8-14.3 4.2-30.6-10.1-36.7zm34.9-14.5c-5.4-2.2-12.2.5-15.4 5.8-3.1 5.4-1.4 11.5 4.1 13.8 5.5 2.3 12.6-.3 15.8-5.8 3-5.6 1-11.8-4.5-13.8z"></path></svg>
            </el-button>
            <el-button
              v-else
              @click="handleCloseAccount(1)"
              size="small">
              <svg viewBox="64 64 896 896" focusable="false" class="" data-icon="weibo-circle" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-44.4 672C353.1 736 236 680.4 236 588.9c0-47.8 30.2-103.1 82.3-155.3 69.5-69.6 150.6-101.4 181.1-70.8 13.5 13.5 14.8 36.8 6.1 64.6-4.5 14 13.1 6.3 13.1 6.3 56.2-23.6 105.2-25 123.1.7 9.6 13.7 8.6 32.8-.2 55.1-4.1 10.2 1.3 11.8 9 14.1 31.7 9.8 66.9 33.6 66.9 75.5.2 69.5-99.7 156.9-249.8 156.9zm207.3-290.8a34.9 34.9 0 00-7.2-34.1 34.68 34.68 0 00-33.1-10.7 18.24 18.24 0 01-7.6-35.7c24.1-5.1 50.1 2.3 67.7 21.9 17.7 19.6 22.4 46.3 14.9 69.8a18.13 18.13 0 01-22.9 11.7 18.18 18.18 0 01-11.8-22.9zm106 34.3s0 .1 0 0a21.1 21.1 0 01-26.6 13.7 21.19 21.19 0 01-13.6-26.7c11-34.2 4-73.2-21.7-101.8a104.04 104.04 0 00-98.9-32.1 21.14 21.14 0 01-25.1-16.3 21.07 21.07 0 0116.2-25.1c49.4-10.5 102.8 4.8 139.1 45.1 36.3 40.2 46.1 95.1 30.6 143.2zm-334.5 6.1c-91.4 9-160.7 65.1-154.7 125.2 5.9 60.1 84.8 101.5 176.2 92.5 91.4-9.1 160.7-65.1 154.7-125.3-5.9-60.1-84.8-101.5-176.2-92.4zm80.2 141.7c-18.7 42.3-72.3 64.8-117.8 50.1-43.9-14.2-62.5-57.7-43.3-96.8 18.9-38.4 68-60.1 111.5-48.8 45 11.7 68 54.2 49.6 95.5zm-93-32.2c-14.2-5.9-32.4.2-41.2 13.9-8.8 13.8-4.7 30.2 9.3 36.6 14.3 6.5 33.2.3 42-13.8 8.8-14.3 4.2-30.6-10.1-36.7zm34.9-14.5c-5.4-2.2-12.2.5-15.4 5.8-3.1 5.4-1.4 11.5 4.1 13.8 5.5 2.3 12.6-.3 15.8-5.8 3-5.6 1-11.8-4.5-13.8z"></path></svg>
            </el-button>
            <el-dialog
              :title="`${password ? '修改' : '添加'}登录用户名和密码`"
              :visible.sync="dialog"
              @close="handleDialogClose"
              append-to-body>
              <el-form
                ref="editUsernamePassword"
                v-loading="dialogLoading"
                :model="editUsernamePasswordForm"
                :rules="editUsernamePasswordRules">
                <el-form-item
                  label="用户名"
                  prop="username">
                  <el-input
                    v-model.trim="editUsernamePasswordForm.username"
                    placeholder="用户名"
                    autofocus
                    clearable>
                  </el-input>
                </el-form-item>
                <el-form-item
                  v-if="this.password"
                  label="旧密码"
                  prop="oldPassword">
                  <el-input
                    v-model.trim="editUsernamePasswordForm.oldPassword"
                    placeholder="旧密码"
                    type="password"
                    clearable>
                  </el-input>
                </el-form-item>
                <el-form-item
                  label="新密码"
                  prop="newPassword">
                  <el-input
                    v-model.trim="editUsernamePasswordForm.newPassword"
                    placeholder="新密码"
                    type="password"
                    clearable>
                  </el-input>
                </el-form-item>
              </el-form>
              <span
                slot="footer"
                class="dialog-footer">
                <el-button
                  type="primary"
                  :loading="dialogSubmiting"
                  @click="handleChangeUsernameAndPassword">
                  {{ password ? '修改' : '添加' }}
                </el-button>
              </span>
            </el-dialog>
          </el-form-item>
          <div style="text-align: center;">
            <el-button
              type="primary"
              @click="handleSubmitEditProfile"
              :loading="drawerSubmiting">
              修改
            </el-button>
          </div>
        </el-form>
      </el-drawer>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Cookies from 'js-cookie'

import { currentUser, editUser } from '@/api/user'
import {
  findAllAccounts,
  findUserAccountById,
  addUserAccount,
  updateUserAccount
} from '@/api/account'

export default {
  data() {
    return {
      edit: false,
      dialog: false,
      drawerLoading: true,
      drawerSubmiting: false,
      dialogLoading: false,
      dialogSubmiting: false,
      editProfileForm: {
        nickname: '',
        gender: false,
        avatar: '',
        description: ''
      },
      editProfileRules: {
        nickname: [
          { required: true, message: '必须提供昵称', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '必须提供性别', trigger: 'blur' }
        ]
      },
      accounts: [],
      password: false,
      github: false,
      weibo: false,
      editUsernamePasswordForm: {
        username: '',
        oldPassword: '',
        newPassword: ''
      },
      editUsernamePasswordRules: {
        username: [
          { required: true, message: '必须提供用户名', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '必须提供新密码', trigger: 'blur' },
          { min: 8, max: 50, message: '密码长度要求8到50个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: mapState({
    userId: state => state.user.id,
    nickname: state => state.user.nickname,
    avatar: state => state.user.avatar
  }),
  methods: {
    ...mapActions(['updateUser']),
    handleCommand(command) {
      switch (command) {
        case 'requestLogout':
          this.requestLogout()
          break
        case 'editProfile':
          this.handleEditProfile()
          break
      }
    },
    requestLogout() {
      Cookies.remove('token', { path: '/', domain: 'lottolearn.com' })
      sessionStorage.removeItem('token')
      location.href = '/'
    },
    handleEditProfile() {
      this.edit = true
    },
    handleSubmitEditProfile() {
      this.$refs.editProfile.validate(valid => {
        if (valid) {
          this.drawerSubmiting = true
          editUser(this.userId, this.editProfileForm)
            .then(() => {
              this.$message.success('修改成功')
              this.handleOpen()
              this.updateUser()
            })
            .catch(() => this.$message.error('修改失败'))
            .finally(() => this.drawerSubmiting = false)
        }
      })
    },
    handleChangeAccount(type) {
      // if (this.accounts.length <= 1 && type === 2) {
      //   this.message.error('至少保留一种登录方式')
      //   return
      // }
      const index = this.accounts.findIndex(a => a.type === type)
      const account = this.accounts[index]
      switch (type) {
        case 0:
          
          break
        case 1:
          break
        case 2:
          this.dialog = true
          if (index !== -1) {
            this.dialogLoading = true
            findUserAccountById(account.id)
              .then(response => {
                const acc = response.data.payload
                this.editUsernamePasswordForm.username = acc.account
              })
              .catch(() => this.$message.error('无法获取账户信息'))
              .finally(() => this.dialogLoading = false)
          }
          break
      }
    },
    handleCloseAccount(type) {

    },
    handleChangeUsernameAndPassword() {
      this.$refs.editUsernamePassword.validate(valid => {
        if (valid) {
          this.dialogSubmiting = true
          const account = {
            userId: this.userId,
            account: this.editUsernamePasswordForm.username,
            type: 2,
            oldCredential: this.editUsernamePasswordForm.oldPassword,
            credential: this.editUsernamePasswordForm.newPassword
          }
          findAllAccounts()
            .then(response => {
              const accs = response.data.payload.data
              const index = accs.findIndex(a => a.type === 2)
              return new Promise((resolve, reject) => {
                if (index !== -1) {
                  updateUserAccount(accs[index].id, account)
                    .then(() => resolve())
                    .catch(err => reject(err))
                } else {
                  addUserAccount(account)
                    .then(() => resolve())
                    .catch(err => reject(err))
                }
              })
            })
            .then(() => {
              this.$message.success(this.password ? '修改成功' : '添加成功')
              this.dialog = false
              this.handleOpen()
            })
            .catch(err => {
              const message = err.response.data.message
              this.$message.error(message)
            })
            .finally(() => {
              this.dialogSubmiting = false
            })
        }
      })
    },
    handleOpen() {
      this.drawerLoading = true
      currentUser()
        .then(response => {
          const data = response.data
          this.editProfileForm = data.payload
        })
        .catch(() => this.$message.error('无法获取用户资料'))
        .finally(() => this.drawerLoading = false)
      findAllAccounts()
        .then(response => {
          const data = response.data
          this.accounts = data.payload.data
          this.password = this.accounts.findIndex(a => a.type === 2) !== -1
          this.github = this.accounts.findIndex(a => a.type === 0) !== -1
          this.weibo = this.accounts.findIndex(a => a.type === 1) !== -1
          if (this.password) {
            this.editUsernamePasswordRules.oldPassword =  [
              { required: true, message: '必须提供旧密码', trigger: 'blur' },
              { min: 8, max: 50, message: '密码长度要求8到50个字符', trigger: 'blur' }
            ]
          }
        })
    },
    handleClose() {
      this.edit = false
      this.editProfileForm = {}
      this.accounts = []
    },
    handleDialogClose() {
      this.editUsernamePasswordForm = {},
      this.dialog = false
    }
  },
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
