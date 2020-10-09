<template>
  <div>
    <el-row
      style="min-height: 200px;"
      :gutter="10"
      v-loading="loading">
      <div
        class="no-chapter"
        v-if="!loading && (!chapters || chapters.length == 0)">
        没有章节
      </div>
      <el-col
        :sm="24"
        :md="12"
        v-for="chapter in chapters" :key="chapter.id">
        <div
          class="chapter-item-wrapper"
          @click="handleLearnChapter(chapter.id, chapter.name)">
          <el-card shadow="hover">
            <div slot="header">
              <span style="font-weight: bold; line-height: 1em;">
                {{ chapter.name }}
              </span>
            </div>
            <div class="chapter-detail-item">
              <i class="el-icon-time"></i>
              <span>{{ chapter.lasts }} 分钟</span>
            </div>
            <div class="chapter-detail-item">
              <i class="el-icon-date"></i>
              <span>{{ chapter.pubDate }}</span>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
    <div>
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
      :style="`display: ${this.isTeacher ? 'block' : 'none'};`"
      type="primary"
      icon="el-icon-plus"
      circle
      @click="handleAddChapter">
    </el-button>
    <el-dialog
      title="新章节"
      :visible.sync="dialog"
      :close-on-click-modal="false"
      destroy-on-close>
      <el-form
        ref="formChapter"
        label-width="80px"
        :model="chapterAdd"
        :rules="chapterAddRules">
        <el-form-item
          label="章节名称"
          prop="name">
          <el-input
            v-model="chapterAdd.name"
            autofocus
            placeholder="请输入章节名称">
          </el-input>
        </el-form-item>
        <el-form-item
          label="时长"
          prop="lasts">
          <el-input-number
            v-model="chapterAdd.lasts"
            label="请输入章节学习用时">
          </el-input-number>
          分钟
        </el-form-item>
      </el-form>
      <div style="padding-top: 10px; text-align: center;">
        <el-button
          type="primary"
          icon="el-icon-check"
          :loading="submiting"
          @click="handleChapterSubmit">
          发布
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { findCourseChapters, addChapter } from '@/api/learn'

export default {
  name: 'select',
  data() {
    return {
      courseId: this.$route.params.courseId,
      dialog: false,
      loading: true,
      submiting: false,
      activeChapter: '',
      chapters: [],
      total: 0,
      query: {
        page: 0,
        size: 8
      },
      chapterAdd: {
        name: '',
        lasts: 0
      },
      chapterAddRules: {
        name: [
          { required: true, message: '必须提供章节名称', trigger: 'blur' }
        ],
        lasts: [
          { required: true, message: '必须提供学习时长', trigger: 'blur' },
          { type: 'number', message: '学习时长必须是数字' }
        ]
      }
    }
  },
  computed: mapState({
    isTeacher: state => state.course.teacherId === state.user.id,
    nickname: state => state.user.nickname
  }),
  methods: {
    ...mapActions(['updateLearning']),
    queryCourseChapters() {
      this.loading = true
      findCourseChapters(this.courseId, this.query)
        .then(response => {
          const data = response.data
          this.chapters = data.payload.data
          this.total = data.payload.total
        })
        .catch(() => this.$message.error('无法加载章节信息'))
        .finally(() => this.loading = false)
    },
    handleLearnChapter(chapterId, chapterName) {
      this.updateLearning(chapterName)
      this.$router.push(`/learn/${this.courseId}/teach-and-learn/chapter/learning/${chapterId}`)
    },
    handleAddChapter() {
      this.dialog = true
    },
    handleChapterSubmit() {
      this.$refs.formChapter.validate(valid => {
        if (valid) {
          this.submiting = true
          addChapter(this.courseId, this.chapterAdd)
            .then(() => {
              this.dialog = false
              this.$message.success('发布成功')
              this.queryCourseChapters()
              this.$refs.formChapter.resetFields()
            })
            .catch(() => this.$message.error('发布失败'))
            .finally(() => this.submiting = false)
        }
      })
    },
    handlePageChange(page) {
      this.query.page = page - 1
      this.queryCourseChapters()
    }
  },
  mounted() {
    this.queryCourseChapters()
  }
}
</script>

<style>
.chapter-item-wrapper {
  margin-bottom: 20px;
  cursor: pointer;
}
.chapter-detail-item {
  padding: 5px;
}
.chapter-detail-item > span {
  margin-left: 10px;
}
.no-chapter {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
