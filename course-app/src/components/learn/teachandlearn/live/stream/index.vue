<template>
  <div
    class="stream-container"
    ref="streamContainer"
    v-loading="ready && !initialized">
    <el-button-group
      class="stream-controller"
      :style="`visibility: ${this.initialized ? 'visible' : 'hidden'}`">
      <!-- 麦克风 -->
      <el-button
        v-if="audio"
        type="primary"
        icon="el-icon-microphone"
        @click="disableMicrophone">
      </el-button>
      <el-button
        v-else
        icon="el-icon-microphone"
        @click="enableMicrophone">
      </el-button>
      <!-- 摄像头 -->
      <el-button
        v-if="video"
        type="primary"
        icon="el-icon-video-camera"
        @click="disableCamera">
      </el-button>
      <el-button
        v-else
        icon="el-icon-video-camera"
        @click="enableCamera">
      </el-button>
      <!-- 屏幕共享 -->
      <el-button
        v-if="screen"
        type="primary"
        icon="el-icon-data-line"
        @click="disableShareScreen">
      </el-button>
      <el-button
        v-else
        icon="el-icon-data-line"
        @click="enableShareScreen">
      </el-button>
    </el-button-group>
    <div class="stream-video-wrapper">
      <div
        ref="streamVideoAllRef"
        class="stream-video-all"
        @mouseenter="handleShowPagination"
        @mouseleave="() => this.pagination = false">
        <el-button
          ref="prevRef"
          class="stream-video-pagination pagination-left"
          type="primary"
          circle
          size="mini"
          icon="el-icon-arrow-left"
          :style="`display: ${this.pagination ? 'block' : 'none'}`"
          @click="handlePrev">
        </el-button>
        <div class="video-view-wrapper" ref="videoViewWrapperRef">
          <video-view
            v-for="(peer, index) in displayPeers"
            :key="peer.id"
            :ref="`videoViewRef${index}`"
            :audioTrack="peer.audioTrack"
            :videoTrack="peer.videoTrack"
            :nickname="peer.userNickname"
            :avatar="peer.userAvatar"
            :isMe="peer.id === user.id"
            :isOne="false"
            :peer="peer"
            :selectMainSpeaker="selectMainSpeaker" />
        </div>
        <el-button
          ref="nextRef"
          type="primary"
          class="stream-video-pagination pagination-right"
          circle
          size="mini"
          icon="el-icon-arrow-right"
          :style="`display: ${this.pagination ? 'block' : 'none'}`"
          @click="handleNext">
        </el-button>
      </div>
      <div class="stream-video-one">
        <el-button
          v-if="!autoplay && !ready"
          type="primary"
          icon="el-icon-right"
          style="display: block; margin: 0 auto;"
          @click="setStreamReady(true)">
          进入直播
        </el-button>
        <video-view
          v-if="mainSpeaker"
          :audioTrack="mainSpeaker.audioTrack"
          :videoTrack="mainSpeaker.videoTrack"
          :nickname="mainSpeaker.userNickname"
          :avatar="mainSpeaker.userAvatar"
          :isMe="mainSpeaker.id === user.id"
          :isOne="true"
          :peer="peer"
          :selectMainSpeaker="selectMainSpeaker" />
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
// JavaScript code is modified from the mediasoup official demo project:
// https://github.com/versatica/mediasoup-demo
// under the MIT license.
import { mapState, mapActions, mapGetters } from 'vuex'
import { Device } from 'mediasoup-client'
import { Peer, WebSocketTransport } from 'protoo-client'

import config from '@/config'

import VideoView from './view'

