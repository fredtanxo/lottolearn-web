<template>
  <div>
    <el-row>
      <el-col :span="12">
        <el-radio-group
          v-model="query.teacher"
          size="medium"
          @change="queryCourseList">
          <el-radio-button label="">所有</el-radio-button>
          <el-radio-button label="false">我学的</el-radio-button>
          <el-radio-button label="true">我教的</el-radio-button>
        </el-radio-group>
      </el-col>
      <el-col
        :span="12"
        style="text-align: right">
        <el-radio-group
          v-model="query.status"
          size="medium"
          @change="queryCourseList">
          <el-radio-button label="0">未开始</el-radio-button>
          <el-radio-button label="1">正在进行</el-radio-button>
          <el-radio-button label="2">已结束</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row
      style="min-height: 200px;"
      :gutter="25"
      v-loading="loading">
      <div
        class="no-course"
        v-if="!loading && (!list || list.length == 0)">
        没有课程
      </div>
      <el-col
        style="padding-top: 20px;"
        :sm="12"
        :md="8"
        v-for="course in list"
        :key="course.id">
        <div
          @click="handleLearn(course.id)"
          style="cursor: pointer;">
          <el-card shadow="hover">
            <div
              slot="header"
              style="overflow: hidden; text-overflow: ellipsis;">
              <span style="white-space: nowrap; font-weight: bold;">
                {{ course.name }}
              </span>
            </div>
            <div class="course-detail-item">
              <i class="el-icon-medal"></i>
              <span>{{ course.credit }} 学分</span>
            </div>
            <div class="course-detail-item">
              <i class="el-icon-user"></i>
              <span>{{ course.teacherName }}</span>
            </div>
            <div class="course-detail-item">
              <i class="el-icon-date"></i>
              <span>{{ course.termName }}</span>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <div style="margin: 15px 0;">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="query.size"
        :total="total"
        @current-change="handlePageChange"
        hide-on-single-page>
      </el-pagination>
    </div>

    <el-button
      class="add-button"
      type="primary"
      icon="el-icon-plus"
      circle
      @click="handleAddCourse">
    </el-button>
    <el-dialog
      title="新课程"
      :visible.sync="dialog"
      destroy-on-close>
      <add-course :callback="afterAddCourseCallback"></add-course>
    </el-dialog>
  </div>
</template>

<script>
import AddCourse from './add'

import * as CourseApi from '@/api/course'

export default {
  components: {
    AddCourse
  },
  data() {
    return {
      dialog: false,
      loading: true,
      list: [],
      total: 0,
      query: {
        page: 0,
        size: 12,
        teacher: '',
        status: '1'
      }
    }
  },
  methods: {
    queryCourseList() {
      this.loading = true
      CourseApi.findUserCourses(this.query)
        .then(response => {
          const data = response.data
          this.total = data.payload.total
          this.list = data.payload.data
        })
        .catch(() => this.$message.error('无法获取课程列表'))
        .finally(() => this.loading = false)
    },
    handlePageChange(page) {
      this.query.page = page - 1
      this.queryCourseList()
    },
    handleLearn(courseId) {
      this.$router.push(`/learn/${courseId}`)
    },
    handleAddCourse() {
      this.dialog = true
    },
    afterAddCourseCallback() {
      this.queryCourseList()
    }
  },
  mounted() {
    this.queryCourseList()
  }
}
</script>

<style>
.course-detail-item {
  padding: 5px;
}
.course-detail-item > span {
  margin-left: 10px;
}
.no-course {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.course-info {
  padding: 14px;
}
.course-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.teacher-info {
  margin-top: 10px;
  margin-bottom: 5px;
}
.el-avatar {
  vertical-align: middle;
}
.teacher-name {
  font-size: 12px;
  margin-left: 10px;
  vertical-align: middle;
}
.add-button {
  position: fixed;
  right: 25px;
  bottom: 50px;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}
</style>
