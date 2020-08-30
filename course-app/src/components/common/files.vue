<template>
  <div>
    <button id="upload-trigger-file" style="display: none;"></button>
    <div id="upload-target-file"></div>
    <el-table
      v-loading="filesLoading"
      style="padding: 10px;"
      :data="files">
      <el-table-column
        prop="name"
        label="文件名">
      </el-table-column>
      <el-table-column
        prop="size"
        label="文件大小"
        width="150"
        align="center">
        <template slot-scope="scope">
          {{ scope.row.size / 1000 }} KB
        </template>
      </el-table-column>
      <el-table-column
        prop="uploadDate"
        label="上传日期"
        align="center">
      </el-table-column>
      <el-table-column
        v-if="mode !== 2"
        prop="status"
        label="状态"
        align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0">待处理</span>
          <span v-if="scope.row.status === 1">处理中</span>
          <span v-if="scope.row.status === 2">处理成功</span>
          <span v-if="scope.row.status === 3">处理失败</span>
          <span v-if="scope.row.status === 4">无需处理</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100"
        align="center">
        <template slot-scope="scope">
          <el-link
            :href="scope.row.accessUrl"
            target="_blank"
            type="primary">
            下载
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { Uppy } from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import Webcam from '@uppy/webcam'
import ScreenCapture from '@uppy/screen-capture'
// import XHRUpload from '@uppy/xhr-upload'
import Tus from '@uppy/tus';
import CnLocale from '@uppy/locales/lib/zh_CN'

// import Cookies from 'js-cookie'

import { findChapterFiles, findResourceItems } from '@/api/resource'

export default {
  props: {
    mode: Number, // 0: 资源库， 1: 章节媒体， 2:章节文件
    chapterId: String,
    endpoint: String
  },
  data() {
    return {
      courseId: this.$route.params.courseId,
      filesLoading: true,
      files: []
    }
  },
  computed: mapState({
    isTeacher: state => state.course.teacherId === state.user.id
  }),
  methods: {
    refreshChapterFiles() {
      this.filesLoading = true
      findChapterFiles(this.chapterId)
        .then(response => {
          const data = response.data
          this.files = data.payload.data
        })
        .catch(() => this.$message.error('无法获取文件'))
        .finally(() => this.filesLoading = false)
    },
    refreshResourceFiles() {
      this.filesLoading = true
      findResourceItems(this.courseId)
        .then(response => {
          const data = response.data
          this.files = data.payload.data
        })
        .catch(() => this.$message.error('无法获取文件'))
        .finally(() => this.filesLoading = false)
    },
    refresh() {
      switch (this.mode) {
        case 0:
        case 1:
          this.refreshResourceFiles()
          break
        case 2:
          this.refreshChapterFiles()
          break
      }
    }
  },
  mounted() {
    this.refresh()
    if (!this.isTeacher || this.mode === 1) {
      return
    }

    let restrictions = {
      maxFileSize: 4 * 1024 * 1024 * 1024 // Bytes
    }

    if (this.mode === 0) {
      restrictions = {
        ...restrictions,
        allowedFileTypes: ['video/*']
      }
    }

    const uppy = new Uppy({
      debug: true,
      autoProceed: false,
      inline: true,
      replaceTargetContent: true,
      locale: CnLocale,
      restrictions: restrictions
    })
    .use(Dashboard, {
      trigger: '#upload-trigger-file',
      inline: true,
      target: '#upload-target-file',
      replaceTargetContent: true,
      showProgressDetails: true,
      width: '100%',
      metaFields: [
        { id: 'name', name: '文件名', placeholder: '文件名' },
      ],
    })
    .use(Webcam, { target: Dashboard, locale: CnLocale })
    .use(ScreenCapture, { target: Dashboard, locale: CnLocale })
    // .use(XHRUpload, {
    //   endpoint: this.endpoint,
    //   headers: {
    //     Authorization: `Bearer ${Cookies.get('token')}`
    //   }
    // })
    .use(Tus, {
      endpoint: this.endpoint,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        ['App-Data']: `courseId=${this.courseId},chapterId=${this.chapterId}`
      }
    })
    uppy.on('upload-success', () => this.refresh())
  }
}
</script>

<style>
@import '~@uppy/core/dist/style.css';
@import '~@uppy/dashboard/dist/style.css';
@import '~@uppy/webcam/dist/style.css';
@import '~@uppy/screen-capture/dist/style.css';
</style>
