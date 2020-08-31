<template>
  <div class="sign-container">
    <el-page-header
      v-if="details"
      @back="handleBack">
      <div slot="content">
        <span>{{ this.current }} 的签到</span>
        <el-link
          type="primary"
          :underline="false"
          style="margin: 0 25px;">
          下载数据
        </el-link>
      </div>
    </el-page-header>
    <el-table
      v-if="details"
      v-loading="loading"
      :data="courseSignRecordData">
      <el-table-column
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
        prop="id"
        label="ID">
      </el-table-column>
      <el-table-column
        width="90"
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
  </div>
</template>

<script>
import { findCourseSigns, findCourseSignRecord } from '@/api/course';

export default {
  data() {
    return {
      params: {
        page: 1,
        size: 20,
        courseId: this.$route.params.courseId,
      },
      total: 0,
      details: false,
      loading: true,
      current: '',
      courseSignData: [],
      courseSignRecordData: []
    }
  },
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
      this.current = signDate
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
    }
  },
  mounted() {
    this.refreshSignData()
  }
}
</script>

<style>

</style>