import mutations from './mutations'
import actions from './actions'

const state = {
  user: {}, // 存储当前用户
  course: {}, // 存储当前正在学习的课程
  learning: false // 正在学习章节
}

export default {
  state,
  mutations,
  actions
}
