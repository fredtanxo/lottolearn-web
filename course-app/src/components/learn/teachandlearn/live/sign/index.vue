<template>
  <el-dialog
    :visible="courseSignDialog"
    @close="() => setSignDialog(false)">
    <el-page-header
      slot="title"
      v-if="details"
      @back="handleBack">
      <div slot="content">
        <span>{{ this.currentSignDate }} 的签到</span>
      </div>
    </el-page-header>
    <span
      slot="title"
      v-else
      class="sign-header">
      签到记录
    </span>
    <el-table
      v-if="details"
      v-loading="loading"
      :data="courseSignRecordData">
      <el-table-column
        width="100"
        prop="userId"
        label="用户ID">
      </el-table-column>
      <el-table-column
        align="center"
        prop="userNickname"
        label="用户名">
      </el-table-column>
      <el-table-column
        align="center"
        prop="signTime"
        label="签到时间">
      </el-table-column>
      <el-table-column
        align="center"
        prop="success"
        label="状态">
        <template slot-scope="scope">
          {{ scope.row.success ? '签到成功' : '签到失败' }}
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-else
      v-loading="loading"
      :data="courseSignData">
      <el-table-column
        width="100"
        prop="id"
        label="ID">
      </el-table-column>
      <el-table-column
        align="center"
        prop="timeout"
        label="时长（秒）">
      </el-table-column>
      <el-table-column
        align="center"
        prop="signDate"
        label="时间">
      </el-table-column>
      <el-table-column
        width="70"
        align="center"
        prop="signDate"
        label="操作">
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="refreshSignDetail(scope.row.id, scope.row.signDate)">
            详情
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <span
      slot="footer"
      v-if="details">
      <el-button
        type="primary"
        icon="el-icon-download"
        :loading="downloading"
        @click="handleDownloadDetails">
        下载数据
      </el-button>
    </span>
    <span
      slot="footer"
      v-else>
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="params.size"
        :total="total"
        @current-change="handlePageChange"
        hide-on-single-page>
      </el-pagination>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'

import config from '@/config'
import { findCourseSigns, findCourseSignRecord } from '@/api/course'

export default {
  props: {
    courseSignDialog: Boolean,
    setSignDialog: Function
  },
  data() {
    return {
      params: {
        page: 0,
        size: 10,
        courseId: this.$route.params.courseId
      },
      total: 0,
      details: false,
      loading: true,
      currentSignId: '',
      currentSignDate: '',
      courseSignData: [],
      courseSignRecordData: [],
      downloading: false
    }
  },
  computed: mapState({
    courseName: state => state.course.name
  }),
  methods: {
    refreshSignData() {
      this.loading = true
      findCourseSigns(this.params)
        .then(response => {
          const data = response.data
          if (data.payload) {
            this.courseSignData = data.payload.data
            this.total = data.payload.total
          }
        })
        .catch(() => this.$message.error('获取签到记录失败'))
        .finally(() => this.loading = false)
    },
    refreshSignDetail(signId, signDate) {
      this.loading = true
      this.details = true
      this.currentSignId = signId
      this.currentSignDate = signDate
      findCourseSignRecord(this.params.courseId, signId)
        .then(response => {
          const data = response.data
          if (data.payload) {
            this.courseSignRecordData = data.payload.data
            this.total = data.payload.total
          }
        })
        .catch(() => this.$message.error('获取签到记录失败'))
        .finally(() => this.loading = false)
    },
    handleBack() {
      this.details = false
      this.courseSignRecordData.length = 0
    },
    handlePageChange(page) {
      this.params.page = page - 1
      this.refreshSignData()
    },
    handleDownloadDetails() {
      this.downloading = true
      fetch(`${config.apiBaseUrl}/course/sign/${this.currentSignId}/download?courseId=${this.params.courseId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      })
      .then(response => response.blob())
      .then(data => {
        const a = document.createElement('a')
        a.download = `签到记录 - ${this.courseName} - ${this.currentSignDate}.xls`
        a.href = URL.createObjectURL(data)
        a.click()
        URL.revokeObjectURL(data)
      })
      .catch(() => this.$message.error('下载失败'))
      .finally(() => this.downloading = false)
    }
  },
  mounted() {
    this.refreshSignData()
  }
}
</script>

<style scoped>
.sign-header {
  float: left;
  font-size: 18px;
  margin-left: 5px;
  line-height: 60px;
}
</style>