<template>
  <div>
    <el-card shadow="hover">
      <div slot="header">
        <el-popconfirm
          v-if="isTeacher"
          confirmButtonText="结束"
          icon="el-icon-info"
          iconColor="red"
          title="确定结束课程？结束课程后其他人将无法加入该课程！"
          @onConfirm="handleCloseCourse">
          <el-link
            slot="reference"
            type="danger">
            <i class="el-icon-close"></i>
            结束课程
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
            <i class="el-icon-close"></i>
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
            <i class="el-icon-coordinate"></i>
            <span class="detail-label">身份</span>
          </td>
          <td>
            <span>{{ userCourse.userNickname }}</span>
            <span
              class="detail-item-action"
              @click="editUserNickname">
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
        <tr v-if="!isTeacher">
          <td>
            <i class="el-icon-connection"></i>
            <span class="detail-label">加入时间</span>
          </td>
          <td>
            <span>{{ userCourse.enrollDate }}</span>
          </td>
        </tr>
      </table>
    </el-card>
    <el-dialog
      :visible.sync="editDialog"
      title="修改"
      width="450px">
      <el-input
        ref="editInputRef"
        v-model="editContent">
      </el-input>
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
    <el-dialog
      :visible.sync="nicknameDialog"
      title="修改身份"
      width="450px">
      <el-input
        ref="nicknameInputRef"
        v-model="editNickname"
        :disabled="userCourseLoading">
      </el-input>
      <span slot="footer">
        <el-button
          type="primary"
          icon="el-icon-check"
          :loading="userCourseLoading"
          @click="handleEditUserCourseNickname">
          完成
        </el-button>
      </span>
    </el-dialog>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import {
  findCourseById,
  findFullCourseById,
  updateCourse,
  quitCourse,
  closeCourse,
  findCourseRatingsByCourseId,
  findUserCourseRating,
  updateCourseRating,
  findUserCourse,
  updateUserCourseNickname
} from '@/api/course'

export default {
  data() {
    return {
      courseLoading: true,
      ratingLoading: false,
      userCourseLoading: false,
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
      nicknameDialog: false,
      editNickname: '',
      userCourse: {
        userNickname: '',
        enrollDate: ''
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
    // 退出课程
    handleQuitCourse() {
      quitCourse(this.courseId)
        .then(() => {
          this.$message.success('退出成功')
          this.$router.push('/course?refresh=true')
        })
        .catch(() => this.$message.error('退出失败'))
    },
    // 结束课程
    handleCloseCourse() {
      closeCourse(this.courseId)
        .then(() => this.$message.success('课程已被结束'))
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
      this.$nextTick(() => this.$refs.editInputRef.focus())
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
    // 刷新课程评价
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
    },
    // 刷新用户课程
    refreshUserCourse() {
      this.userCourseLoading = true
      findUserCourse(this.courseId)
        .then(response => {
          const data = response.data
          this.userCourse = data.payload
        })
        .catch(() => this.$message.error('无法获取用户课程信息'))
        .finally(() => this.userCourseLoading = false)
    },
    // 修改用户身份
    editUserNickname() {
      this.nicknameDialog = true
      this.editNickname = this.userCourse.userNickname
      this.$nextTick(() => this.$refs.nicknameInputRef.focus())
    },
    // 提交修改用户课程身份
    handleEditUserCourseNickname() {
      this.userCourseLoading = true
      this.userCourse.userNickname = this.editNickname
      updateUserCourseNickname(this.courseId, this.userCourse)
        .then(() => {
          this.nicknameDialog = false
          this.$message.success('修改成功')
          this.refreshUserCourse()
        })
        .catch(() => this.$message.error('修改失败'))
        .finally(() => this.userCourseLoading = false)
    }
  },
  mounted() {
    this.refreshCourse()
    this.refreshUserCourse()
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
  background-color: #f5f7fa;
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

.detail-item-action {
  margin-left: 15px;
  cursor: pointer;
}
</style>
