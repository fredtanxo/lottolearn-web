<template>
  <div
    ref="vidRef"
    class="video-mask"
    @mouseover="handleShowControls"
    @mouseout="handleHideControls"
    :style="`width: ${this.vidWidth}%;`">
    <div
      class="avatar-wrapper"
      :style="`display: ${!videoActive ? 'block' : 'none'};`">
      <el-avatar
        style="width: 10vmin; height: 10vmin;"
        size="large"
        :src="avatar">
        {{ nickname.charAt(0) }}
      </el-avatar>
    </div>
    <div class="stream-item-wrapper">
      <video
        ref="svideo"
        class="stream-video"
        autoplay
        playsInline
        muted
        :style="`display: ${this.videoActive ? 'block' : 'none'}`" />
        <audio
          ref="saudio"
          class="stream-audio"
          autoplay
          playsInline />
    </div>
    <div
      ref="vidCtl"
      :style="`display: ${this.videoActive ? 'flex' : 'none'}`"
      class="stream-video-control">
      <el-button
        type="primary"
        circle
        icon="el-icon-full-screen"
        @click="handleVideoFullScreen">
      </el-button>
    </div>
    <div class="video-nickname">
      {{ nickname }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    audioTrack: MediaStreamTrack,
    videoTrack: MediaStreamTrack,
    nickname: String,
    avatar: String,
    divide: Number,
    isMe: Boolean
  },
  data() {
    return {
      audioActive: false,
      videoActive: false
    }
  },
  watch: {
    audioTrack(newTrack) {
      if (newTrack) {
        this.handleNewTrack(newTrack, 'audio')
      } else {
        this.audioActive = false
        this.$refs.vidRef.classList.remove('video-mask-active')
      }
    },
    videoTrack(newTrack) {
      if (newTrack) {
        this.handleNewTrack(newTrack, 'video')
      } else {
        this.videoActive = false
      }
    }
  },
  computed: {
    vidWidth() {
      return 100 / this.divide
    }
  },
  methods: {
    handleNewTrack(track, kind) {
      const stream = new MediaStream()
      stream.addTrack(track)
      switch (kind) {
        case 'audio':
          this.$refs.saudio.srcObject = stream
          this.audioActive = true
          if (this.isMe) {
            this.$refs.saudio.muted = true
          }
          this.$refs.saudio.play()
          this.$refs.vidRef.classList.add('video-mask-active')
          break
        case 'video':
          this.$refs.svideo.srcObject = stream
          this.videoActive = true
          this.$refs.svideo.play()
          break
      }
    },
    handleShowControls() {
      this.$refs.vidCtl.classList.add('stream-video-control-show')
    },
    handleHideControls() {
      this.$refs.vidCtl.classList.remove('stream-video-control-show')
    },
    handleVideoFullScreen() {
      this.$refs.svideo.requestFullscreen()
    }
  },
  mounted() {
    if (this.audioTrack) {
      this.handleNewTrack(this.audioTrack, 'audio')
    }
    if (this.videoTrack) {
      this.handleNewTrack(this.videoTrack, 'video')
    }
  }
}
</script>

<style>
.video-mask {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #5d6065;
  border-radius: 4px;
  box-sizing: border-box;
  height: 28vmin;
  position: relative;
  margin: 1px;
}
.video-mask-active {
  border: 2px solid #409EFF !important;
}

.stream-item-wrapper {
  height: calc(28vmin - 4px);
}
.stream-video {
  width: 100%;
  height: 100%;
}
.stream-video-control {
    position: absolute;
    background-color: rgba(0,0,0,0.6);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: all 0.25s ease-out;
}
.stream-video-control-show {
  opacity: 1 !important;
}

.video-nickname {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  line-height: 3vmin;
  color: #fff;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.5);
}
.el-avatar {
  margin-top: -20px;
}
</style>
