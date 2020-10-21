import Network from '@/api'

export const findCourseAnnouncements = (courseId, params) => {
  return Network.get(`/announcement/course/${courseId}`, params)
}

export const addAnnouncement = (courseId, params) => {
  return Network.post(`/announcement/course/${courseId}`, params)
}

export const findCourseChapters = (courseId, params) => {
  return Network.get(`/chapter/course/${courseId}`, params)
}

export const addChapter = (courseId, params) => {
  return Network.post(`/chapter/course/${courseId}`, params)
}

export const requestLiveCourse = courseId => {
  return Network.post(`/course/live/${courseId}`)
}

export const queryLiveCourse = courseId => {
  return Network.get(`/course/live/${courseId}`)
}

export const requestLiveCourseEnd = courseId => {
  return Network.delete(`/course/live/${courseId}`)
}

export const requestLiveCourseSign = (courseId, timeout, params) => {
  return Network.post(`/course/live/sign/${courseId}/${timeout}`, params)
}

export const handleLiveCourseSign = params => {
  return Network.post('/course/live/student/sign/', params)
}

export const findChapterDiscussions = (chapterId, params) => {
  return Network.get(`/chapter/discussion/${chapterId}`, params)
}

export const findChapterDiscussionReplies = (discussionId, params) => {
  return Network.get(`/chapter/discussion/replies/${discussionId}`, params)
}

export const postChapterDiscussion = (courseId, chapterId, params) => {
  return Network.post(`/chapter/discussion/${chapterId}?courseId=${courseId}`, params)
}

export const likeChapterDiscussion = (discussionId, courseId) => {
  return Network.put(`/chapter/discussion/like/${discussionId}?courseId=${courseId}`)
}
