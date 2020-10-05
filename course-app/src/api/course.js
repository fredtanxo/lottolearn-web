import Network from '@/api'

export const findUserCourses = params => {
  return Network.get(`/course/user`, params)
}

export const findCourseById = courseId => {
  return Network.get(`/course/id/${courseId}`)
}

export const findFullCourseById = courseId => {
  return Network.get(`/course/full/id/${courseId}`)
}

export const findCourseMembers = (courseId, params) => {
  return Network.get(`/course/members/id/${courseId}`, params)
}

export const addCourse = params => {
  return Network.post('/course/new', params)
}

export const joinCourse = code => {
  return Network.put(`/course/invitation/${code}`)
}

export const findAllTerms = () => {
  return Network.get('/term/all')
}

export const addTerm = params => {
  return Network.post('/term/new', params)
}

export const findCourseSigns = params => {
  return Network.get('/course/sign', params)
}

export const findCourseSignRecord = (courseId, signId) => {
  return Network.get(`/course/sign/${signId}/records?courseId=${courseId}`)
}

export const quitCourse = courseId => {
  return Network.delete(`/course/user/id/${courseId}`)
}

export const closeCourse = courseId => {
  return Network.delete(`/course/${courseId}`)
}
