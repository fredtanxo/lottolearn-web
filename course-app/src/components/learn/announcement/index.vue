<template>
  <div>
    <el-card
      shadow="hover"
      class="box-card course-details">
      <div slot="header">
        <span style="font-weight: bold;">{{ this.course.name }}</span>
        <el-popconfirm
          v-if="isTeacher"
          title="关闭后其他人将无法加入该课程"
          confirmButtonText="关闭"
          iconColor="red"
          @onConfirm="handleCloseCourse">
          <el-button
            slot="reference"
            style="float: right; padding: 3px 0"
            type="text">
            关闭课程
          </el-button>
        </el-popconfirm>
      </div>
      <div style="line-height: 2em;">
        <b>课程描述：</b>{{ course.description }}<br />
        <span v-if="isTeacher">
          <b>课程邀请码：</b><code>{{ course.code }}</code><br />
        </span>
        <b>课程学分：</b>{{ course.credit }}<br />
        <b>课程发布时间：</b>{{ course.pubDate }}<br />
      </div>
    </el-card>
    <el-divider>
      <i class="el-icon-receiving"></i>
    </el-divider>
    <div
      v-if="announcements.length === 0"
      style="text-align: center; margin: 10vh 0;">
      没有公告
    </div>
    <el-row :gutter="20">
      <el-col
        style="padding-bottom: 20px"
        :md="24" :lg="12"
        v-for="announcement in announcements"
        :key="announcement.id"
      >
        <el-card shadow="hover">
          <div
            style="font-size: 1.5em; font-weight: bold; text-align: center;"
            slot="header">
            <span>{{ announcement.title }}</span>
          </div>
            <div v-html="announcement.content"></div>
          <el-divider></el-divider>
          <div class="publish-info">
            {{ `${announcement.publisher} · ${announcement.pubDate}`}}
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-button
      class="add-button"
      :style="`display: ${this.isTeacher ? 'block' : 'none'};`"
      type="primary"
      icon="el-icon-plus"
      circle
      @click="handleAddAnnouncement">
    </el-button>
    <el-dialog
      title="新公告"
      :visible.sync="dialog"
      :close-on-click-modal="false"
      destroy-on-close>
      <el-form
        ref="formAnnouncement"
        :model="announcementAdd"
        :rules="announcementAddRules">
        <el-form-item
          label="标题"
          prop="title">
          <el-input
            v-model="announcementAdd.title"
            placeholder="请输入标题">
          </el-input>
        </el-form-item>
        <el-form-item
          label="内容"
          prop="content">
          <el-input
            type="textarea"
            :rows="8"
            v-model="announcementAdd.content"
            placeholder="请输入内容">
          </el-input>
        </el-form-item>
      </el-form>
      <div style="padding-top: 10px; text-align: center;">
        <el-button
          type="primary"
          :loading="loading"
          @click="handleAnnouncementSubmit">
          发布
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { closeCourse } from '@/api/course'
import { findCourseAnnouncements, addAnnouncement } from '@/api/learn'

export default {
  data() {
    return {
      dialog: false,
      loading: false,
      courseId: this.$route.params.courseId,
      total: 0,
      announcements: [],
      query: {
        page: 0,
        size: 20
      },
      announcementAdd: {
        title: '',
        content: ''
      },
      announcementAddRules: {
        title: [
          { required: true, message: '必须提供公告标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '必须提供公告内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: mapState({
    course: state => state.course,
    isTeacher: state => state.course.teacherId === state.user.id,
    nickname: state => state.user.nickname
  }),
  methods: {
    queryCourseAnnouncements() {
      findCourseAnnouncements(this.courseId, this.query)
        .then(response => {
          const data = response.data
          this.total = data.payload.total
          this.announcements = data.payload.data
        })
    },
    handleAddAnnouncement() {
      this.dialog = true
    },
    handleAnnouncementSubmit() {
      this.$refs.formAnnouncement.validate(valid => {
        if (valid) {
          this.loading = true
          addAnnouncement(this.courseId, {
            ...this.announcementAdd,
            publisher: this.nickname
          })
          .then(() => {
            this.dialog = false
            this.$message.success('发布成功')
            this.queryCourseAnnouncements()
            this.$refs.formAnnouncement.resetFields()
          })
          .catch(() => this.$message.error('发布失败'))
          .finally(() => this.loading = false)
        }
      })
    },
    handleCloseCourse() {
      closeCourse(this.courseId)
        .then(() => this.$message.success('关闭成功'))
        .catch(() => this.$message.error('关闭失败'))
      
    }
  },
  mounted() {
    this.queryCourseAnnouncements()
  }
}
</script>

<style>
.publish-info {
  font-size: 12px;
  color: rgb(128, 128, 128)
}
.add-button {
  position: fixed;
  right: 25px;
  bottom: 50px;
}
.course-details {
  margin-bottom: 20px;
}
</style>
