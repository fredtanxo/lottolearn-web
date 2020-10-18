export const UPDATE_USER = 'UPDATE_USER'
export const UPDATE_COURSE = 'UPDATE_COURSE'
export const UPDATE_LEARNING = 'UPDATE_LEARNING'
export const SET_CHAT_READY = 'SET_CHAT_READY'
export const SET_STREAM_READY = 'SET_STREAM_READY'
export const SET_MEMBERS = 'SET_MEMBERS'

const mutations = {
  [UPDATE_USER](state, payload) {
    state.user = payload
  },
  [UPDATE_COURSE](state, payload) {
    state.course = payload
  },
  [UPDATE_LEARNING](state, payload) {
    state.learning = payload
  },
  [SET_CHAT_READY](state, payload) {
    state.chatReady = payload
    state.ready = state.chatReady && state.streamReady
  },
  [SET_STREAM_READY](state, payload) {
    state.streamReady = payload
    state.ready = state.chatReady && state.streamReady
  },
  [SET_MEMBERS](state, payload) {
    state.members = payload
  }
}

export default mutations
