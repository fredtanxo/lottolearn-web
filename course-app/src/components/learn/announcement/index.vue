<template>
  <div>
    <div
      v-if="!loading && announcements.length === 0"
      style="text-align: center; margin: 10vh 0;">
      没有公告
    </div>
    <el-row :gutter="20" v-loading="loading" style="min-height: 50px;">
      <el-col
        style="padding-bottom: 20px"
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
            autofocus
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
          icon="el-icon-check"
          :loading="submiting"
          @click="handleAnnouncementSubmit">
          发布
        </el-button>
      </div>
    </el-dialog>
    <div
      v-if="more"
      style="text-align: center; margin: 25px 0;">
      <el-link
        type="primary"
        :disabled="loading"
        @click="handleMore">
        {{ loading ? '加载中' : '更多' }}
      </el-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { findCourseAnnouncements, addAnnouncement } from '@/api/learn'

export default {
  data() {
    return {
      dialog: false,
      loading: true,
      submiting: false,
      courseId: this.$route.params.courseId,
      total: 0,
      announcements: [],
      more: false,
      query: {
        page: 0,
        size: 1
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
    isTeacher: state => state.course.teacherId === state.user.id,
    nickname: state => state.user.nickname
  }),
  methods: {
    queryCourseAnnouncements() {
      this.loading = true
      findCourseAnnouncements(this.courseId, this.query)
        .then(response => {
          const data = response.data
          this.total = data.payload.total
          this.announcements = this.announcements.concat(data.payload.data)
          this.more = this.announcements.length !== this.total
        })
        .catch(() => this.$message.error('没有加入该课程'))
        .finally(() => this.loading = false)
    },
    handleAddAnnouncement() {
      this.dialog = true
    },
    handleAnnouncementSubmit() {
      this.$refs.formAnnouncement.validate(valid => {
        if (valid) {
          this.submiting = true
          addAnnouncement(this.courseId, {
            ...this.announcementAdd,
            publisher: this.nickname
          })
          .then(() => {
            this.dialog = false
            this.$message.success('发布成功')
            if (this.query.page > 0) {
              this.query.page++
            }
            this.queryCourseAnnouncements()
            this.$refs.formAnnouncement.resetFields()
          })
          .catch(() => this.$message.error('发布失败'))
          .finally(() => this.submiting = false)
        }
      })
    },
    handleMore() {
      this.query.page++
      this.queryCourseAnnouncements()
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
