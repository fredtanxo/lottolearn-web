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
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="copyToClipboard(course.id)">
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
        <tr>
          <td>
            <i class="el-icon-star-off"></i>
            <span class="detail-label">评分</span>
          </td>
          <td>
            <el-rate
              v-model="course.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
              style="display: inline-block;">
            </el-rate>
            <span
              v-if="isTeacher"
              class="detail-item-action"
              @click="viewCourseRatings">
              <el-tooltip
                effect="dark"
                content="点击查看"
                placement="top">
                <i class="el-icon-view"></i>
              </el-tooltip>
            </span>
            <span
              v-else
              class="detail-item-action"
              @click="editCourseRating">
              <el-tooltip
                effect="dark"
                content="点击评价"
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
    <el-dialog
      :visible.sync="editDialog"
      title="修改"
      width="450px">
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
    <el-dialog
      :visible.sync="ratingDialog"
      title="评价课程"
      width="450px">
      <div v-if="isTeacher">
        <el-rate
          v-model="course.rating"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value}"
          style="text-align: center; margin-bottom: 25px; transform: scale(1.5);">
        </el-rate>
        <el-card
          v-for="rating in ratings"
          :key="rating.id"
          shadow="hover"
          class="rating-detail-card">
          <el-rate
            :value="rating.rating"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}"
            style="display: inline-block;">
          </el-rate>
          <div style="margin: 5px 0;">
            <span class="rating-meta">{{ rating.userNickname }}</span>
            <span class="rating-meta">{{ rating.rateDate }}</span>
          </div>
          <div style="margin-top: 10px;">
            {{ rating.comment }}
          </div>
        </el-card>
      </div>
      <div v-else>
        <el-rate
          v-model="ratingForm.rating"
          style="text-align: center; margin-bottom: 25px; transform: scale(1.5);">
        </el-rate>
        <el-input
          type="textarea"
          :autosize="{ minRows: 5 }"
          :disabled="ratingLoading"
          placeholder="请输入评价内容"
          v-model="ratingForm.comment">
        </el-input>
      </div>
      <span
        v-if="isTeacher"
        slot="footer">
        <el-pagination
          background
          layout="prev, pager, next"
          :page-size="ratingsQuery.size"
          :total="totalRatings"
          @current-change="handleRatingPageChange"
          hide-on-single-page>
        </el-pagination>
      </span>
      <span
        v-else
        slot="footer">
        <span
          v-if="ratingForm.rateDate"
          style="font-size: 14px; color: #909399; padding-right: 1em;">
          {{ `最近更新：${ratingForm.rateDate}` }}
        </span>
        <el-button
          type="primary"
          icon="el-icon-check"
          :loading="ratingLoading"
          @click="handleSubmitRating">
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
import { mapGetters } from 'vuex'

import {
  findCourseById,
  findFullCourseById,
  findCourseMembers,
  updateCourse,
  quitCourse,
  closeCourse,
  findCourseRatingsByCourseId,
  findUserCourseRating,
  updateCourseRating
} from '@/api/course'

export default {
  data() {
    return {
      courseLoading: true,
      membersLoading: true,
      ratingLoading: false,
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
        credit: '',
        rating: 0
      },
      totalMembers: 0,
      members: [],
      membersQuery: {
        page: 0,
        size: 16
      },
      editDialog: false,
      ratingDialog: false,
      ratingForm: {
        rating: 0,
        comment: ''
      },
      totalRatings: 0,
      ratings: [],
      ratingsQuery: {
        page: 0,
        size: 10
      },
      editProp: '',
      editContent: '',
      courseId: this.$route.params.courseId,
      clipboardTooltip: '点击复制',
      switchTooltip: '点击切换',
      editTooltip: '点击编辑'
    }
  },
  computed: mapGetters(['isTeacher']),
  watch: {
    isTeacher() {
      this.refreshCourse()
    }
  },
  methods: {
    // 刷新课程信息
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
    // 刷新课程成员列表
    refreshCourseMembers() {
      this.membersLoading = true
      findCourseMembers(this.courseId, this.membersQuery)
        .then(response => {
          const data = response.data
          this.totalMembers = data.payload.total
          this.members = this.members.concat(data.payload.data)
        })
        .catch(() => this.$message.error('无法获取课程成员列表'))
        .finally(() => this.membersLoading = false)
    },
    // 课程成员列表分页
    handleMoreMembers() {
      this.membersQuery.page++
      this.refreshCourseMembers()
    },
    // 退出课程
    handleQuitCourse() {
      quitCourse(this.courseId)
        .then(() => {
          this.$message.success('退出成功')
          this.$router.push('/course?refresh=true')
        })
        .catch(() => this.$message.error('退出失败'))
    },
    // 关闭课程
    handleCloseCourse() {
      closeCourse(this.courseId)
        .then(() => this.$message.success('关闭成功'))
        .finally(() => this.refreshCourse())
    },
    // 复制到剪切板
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
      }, 480);
    },
    // 修改课程信息
    editCourseProp(prop, oldVal) {
      this.editDialog = true
      this.editProp = prop
      this.editContent = oldVal
    },
    // 提交课程信息修改
    handleUpdateCourseFromInput() {
      this.handleUpdateCourse(this.editProp, this.editContent)
    },
    // 修改课程信息
    handleUpdateCourse(prop, value) {
      this.courseLoading = true
      const newCourse = { ...this.course }
      newCourse[prop] = value
      updateCourse(this.courseId, newCourse)
        .then(() => this.editDialog = false)
        .finally(() => this.refreshCourse())
    },
    refreshCourseRatings() {
      findCourseRatingsByCourseId(this.courseId, this.ratingsQuery)
        .then(response => {
          const data = response.data
          this.totalRatings = data.payload.total
          this.ratings = data.payload.data
        })
        .catch(() => this.$message.error('无法获取评价信息'))
    },
    // 查看课程评价
    viewCourseRatings() {
      this.ratingDialog = true
      this.refreshCourseRatings()
    },
    // 课程评价分页
    handleRatingPageChange(page) {
      this.ratingsQuery.page = page - 1
      this.refreshCourseRatings()
    },
    // 修改课程评分
    editCourseRating() {
      this.ratingLoading = true
      this.ratingDialog = true
      findUserCourseRating(this.courseId)
        .then(response => {
          const data = response.data
          this.ratingForm = { ...this.ratingForm, ...data.payload }
        })
        .catch(() => this.$message.error('无法获取个人评价'))
        .finally(() => this.ratingLoading = false)
    },
    // 提交课程评分
    handleSubmitRating() {
      this.ratingLoading = true
      updateCourseRating(this.courseId, this.ratingForm)
        .then(() => {
          this.ratingDialog = false
          this.$message.success('评价成功')
        })
        .catch(() => this.$message.error('评价失败'))
        .finally(() => this.ratingLoading = false)
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

.rating-detail-card {
  margin: 15px 0;
}
.rating-meta {
  color: #909399;
  font-size: 12px;
  padding-right: 1em;
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
