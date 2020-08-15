export const UPDATE_USER = 'UPDATE_USER'
export const UPDATE_COURSE = 'UPDATE_COURSE'

const mutations = {
  [UPDATE_USER](state, payload) {
    state.user = payload
  },
  [UPDATE_COURSE](state, payload) {
    state.course = payload
  }
}

export default mutations
