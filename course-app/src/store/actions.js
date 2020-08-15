import { UPDATE_USER, UPDATE_COURSE } from './mutations'

import { currentUser } from '@/api/auth'
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
  }
}

export default actions
