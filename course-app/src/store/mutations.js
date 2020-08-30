export const UPDATE_USER = 'UPDATE_USER'
export const UPDATE_COURSE = 'UPDATE_COURSE'
export const UPDATE_LEARNING = 'UPDATE_LEARNING'

const mutations = {
  [UPDATE_USER](state, payload) {
    state.user = payload
  },
  [UPDATE_COURSE](state, payload) {
    state.course = payload
  },
  [UPDATE_LEARNING](state, payload) {
    state.learning = payload
  }
}

export default mutations
