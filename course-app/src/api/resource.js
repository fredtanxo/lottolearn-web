import Network from '@/api'

export const findChapterFiles = chapterId => {
  return Network.get(`/resource/file/chapter/${chapterId}`)
}

export const findChapterMedia = chapterId => {
  return Network.get(`/resource/media/chapter/${chapterId}`)
}

export const findResourceItems = courseId => {
  return Network.get(`/library/media/course/${courseId}`)
}
