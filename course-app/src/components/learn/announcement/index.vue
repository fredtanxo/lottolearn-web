<template>
  <div>
    <el-row
      :gutter="20"
      v-loading="loading"
      style="min-height: calc(100vh - 155px);">
      <div
        v-if="!loading && announcements.length === 0"
        class="no-announcement empty-tip">
        课程还没有发布公告
      </div>
      <el-col
        style="padding-bottom: 20px"
        v-for="announcement in announcements"
        :key="announcement.id">
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
    <el-tooltip
      effect="dark"
      content="发布公告"
      placement="left">
      <el-button
        class="add-button"
        :style="`display: ${this.isTeacher ? 'block' : 'none'};`"
        type="primary"
        icon="el-icon-plus"
        circle
        @click="handleAddAnnouncement">
      </el-button>
    </el-tooltip>
    <el-dialog
      title="新公告"
      :visible.sync="dialog"
      :close-on-click-modal="false"
      width="520px">
      <el-form
        ref="formAnnouncement"
        :model="announcementAdd"
        :rules="announcementAddRules">
        <el-form-item
          label="标题"
          prop="title">
          <el-input
            ref="titleInputRef"
            v-model="announcementAdd.title"
            :disabled="submiting"
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
            :disabled="submiting"
            placeholder="请输入内容">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button
          type="primary"
          icon="el-icon-check"
          :loading="submiting"
          @click="handleAnnouncementSubmit">
          发布
        </el-button>
      </span>
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
import { mapGetters } from 'vuex'

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
        size: 3
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
  computed: mapGetters(['isTeacher', 'nickname']),
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
        .catch(() => this.$message.error('无法获取课程公告'))
        .finally(() => this.loading = false)
    },
    handleAddAnnouncement() {
      this.dialog = true
      this.$nextTick(() => {
        this.$refs.formAnnouncement.resetFields()
        this.$refs.titleInputRef.focus()
      })
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
            this.query.page = 0
            this.announcements = []
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

<style scoped>
.publish-info {
  font-size: 12px;
  color: rgb(128, 128, 128)
}
.add-button {
  position: fixed;
  right: 30px;
  bottom: 20px;
  z-index: 2001;
}
.course-details {
  margin-bottom: 20px;
}
.no-announcement {
  height: calc(100vh - 155px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
