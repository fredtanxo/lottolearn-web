<template>
  <div>
    <el-card shadow="hover">
      <div slot="header">
        <el-popconfirm
          v-if="isTeacher"
          confirmButtonText="关闭"
          icon="el-icon-info"
          iconColor="red"
          title="确定关闭课程？关闭课程后其他人将无法加入该课程，此操作无法撤销！"
          @onConfirm="handleCloseCourse">
          <el-link
            slot="reference"
            type="danger">
            关闭课程
          </el-link>
        </el-popconfirm>
        <el-popconfirm
          v-else
          confirmButtonText="退出"
          icon="el-icon-info"
          iconColor="red"
          title="退出该课程？"
          @onConfirm="handleQuitCourse">
          <el-link
            type="danger"
            slot="reference">
            退出课程
          </el-link>
        </el-popconfirm>
      </div>
      <table class="details" v-loading="courseLoading" cellspacing="0">
        <tr v-if="isTeacher">
          <td>
            <i class="el-icon-coin"></i>
            <span class="detail-label">CID</span>
          </td>
          <td>
            <span>{{ course.id }}</span>
          </td>
        </tr>
        <tr>
          <td>
            <i class="el-icon-reading"></i>
            <span class="detail-label">名称</span>
          </td>
          <td>
            <span>{{ course.name }}</span>
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="editCourseProp('name', course.name)">
              <el-tooltip
                effect="dark"
                :content="editTooltip"
                placement="top">
                <i class="el-icon-edit-outline"></i>
              </el-tooltip>
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <i class="el-icon-tickets"></i>
            <span class="detail-label">简介</span>
          </td>
          <td>
            <span>{{ course.description }}</span>
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="editCourseProp('description', course.description)">
              <el-tooltip
                effect="dark"
                :content="editTooltip"
                placement="top">
                <i class="el-icon-edit-outline"></i>
              </el-tooltip>
            </span>
          </td>
        </tr>
        <tr v-if="isTeacher">
          <td>
            <i class="el-icon-lock"></i>
            <span class="detail-label">权限</span>
          </td>
          <td>
            <span>{{ course.visibility ? '公开' : '私密' }}</span>
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="handleUpdateCourse('visibility', !course.visibility)">
              <el-tooltip
                effect="dark"
                :content="switchTooltip"
                placement="top">
                <i class="el-icon-refresh"></i>
              </el-tooltip>
            </span>
          </td>
        </tr>
        <tr v-if="isTeacher">
          <td>
            <i class="el-icon-link"></i>
            <span class="detail-label">邀请码</span>
          </td>
          <td>
            <span><code>{{ course.code }}</code></span>
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="copyToClipboard(course.code)">
              <el-tooltip
                effect="dark"
                :content="clipboardTooltip"
                placement="top">
              <i class="el-icon-copy-document"></i>
              </el-tooltip>
            </span>
          </td>
        </tr>
        <tr v-if="isTeacher">
          <td>
            <i class="el-icon-video-camera"></i>
            <span class="detail-label">直播ID</span>
          </td>
          <td>
            <span><code>{{ course.live }}</code></span>
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="copyToClipboard(course.live)">
              <el-tooltip
                effect="dark"
                :content="clipboardTooltip"
                placement="top">
                <i class="el-icon-copy-document"></i>
              </el-tooltip>
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <i class="el-icon-date"></i>
            <span class="detail-label">学期</span>
          </td>
          <td>
            <span>{{ course.termName }}</span>
          </td>
        </tr>
        <tr>
          <td>
            <i class="el-icon-medal"></i>
            <span class="detail-label">学分</span>
          </td>
          <td>
            <span>{{ course.credit }}</span>
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="editCourseProp('credit', course.credit)">
              <el-tooltip
                effect="dark"
                :content="editTooltip"
                placement="top">
                <i class="el-icon-edit-outline"></i>
              </el-tooltip>
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <i class="el-icon-user"></i>
            <span class="detail-label">教师</span>
          </td>
          <td>
            <span>{{ course.teacherName }}</span>
          </td>
        </tr>
        <tr>
          <td>
            <i class="el-icon-time"></i>
            <span class="detail-label">发布时间</span>
          </td>
          <td>
            <span>{{ course.pubDate }}</span>
          </td>
        </tr>
      </table>
    </el-card>
    <el-dialog :visible.sync="editDialog">
      <el-input v-model="editContent"></el-input>
      <span slot="footer">
        <el-button
          type="primary"
          icon="el-icon-check"
          :loading="courseLoading"
          @click="handleUpdateCourseFromInput">
          完成
        </el-button>
      </span>
    </el-dialog>
    <el-divider>
      <i class="el-icon-user">
      </i>&emsp;课程成员（{{ totalMembers }}）
    </el-divider>
    <div
      class="members-container"
      v-loading="membersLoading">
      <el-tooltip
        v-for="member in members"
        :key="member.id"
        effect="dark"
        :content="member.userNickname + (member.isTeacher ? '（教师）' : '')"
        placement="top">
        <el-card
          shadow="hover"
          class="member-card">
          <div class="member-info-wrapper">
            <el-avatar :src="member.userAvatar"></el-avatar>
              <span class="member-name">
                {{ member.userNickname + (member.isTeacher ? '（教师）' : '') }}
              </span>
          </div>
        </el-card>
      </el-tooltip>
    </div>
    <div
      v-if="members.length !== totalMembers"
      style="margin: 20px 0; text-align: center;">
      <el-link
        type="primary"
        :disabled="membersLoading"
        @click="handleMoreMembers">
        更多
      </el-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  findCourseById,
  findFullCourseById,
  findCourseMembers,
  updateCourse,
  quitCourse,
  closeCourse
} from '@/api/course'

