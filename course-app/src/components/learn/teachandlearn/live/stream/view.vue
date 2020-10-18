<template>
  <div
    ref="vidRef"
    :class="{'video-mask': true, 'one': isOne}"
    @mouseover="handleShowControls"
    @mouseout="handleHideControls">
    <div
      :class="{'avatar-wrapper': true, 'one': isOne}"
      :style="`display: ${!this.videoActive || this.selected ? 'block' : 'none'};`">
      <el-avatar
        :class="{'stream-avatar': !isOne, 'stream-avatar-one': isOne}"
        :size="this.isOne ? 100 : 45"
        :src="avatar">
        {{ nickname ? nickname.charAt(0) : '' }}
      </el-avatar>
    </div>
    <div :class="{'stream-item-wrapper': true, 'one': isOne}">
      <video
        ref="svideo"
        class="stream-video"
        autoplay
        playsInline
        muted
        :style="`display: ${this.videoActive && !this.selected ? 'block' : 'none'}`" />
        <audio
          ref="saudio"
          class="stream-audio"
          autoplay
          playsInline />
    </div>
    <div
      ref="vidCtl"
      :style="`display: ${this.videoActive ? 'flex' : 'none'}`"
      :class="{'stream-video-control': true, 'one': isOne}">
      <el-button
        v-if="!selected"
        type="primary"
        circle
        icon="el-icon-full-screen"
        :size="this.isOne ? 'medium' : 'mini'"
        @click="handleVideoFullScreen">
      </el-button>
      <el-button
        v-if="!selected && !isOne"
        type="warning"
        circle
        icon="el-icon-view"
        :size="this.isOne ? 'medium' : 'mini'"
        @click="handleSelectMainSpeaker">
      </el-button>
      <el-button
        v-if="!selected"
        type="success"
        circle
        icon="el-icon-top-right"
        :size="this.isOne ? 'medium' : 'mini'"
        @click="handleVideoPictureInPicture">
      </el-button>
    </div>
    <div
      v-if="selected"
      class="selected-tip"
      :style="`display: ${this.selected ? 'flex' : 'none'}`">
      <span style="margin-top: -0.5em;">
        <i
          class="el-icon-view"
          style="font-size: 1.8em;">
        </i>
      </span>
    </div>
    <div :class="{'video-nickname': !isOne, 'video-nickname-one': isOne}">
      {{ nickname ? nickname : '' }}
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
    isMe: Boolean,
    isOne: Boolean,
    peer: Object,
    selectMainSpeaker: Function
  },
  data() {
    return {
      audioActive: false,
      videoActive: false,
      selected: false
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
  methods: {
    handleNewTrack(track, kind) {
      const stream = new MediaStream()
      stream.addTrack(track)
      switch (kind) {
        case 'audio':
          this.$refs.saudio.srcObject = stream
          this.audioActive = true
          if (this.isMe || this.isOne) {
            this.$refs.saudio.muted = true
          }
          this.$refs.saudio.play()
          if (this.selected) {
            this.$refs.saudio.pause()
          }
          this.$refs.vidRef.classList.add('video-mask-active')
          break
        case 'video':
          this.$refs.svideo.srcObject = stream
          this.$refs.svideo.play()
          if (this.selected) {
            this.$refs.svideo.pause()
          } else {
            this.videoActive = true
          }
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
    },
    handleVideoPictureInPicture() {
      this.$refs.svideo.requestPictureInPicture()
    },
    deselectMainSpeakerCallback() {
      if (!this.$refs.svideo) { // 不在同一页
        return
      }
      if (this.audioTrack) {
        this.$refs.saudio.play()
      }
      if (this.videoTrack) {
        this.$refs.svideo.play()
        this.videoActive = true
      }
      this.selected = false
    },
    handleSelectMainSpeaker() {
      if (this.audioTrack) {
        this.$refs.saudio.pause()
      }
      if (this.videoTrack) {
        this.$refs.svideo.pause()
      }
      this.selectMainSpeaker(this.peer, this.deselectMainSpeakerCallback)
      this.selected = true
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
  border: 2px solid #5d6065;
  border-radius: 4px;
  position: relative;
  margin: 1px;
  width: 160px;
  height: 100px;
  display: inline-block;
  overflow: hidden;
}
.video-mask-active {
  border: 2px solid #409EFF !important;
}

.one {
  height: inherit !important;
  width: 100% !important;
}

.stream-item-wrapper {
  height: 100px;
  width: 160px;
  position: absolute;
}
.stream-video {
  width: 100%;
  height: 100%;
}

.stream-video-control {
    position: absolute;
    width: 160px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    background-color: rgba(0,0,0,0.2);
    transition: all 0.25s ease-out;
}
.stream-video-control-show {
  opacity: 1 !important;
}

.avatar-wrapper {
  width: 160px;
  height: 100px;
  position: absolute;
}
.stream-avatar {
  display: block;
  margin: 0 auto;
  position: relative;
  top: 20px;
}
.stream-avatar-one {
  display: block;
  margin: 0 auto;
  position: relative;
  top: calc(45vh - 160px);
}

.video-nickname {
  position: absolute;
  width: 100%;
  top: calc(102px - 1.8em);
  text-align: center;
  line-height: 1.8em;
  color: #fafafa;
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.6);
}
.video-nickname-one {
  position: absolute;
  padding: 0 1em;
  top: calc(100vh - 290px - 1.8em);
  text-align: center;
  line-height: 1.8em;
  color: #fafafa;
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.6);
}

.selected-tip {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fafafa;
  width: 100%;
  height: 100%;
  font-size: 14px;
  background-color: rgba(0,0,0,0.6);
}
</style>
