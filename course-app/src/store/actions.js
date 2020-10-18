import {
  UPDATE_USER,
  UPDATE_COURSE,
  UPDATE_LEARNING,
  SET_CHAT_READY,
  SET_STREAM_READY,
  SET_MEMBERS,
} from './mutations'

import { currentUser } from '@/api/user'
import { findCourseById } from '@/api/course'

const actions = {
  updateUser({ commit }) {
    currentUser()
      .then(response => {
        const data = response.data
        commit(UPDATE_USER, data.payload)
      })
  },
  updateCourse({ commit }, courseId) {
    findCourseById(courseId)
      .then(response => {
        const data = response.data
        commit(UPDATE_COURSE, data.payload)
      })
  },
  updateLearning({ commit }, learning) {
    commit(UPDATE_LEARNING, learning)
  },
  setChatReady({ commit }, chatReady) {
    commit(SET_CHAT_READY, chatReady)
  },
  setStreamReady({ commit }, streamReady) {
    commit(SET_STREAM_READY, streamReady)
  },
  setMembers({ commit }, members) {
    commit(SET_MEMBERS, members)
  }
}

export default actions
