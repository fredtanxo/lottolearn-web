<template>
  <div
    class="stream-container"
    ref="streamContainer">
    <el-button-group class="stream-controller">
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
        v-for="(group, index) in displayPeers"
        :key="index"
        class="stream-video-row-wrapper">
          <video-view
            v-for="peer in group"
            :key="peer.id"
            :audioTrack="peer.audioTrack"
            :videoTrack="peer.videoTrack"
            :nickname="peer.nickname"
            :avatar="peer.avatar"
            :divide="displayPeers.length > 0 ? 3 : group.length"
            :isMe="peer.id === user.id" />
      </div>
    </div>
    <el-button-group class="stream-video-pagination">
      <el-button
        :disabled="noPrev"
        icon="el-icon-arrow-left"
        @click="handlePrev">
      </el-button>
      <el-button
        :disabled="noNext"
        icon="el-icon-arrow-right"
        @click="handleNext">
      </el-button>
    </el-button-group>
  </div>
</template>

<script>
/* eslint-disable */
// JavaScript code is modified from the mediasoup official demo project:
// https://github.com/versatica/mediasoup-demo
// under the MIT license.
import { mapState } from 'vuex'
import { Device } from 'mediasoup-client'
import { Peer, WebSocketTransport } from 'protoo-client'

import config from '@/config'

import VideoView from './view'

export default {
  components: {
    VideoView
  },
  data() {
    return {
      timer: null,
      audio: false,
      video: false,
      screen: false,
      serverUrl: '',
      activePeers: [],
      inactivePeers: [], // [{ id, avatar, nickname, audioTrack, videoTrack }]
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
      page: 0,
      size: 9
    }
  },
  computed: {
    displayPeers() {
      const peersPre = this.activePeers.concat(this.inactivePeers)
      let start = this.page * this.size

      while (start > 0 && start >= peersPre.length) {
        this.page--
        start = this.page * this.size
      }

      const result = []
      for (let i = 0; i < this.size && i + start < peersPre.length; i++) {
        if (i % 3 === 0) {
          result.push([])
        }
        result[result.length - 1].push(peersPre[start + i])
      }
      return result
    },
    noPrev() {
      return this.page <= 0
    },
    noNext() {
      const total = this.activePeers.length + this.inactivePeers.length
      return (this.page + 1) * this.size >= total
    },
    ...mapState({
      roomId: state => state.course.live,
      isTeacher: state => state.course.teacherId === state.user.id,
      user: state => state.user,
      courseId: state => state.course.id
    })
  },
  methods: {
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

      this.$message.success('连接成功')

      // 将自己放入房间
      const me = {
        id: this.user.id,
        avatar: this.user.avatar,
        nickname: this.user.nickname
      }
      this.inactivePeers.push(me)
      this.me = me

      this.inactivePeers.push(...peers)

      // 定时向服务端发送心跳，服务端不处理，仅用于维持连接状态
      this.timer = setInterval(() => {
        this.peer.notify('ping')
      }, 13 * 1000)
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
        this.activePeers.unshift(operationPeer)
      } else {
        this.activePeers = this.activePeers.slice()
      }

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
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60 },
            aspectRatio: { ideal: 1.777777778 } // 16:9
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
      this.activePeers.unshift(this.me)
    },
    pushMeToBack() {
      if (!(this.audio || this.video || this.screen)) {
        this.activePeers = this.activePeers.filter(peer => peer !== this.me)
        this.inactivePeers.unshift(this.me)
      } else {
        this.activePeers = this.activePeers.slice()
      }
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
      this.inactivePeers.push(newPeer)
    },
    handlePeerClosed(notification) {
      const { peerId } = notification.data
      this.activePeers = this.activePeers.filter(peer => peer.id !== peerId)
      this.inactivePeers = this.inactivePeers.filter(peer => peer.id !== peerId)
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
    handlePrev() {
      if (this.noPrev) {
        return
      }
      this.page--
    },
    handleNext() {
      if (this.noNext) {
        return
      }
      this.page++
    }
  },
  mounted() {
    console.log('user:', this.user)
    this.serverUrl = `wss://${config.liveBaseUrl}${config.streamBaseUri}?roomId=${this.roomId}&peerId=${this.user.id}`
    const protooTransport = new WebSocketTransport(this.serverUrl)
    this.peer = new Peer(protooTransport)
    this.peer.on('open', this.handleOpen)
    this.peer.on('failed', this.handleError)
    this.peer.on('request', this.handleRequest)
    this.peer.on('notification', this.handleNotification)
    this.peer.on('disconnected', this.handleDisconnected)
    this.peer.on('close', this.handleClose)
  },
  async beforeDestroy() {
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
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.stream-video-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #313436;
  min-height: 75vh;
}
.stream-video-row-wrapper {
  display: flex;
  justify-content: center;
}
</style>
