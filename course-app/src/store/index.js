import mutations from './mutations'
import actions from './actions'

const state = {
  user: {}, // 存储当前用户
  course: {}, // 存储当前正在学习的课程
  learning: undefined, // 正在学习的章节名称
  ready: false, // 是否准备好直播
  chatReady: false,
  streamReady: false,
  members: new Map() // 直播房间内成员
}

export default {
  state,
  mutations,
  actions
}
