import { UPDATE_USER, UPDATE_COURSE, UPDATE_LEARNING } from './mutations'

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
  }
}

export default actions