export default {
  data() {
    return {
      courseLoading: true,
      membersLoading: true,
      course: {
        id: '',
        name: '',
        description: '',
        visibility: '',
        code: '',
        live: '',
        teacherId: '',
        teacherName: '',
        termId: '',
        termName: '',
        credit: ''
      },
      totalMembers: 0,
      members: [],
      membersQuery: {
        page: 0,
        size: 16
      },
      editDialog: false,
      editProp: '',
      editContent: '',
      courseId: this.$route.params.courseId,
      clipboardTooltip: '点击复制',
      switchTooltip: '点击切换',
      editTooltip: '点击编辑'
    }
  },
  computed: mapState({
    isTeacher: state => state.course.teacherId === state.user.id
  }),
  methods: {
    refreshCourse() {
      this.courseLoading = true
      const promise = this.isTeacher ? findFullCourseById(this.courseId) : findCourseById(this.courseId)
      promise.then(response => {
        const data = response.data
        this.course = { ...this.course, ...data.payload }
      })
      .catch(() => this.$message.error('无法获取课程信息'))
      .finally(() => this.courseLoading = false)
    },
    refreshCourseMembers() {
      this.membersLoading = true
      findCourseMembers(this.courseId, this.membersQuery)
        .then(response => {
          const data = response.data
          this.totalMembers = data.payload.total
          this.members = this.members.concat(data.payload.data)
        })
        .catch(() => this.$message.error('无法获取课程成员'))
        .finally(() => this.membersLoading = false)
    },
    handleMoreMembers() {
      this.membersQuery.page++
      this.refreshCourseMembers()
    },
    handleQuitCourse() {
      quitCourse(this.courseId)
        .then(() => {
          this.$message.success('退出成功')
          this.$router.push('/course?refresh=true')
        })
        .catch(() => this.$message.error('退出失败'))
    },
    handleCloseCourse() {
      closeCourse(this.courseId)
        .then(() => this.$message.success('关闭成功'))
        .finally(() => this.refreshCourse())
    },
    copyToClipboard(item) {
      const input = document.createElement('input')
      input.setAttribute('value', item)
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.clipboardTooltip = '已复制'
      setTimeout(() => {
        this.clipboardTooltip = '点击复制'
      }, 450);
    },
    editCourseProp(prop, oldVal) {
      this.editDialog = true
      this.editProp = prop
      this.editContent = oldVal
    },
    handleUpdateCourseFromInput() {
      this.handleUpdateCourse(this.editProp, this.editContent)
    },
    handleUpdateCourse(prop, value) {
      this.courseLoading = true
      const newCourse = { ...this.course }
      newCourse[prop] = value
      updateCourse(this.courseId, newCourse)
        .then(() => this.editDialog = false)
        .finally(() => this.refreshCourse())
    }
  },
  mounted() {
    this.refreshCourse()
    this.refreshCourseMembers()
  }
}
</script>

<style scoped>
.details {
  width: 100%;
}
.details > tr {
  transition: all 0.2s linear;
}
.details > tr:hover {
  background-color: #f5f5f5;
}
.details > tr > td {
  border-bottom: 1px solid #eee;
  padding: 15px;
}
.details > tr > td:first-child {
  width: 100px;
  font-weight: 500;
}
.detail-label {
  margin-left: 20px;
}

.members-container {
  min-height: 100px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.member-card {
  display: inline-block;
  width: 220px;
  margin-right: 10px;
  margin-bottom: 15px;
}
.member-info-wrapper {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.member-name {
  margin-left: 15px;
}

.detail-item-action {
  margin-left: 15px;
  cursor: pointer;
}
</style>
