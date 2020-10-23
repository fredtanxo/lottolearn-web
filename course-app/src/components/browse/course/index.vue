<template>
  <div>
    <el-row>
      <el-col :span="12">
        <el-radio-group
          v-model="query.teacher"
          size="medium"
          @change="queryCourseList">
          <el-radio-button :label="null">
            <i class="el-icon-receiving"></i>
            所有
          </el-radio-button>
          <el-radio-button :label="false">
            <i class="el-icon-notebook-2"></i>
            我学的
          </el-radio-button>
          <el-radio-button :label="true">
            <i class="el-icon-mic"></i>
            我教的
          </el-radio-button>
        </el-radio-group>
      </el-col>
      <el-col
        :span="12"
        style="text-align: right">
        <el-radio-group
          v-model="query.status"
          size="medium"
          @change="queryCourseList">
          <el-radio-button :label="0">
            <i class="el-icon-more-outline"></i>
            未开始
          </el-radio-button>
          <el-radio-button :label="1">
            <i class="el-icon-date"></i>
            进行中
          </el-radio-button>
          <el-radio-button :label="2">
            <i class="el-icon-finished"></i>
            已结束
          </el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row
      style="min-height: calc(100vh - 195px);"
      :gutter="25"
      v-loading="loading">
      <div
        class="no-course"
        v-if="!loading && (!list || list.length == 0)">
        <span
          v-if="query.status === 0"
          class="empty-tip">
          没有未开始的课程
        </span>
        <span
          v-if="query.status === 1"
          class="empty-tip">
          没有进行中的课程<br />
          点击右下方按钮创建/加入课程
        </span>
        <span
          v-if="query.status === 2"
          class="empty-tip">
          没有已结束的课程
        </span>
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
              class="course-name">
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
    <el-tooltip
      effect="dark"
      content="创建课程"
      placement="left">
      <el-button
        class="add-button"
        type="primary"
        icon="el-icon-plus"
        circle
        @click="addDialog = true">
      </el-button>
    </el-tooltip>
    <el-tooltip
      effect="dark"
      content="加入课程"
      placement="left">
      <el-button
        class="join-button"
        type="primary"
        icon="el-icon-link"
        circle
        @click="joinDialog = true">
      </el-button>
    </el-tooltip>
    <join-course
      :joinDialog="joinDialog"
      :setJoinDialog="setJoinDialog"
      :callback="afterAddCourseCallback">
    </join-course>
    <add-course
      :addDialog="addDialog"
      :setAddDialog="setAddDialog"
      :callback="afterAddCourseCallback">
    </add-course>
  </div>
</template>

<script>
import AddCourse from './add'
import JoinCourse from './join'

import * as CourseApi from '@/api/course'

export default {
  components: {
    AddCourse,
    JoinCourse
  },
  data() {
    return {
      addDialog: false,
      joinDialog: false,
      loading: true,
      list: [],
      total: 0,
      query: {
        page: 0,
        size: 12,
        teacher: null,
        status: 1
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
    },
    setAddDialog(flag) {
      this.addDialog = flag
    },
    setJoinDialog(flag) {
      this.joinDialog = flag
    }
  },
  mounted() {
    this.queryCourseList()
  },
  activated() {
    if (location.search.indexOf('refresh=true') !== -1) {
      this.queryCourseList()
    }
  }
}
</script>

<style scoped>
.course-detail-item {
  padding: 5px;
}
.course-detail-item > span {
  margin-left: 10px;
}
.no-course {
  height: calc(100vh - 155px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.course-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.join-button {
  position: fixed;
  right: 30px;
  bottom: 75px;
  z-index: 2001;
}
.add-button {
  position: fixed;
  right: 30px;
  bottom: 20px;
  z-index: 2001;
}
</style>
