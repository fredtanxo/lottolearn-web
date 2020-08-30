<template>
  <div
    class="chapter-container"
    v-loading="mediaLoading">
    <div
      data-shaka-player-container
      v-if="hasMedia"
      ref="cvideo"
      class="chapter-media">
      <video
        data-shaka-player
        ref="video"
        class="chapter-video">
      </video>
    </div>
    <div
      v-else
      style="text-align: center; padding: 30vh 0 0;">
      <div>章节没有视频资源</div>
    </div>
    <div class="chapter-resource">
      <el-button
        v-if="isTeacher"
        type="primary"
        @click="dialogTableVisible = true"
        style="margin-right: 10px;">
        选择章节视频
      </el-button>
      <el-dialog 
        width="80vw"
        title="选择视频资源"
        :visible.sync="dialogTableVisible"
        destroy-on-close>
        <files-view
          :mode="1"
          :chapterId="chapterId"
          :callback="afterLinkSuccess">
        </files-view>
      </el-dialog>
      <el-button @click="handleViewChapterFiles">
        章节文件
      </el-button>
      <el-drawer
        size="50%"
        :visible.sync="filesDrawer"
        :with-header="false"
        :chapterId="chapterId"
        destroy-on-close>
        <files-view
          :mode="2"
          :chapterId="chapterId"
          :endpoint="`https://storage.lottolearn.com/files/upload`">
        </files-view>
      </el-drawer>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import shaka from 'shaka-player/dist/shaka-player.ui'

import FilesView from '@/components/common/files'

import { findChapterMedia } from '@/api/resource'
import { mapState } from 'vuex'

export default {
  components: {
    FilesView
  },
  data() {
    return {
      dialogTableVisible: false,
      libraryData: [],
      courseId: this.$route.params.courseId,
      chapterId: this.$route.params.chapterId,
      mediaLoading: true,
      hasMedia: false,
      player: null,
      ui: null,
      controls: null,
      mediaSrc: '',
      teacher: true,
      filesDrawer: false
    }
  },
  computed: mapState({
    isTeacher: state => state.course.teacherId === state.user.id
  }),
  methods: {
    afterLinkSuccess() {
      this.dialogTableVisible = false
      this.refreshChapterMedia()
    },
    initPlayer() {
      const video = this.$refs.video
      const videoContainer = this.$refs.cvideo
      const player = new shaka.Player(video)
      this.player = player
      const ui = new shaka.ui.Overlay(player, videoContainer, video)
      this.ui = ui

      this.controls = ui.getControls()
      player.configure({
        streaming: {
          bufferingGoal: 10,
          rebufferingGoal: 2,
          bufferBehind: 120
        }
      })

      player.addEventListener('error', this.playerErrorHandler)
      
      player.load(this.mediaSrc)
        .catch(error => this.playerErrorHandler(error))
    },
    playerErrorHandler(error) {
      this.$message.error('播放器出现错误，请重试')
      console.error(error)
    },
    handleViewChapterFiles() {
      this.filesDrawer = true
    },
    refreshChapterMedia() {
      findChapterMedia(this.chapterId)
        .then(response => {
          const data = response.data
          if (data.payload) {
            this.mediaSrc = data.payload.accessUrl
            this.hasMedia = true
          }
        })
        .catch(() => this.$message.error('无法获取章节媒体'))
        .finally(() => this.mediaLoading = false)
    }
  },
  mounted() {
    this.refreshChapterMedia()
  },
  updated() {
    if (this.hasMedia && !this.player) {
      this.initPlayer()
    }
  },
  beforeDestroy() {
    if (this.player) {
      this.player.destroy()
    }
  }
}
</script>

<style>
@import '~shaka-player/dist/controls.css';

.chapter-resource {
  margin: 20px 0 0;
  display: flex;
  justify-content: center;
}
.chapter-media {
  display: flex;
  justify-content: space-around;
  margin: 0 auto;
  max-width: 75vw;
  width: max-content;
}
.chapter-video {
  width: 100%;
  height: 100%;
}
.el-drawer {
  overflow-y: scroll;
}
</style>