export default {
  props: {
    roomId: String
  },
  components: {
    VideoView
  },
  data() {
    return {
      initialized: false,
      timer: null,
      audio: false,
      video: false,
      screen: false,
      serverUrl: '',
      activePeers: [],
      inactivePeers: [], // [{ id, avatar, nickname, audioTrack, videoTrack }]
      mainSpeaker: undefined,
      mainSpeakerCallback: undefined,
      peer: null, // 当前用户
      me: null,
      device: null,
      transports: {
        sendTransport: null,
        receiveTransport: null
      },
      producers: {
        audioProducer: null,
        videoProducer: null,
        screenProducer: null,
      },
      peerConsumers: new Map(), // (peerId, Set(consumer))
      pagination: false,
      observer: undefined, // ResizeObserver
      pageSize: 1, // 一次滚动的数量
      parentRef: undefined, //成员列表父容器
      childRef: undefined // 成员列表
    }
  },
  computed: {
    displayPeers() {
      return this.activePeers.concat(this.inactivePeers)
    },
    ...mapGetters(['isTeacher']),
    ...mapState(['autoplay']),
    ...mapState({
      user: state => state.user,
      courseId: state => state.course.id,
      teacherId: state => state.course.teacherId,
      members: state => state.members,
      ready: state => state.ready
    })
  },
  watch: {
    ready(val) {
      if (val && !this.initialized) {
        this.init()
      }
    }
  },
  methods: {
    ...mapActions(['setStreamReady']),
    init() {
      if (!this.user.id) { // 未拉取到用户数据
        setTimeout(() => {
          this.init()
        }, 1000)
        return
      }
      this.serverUrl = `wss://${config.liveBaseUrl}${config.streamBaseUri}?roomId=${this.roomId}&peerId=${this.user.id}`
      const protooTransport = new WebSocketTransport(this.serverUrl)
      this.peer = new Peer(protooTransport)
      this.peer.on('open', this.handleOpen)
      this.peer.on('failed', this.handleError)
      this.peer.on('request', this.handleRequest)
      this.peer.on('notification', this.handleNotification)
      this.peer.on('disconnected', this.handleDisconnected)
      this.peer.on('close', this.handleClose)
      this.initialized = true
    },
    handleError(error) {
      this.$message.error('连接失败')
      console.error(error)
    },
    async handleOpen() {
      this.device = new Device()
      const routerRtpCapabilities = await this.peer.request('getRouterRtpCapabilities')
      await this.device.load({ routerRtpCapabilities })

      try {
        this.registerSendTransport()
        this.registerReceiveTransport()
      } catch (error) {
        this.$message.error('连接失败')
        console.error(error)
      }
    },
    async registerSendTransport() {
      // 创建用于发送的transport (i.e. producer)
      const sendTransportInfo = await this.peer.request('createWebRtcTransport', {
        forceTcp         : false,
        producing        : true,
        consuming        : false,
        sctpCapabilities : this.device.sctpCapabilities
      })

      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      } = sendTransportInfo

      this.transports.sendTransport = this.device.createSendTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers: [],
        proprietaryConstraints: { optional: [{ gooDscp: true }] }
      })

      this.transports.sendTransport.on(
        'connect', ({ dtlsParameters }, callback, errback) => {
        this.peer.request('connectWebRtcTransport', {
          transportId: this.transports.sendTransport.id,
          dtlsParameters
        })
        .then(callback)
        .catch(errback)
      })
      this.transports.sendTransport.on(
        'produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        const { id } = await this.peer.request('produce', {
          transportId: this.transports.sendTransport.id,
          kind,
          rtpParameters,
          appData
        })
        callback({ id })
      })
    },
    async registerReceiveTransport() {
      // 创建用于接收的transport(i.e. consumer)
      const recvTransportInfo = await this.peer.request('createWebRtcTransport', {
        forceTcp         : false,
        producing        : false,
        consuming        : true,
        sctpCapabilities : this.device.sctpCapabilities
      })

      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      } = recvTransportInfo

      this.transports.receiveTransport = this.device.createRecvTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers: []
      })

      this.transports.receiveTransport.on(
        'connect', ({ dtlsParameters }, callback, errback) => {
        this.peer.request('connectWebRtcTransport', {
          transportId: this.transports.receiveTransport.id,
          dtlsParameters
        })
        .then(callback)
        .catch(errback)
      })

      // 必须在ReceiveTransport创建完成后才能加入，
      // 否则服务端在join的时候无法获取到transport，
      // 从而无法创建相应的consumer
      this.join()
    },
    async join() {
      const { peers } = await this.peer.request('join', {
        nickname: this.user.nickname,
        avatar: this.user.avatar,
        rtpCapabilities: this.device.rtpCapabilities,
        sctpCapabilities: this.device.sctpCapabilities
      })

      // 将自己放入房间
      const me = this.members.get(this.user.id)
      me.id = `${this.user.id}`
      this.inactivePeers.push(me)
      this.me = me

      this.inactivePeers.push(...peers.map(p => {
        // 合并member和peer
        const member = this.members.get(Number.parseInt(p.id))
        // 服务端传回来的id为String类型，因此member.id也变为String类型，
        // member.id == member.userId --> true,
        // member.id === member.userId --> false.
        member.id = p.id
        return member
      }))

      this.refreshVideoViewArrangements()

      // 定时向服务端发送心跳，服务端不处理，仅用于维持连接状态
      this.timer = setInterval(() => {
        this.peer.notify('ping')
      }, 30 * 1000)
    },
    handleRequest(request, accept, reject) {
      switch (request.method) {
        case 'newConsumer':
          this.handleNewConsumer(request, accept, reject)
          break
      }
    },
    async handleNewConsumer(request, accept, reject) {
      const {
        peerId,
        producerId,
        id,
        kind,
        rtpParameters,
        type,
        appData,
        producerPaused
      } = request.data

      const consumer = await this.transports.receiveTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
        appData
      })

      let consumersSet = this.peerConsumers.get(peerId)
      if (!consumersSet) {
        consumersSet = new Set()
      }
      consumersSet.add(consumer)
      this.peerConsumers.set(peerId, consumersSet)
      consumer.on('transportclose', () => {
        this.peerConsumers.get(peerId).delete(consumer)
      })

      let operationPeer = this.activePeers.find(peer => peer.id === peerId)

      const active = !!operationPeer
      if (!active) {
        operationPeer = this.inactivePeers.find(peer => peer.id === peerId)
      }

      switch (consumer.kind) {
        case 'audio':
          operationPeer.audioTrack = consumer.track
          break
        case 'video':
          operationPeer.videoTrack = consumer.track
          break
      }

      if (!active) {
        this.inactivePeers = this.inactivePeers.filter(peer => peer.id !== peerId)
        if (this.activePeers.length) {
          let index = 1
          switch (consumer.kind) {
            case 'audio':
              index = this.activePeers.findIndex(p => !p.videoTrack)
              if (index === -1) {
                index = this.activePeers.length
              }
              break
            case 'video':
              if (!this.mainSpeaker.videoTrack || operationPeer.userId === this.teacherId) {
                index = 0
              }
              break
          }
          this.activePeers.splice(index, 0, operationPeer)
        } else {
          this.activePeers.unshift(operationPeer)
        }
      } else {
        this.activePeers = this.activePeers.slice()
      }

      this.refreshVideoViewArrangements()

      accept()
    },
    async enableMicrophone() {
      if (this.audio) {
        return
      }
      this.audio = true
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const track = stream.getAudioTracks()[0]

        this.producers.audioProducer = await this.transports.sendTransport.produce({
          track,
          codecOptions: { opusStereo: 1, opusDtx: 1 }
        })

        this.producers.audioProducer.on('transportclose', () => {
          this.audio = false
          this.producers.audioProducer = null
        })
        this.producers.audioProducer.on('trackend', () => this.disableMicrophone())

        this.cloneTrackToSelf(track)

        if (this.refreshSelf()) {
          return
        }
        this.pushMeToFront()
      } catch (error) {
        console.error(error)
        this.audio = false
      }
    },
    async disableMicrophone() {
      if (!this.audio) {
        return
      }
      this.audio = false
      this.producers.audioProducer.close()
      await this.peer.request('closeProducer', {
        producerId: this.producers.audioProducer.id
      })
      this.producers.audioProducer = null

      this.closeSelfTrack('audio')

      this.pushMeToBack()
    },
    async enableCamera() {
      if (this.video) {
        return
      } else if (this.screen) {
        this.disableShareScreen()
      }
      this.video = true
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        const track = stream.getVideoTracks()[0]
        const codecOptions = { videoGoogleStartBitrate: 1000 }
        const encodings = [
          { scaleResolutionDownBy: 4, maxBitrate: 500000 },
          { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
          { scaleResolutionDownBy: 1, maxBitrate: 5000000 }
        ]
        this.producers.videoProducer = await this.transports.sendTransport.produce({
          track,
          // encodings,
          // codecOptions
        })
        this.producers.videoProducer.on('transportclose', () => {
          this.video = false
          this.producers.videoProducer = null
        })
        this.producers.videoProducer.on('trackended', () => this.disableCamera())

        this.cloneTrackToSelf(track)

        if (this.refreshSelf()) {
          return
        }
        this.pushMeToFront()
      } catch (error) {
        console.error(error)
        this.video = false
      }
    },
    async disableCamera() {
      if (!this.video) {
        return
      }
      this.video = false
      this.producers.videoProducer.close()
      await this.peer.request('closeProducer', {
        producerId: this.producers.videoProducer.id
      })
      this.producers.videoProducer = null

      this.closeSelfTrack('video')

      this.pushMeToBack()
    },
    async enableShareScreen() {
      if (this.screen) {
        return
      } else if (this.video) {
        this.disableCamera()
      }
      this.screen = true
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          audio: false,
          video: {
            displaySurface: 'monitor',
            logicalSurface: true,
            cursor: true,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 60 }
          }
        })
        const track = stream.getVideoTracks()[0]
        const encodings = [
          { dtx: true, maxBitrate: 1500000 },
          { dtx: true, maxBitrate: 6000000 }
        ]
        const codecOptions = { videoGoogleStartBitrate : 1000 }
        this.producers.screenProducer = await this.transports.sendTransport.produce({
          track,
          // encodings,
          // codecOptions,
          appData: { share: true }
        })
        this.producers.screenProducer.on('transportclose', () => {
          this.screen = false
          this.producers.screenProducer = null
        })
        this.producers.screenProducer.on('trackended', () => this.disableShareScreen())

        this.cloneTrackToSelf(track)

        if (this.refreshSelf()) {
          return
        }
        this.pushMeToFront()
      } catch (error) {
        console.error(error)
        this.screen = false
      }
    },
    async disableShareScreen() {
      if (!this.screen) {
        return
      }
      this.screen = false
      this.producers.screenProducer.close()
      await this.peer.request('closeProducer', {
        producerId: this.producers.screenProducer.id
      })
      this.producers.screenProducer = null

      this.closeSelfTrack('video')

      this.pushMeToBack()
    },
    // track给一份自己作预览
    cloneTrackToSelf(track) {
      switch (track.kind) {
        case 'audio':
          this.me.audioTrack = track.clone()
          break
        case 'video':
          this.me.videoTrack = track.clone()
          break
      }
    },
    // 把自己的track关闭
    closeSelfTrack(kind) {
      switch (kind) {
        case 'audio':
          this.me.audioTrack.stop()
          this.me.audioTrack = null
          break
        case 'video':
          this.me.videoTrack.stop()
          this.me.videoTrack = null
      }
    },
    refreshSelf() {
      if (this.activePeers.find(peer => peer === this.me)) {
        this.activePeers = this.activePeers.slice()
        return true
      }
      return false
    },
    pushMeToFront() {
      this.inactivePeers = this.inactivePeers.filter(peer => peer !== this.me)
      if (this.activePeers.length) {
        let index = 1
        if (!this.me.videoTrack) {
          index = this.activePeers.findIndex(p => !p.videoTrack)
          if (index === -1) {
            index = this.activePeers.length
          }
        } else {
          if (!this.mainSpeaker.videoTrack || this.user.id === this.teacherId) {
            index = 0
          }
        }
        this.activePeers.splice(index, 0, this.me)
      } else {
        this.activePeers.unshift(this.me)
      }

      this.refreshVideoViewArrangements()
    },
    pushMeToBack() {
      if (!(this.audio || this.video || this.screen)) {
        this.activePeers = this.activePeers.filter(peer => peer !== this.me)
        this.inactivePeers.unshift(this.me)
      } else {
        this.activePeers = this.activePeers.slice()
      }
      this.refreshVideoViewArrangements()
    },
    handleNotification(notification) {
      switch (notification.method) {
        case 'newPeer':
          this.handleNewPeer(notification)
          break
        case 'peerClosed':
          this.handlePeerClosed(notification)
          break
        case 'consumerClosed':
          this.handleConsumerClosed(notification)
          break
        case 'consumerPaused':
          this.handleConsumerPaused(notification)
          break
        case 'consumerResumed':
          this.handleConsumerResumed(notification)
          break
      }
    },
    handleNewPeer(notification) {
      const newPeer = notification.data
      const member = this.members.get(Number.parseInt(newPeer.id))
      member.id = newPeer.id
      this.inactivePeers.push(member)
      this.refreshVideoViewArrangements()
    },
    handlePeerClosed(notification) {
      const { peerId } = notification.data
      this.activePeers = this.activePeers.filter(peer => peer.id !== peerId)
      this.inactivePeers = this.inactivePeers.filter(peer => peer.id !== peerId)
      this.refreshVideoViewArrangements()
    },
    handleConsumerClosed(notification) {
      const { consumerId, peerId } = notification.data
      const consumer = [...this.peerConsumers.get(peerId)]
        .find(c => c.id === consumerId)
      if (consumer) {
        consumer.close()
        this.peerConsumers.delete(consumer)
        const operationPeer = this.activePeers.find(peer => peer.id === peerId)
        switch (consumer.kind) {
          case 'audio':
            operationPeer.audioTrack = null
            break
          case 'video':
            operationPeer.videoTrack = null
            break
        }
        if (!operationPeer.audioTrack && !operationPeer.videoTrack) {
          this.activePeers = this.activePeers.filter(peer => peer.id !== peerId)
          this.inactivePeers.unshift(operationPeer)
        } else {
          this.activePeers = this.activePeers.slice()
        }
        this.refreshVideoViewArrangements()
      }
    },
    handleConsumerPaused(notification) {
      const { consumerId, peerId } = notification.data
      const consumer = [...this.peerConsumers.get(peerId)]
        .find(c => c.id === consumerId)
      if (consumer) {
        consumer.pause()
      }
    },
    handleConsumerResumed(notification) {
      const { consumerId, peerId } = notification.data
      const consumer = [...this.peerConsumers.get(peerId)]
        .find(c => c.id === consumerId)
      if (consumer) {
        consumer.resume()
      }
    },
    handleDisconnected() {
      this.transports.sendTransport.close()
      this.transports.sendTransport = null
    },
    handleClose() {
      this.peer.close()
      if (this.transports.sendTransport) {
        this.transports.sendTransport.close()
      }
      if (this.transports.receiveTransport) {
        this.transports.receiveTransport.close()
      }
    },
    handleShowPagination() {
      if (this.childRef.offsetWidth > this.parentRef.offsetWidth) {
        this.pagination = true
      }
    },
    // 上一页
    handlePrev() {
      if (this.childRef.offsetWidth < this.parentRef.offsetWidth) {
        return
      }
      const match = this.childRef.style.transform.match(/translateX\((\d+\.?\d+)px\)/)
      const oldPos = match ? match[1] : 0
      const newPos = oldPos + this.pageSize * 166
      this.childRef.style.transform = `translateX(${newPos > 0 ? 0 : newPos}px)`
    },
    // 下一页
    handleNext() {
      if (this.childRef.offsetWidth < this.parentRef.offsetWidth) {
        return
      }
      const match = this.childRef.style.transform.match(/translateX\((\d+\.?\d+)px\)/)
      const oldPos = match ? match[1] : 0
      const newPos = oldPos - this.pageSize * 166
      const diff = this.childRef.offsetWidth - this.parentRef.offsetWidth
      const minPos = diff < 0 ? 0 : -diff
      this.childRef.style.transform = `translateX(${newPos < minPos ? minPos : newPos}px)`
    },
    // 选择放大显示的成员
    selectMainSpeaker(peer, callback) {
      if (this.mainSpeakerCallback) {
        this.mainSpeakerCallback()
      }
      this.mainSpeakerCallback = callback
      this.mainSpeaker = peer
    },
    // 处理容器宽度变更事件
    handleObserve() {
      let timer = undefined
      return (entries) => {
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          const width = entries[0].contentRect.width
          let sz = Number.parseInt(width / 166) + 1
          if (sz <= 0) {
            sz = 1
          }
          this.pageSize = sz
          this.refreshVideoViewArrangements()
        }, 500) // 延迟0.5秒减少不必要计算
      }
    },
    // 刷新成员视图布局
    refreshVideoViewArrangements() {
      this.$nextTick(() => {
        if (this.childRef.offsetWidth < this.parentRef.offsetWidth) {
          this.childRef.style.transform = `translateX(${(this.parentRef.offsetWidth - this.childRef.offsetWidth) / 2}px`
        } else {
          const match = this.childRef.style.transform.match(/translateX\((\d+\.?\d+)px\)/)
          if (match && match[1] > 0) {
            this.childRef.style.transform = `translateX(0px)`
          }
        }
      })
    }
  },
  mounted() {
    document.documentElement.scrollTo({
      top: 60,
      behavior: 'smooth'
    })

    if (this.autoplay) {
      this.setStreamReady(true)
    }

    this.observer = new ResizeObserver(this.handleObserve())
    this.observer.observe(this.$refs.streamVideoAllRef)

    this.parentRef = this.$refs.streamVideoAllRef
    this.childRef = this.$refs.videoViewWrapperRef
  },
  updated() {
    if (!this.mainSpeaker || !this.mainSpeaker.videoTrack) {
      if (this.$refs.videoViewRef0) {
        this.$refs.videoViewRef0[0].handleSelectMainSpeaker()
      }
    }
  },
  async beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.screen) {
      this.disableShareScreen()
    } else if (this.video) {
      this.disableCamera()
    }
    if (this.audio) {
      this.disableMicrophone()
    }
    if (this.peer) {
      this.peer.close()
    }
    if (this.transports.sendTransport) {
      this.transports.sendTransport.close()
    }
    if (this.transports.receiveTransport) {
      this.transports.receiveTransport.close()
    }
    this.setStreamReady(false)
  }
}
</script>

<style>
.stream-controller {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.stream-video-pagination {
  position: absolute;
  top: calc(50px - 14px);
  z-index: 20;
}
.pagination-left {
  left: 10px;
}
.pagination-right {
  right: 10px;
}
.pagination-show {
  display: block;
}

.stream-video-all {
  position: relative;
  height: 104px;
  white-space: nowrap;
  overflow: hidden;
  text-align: center;
}

.stream-video-one {
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-self: center;
  height: calc(100vh - 290px);
}

.stream-video-wrapper {
  background-color: #313436;
  height: calc(100vh - 180px);
}
.stream-video-row-wrapper {
  display: flex;
  justify-content: center;
}

.video-view-wrapper {
  position: absolute;
  transition: transform 0.45s ease-out;
}
</style>
