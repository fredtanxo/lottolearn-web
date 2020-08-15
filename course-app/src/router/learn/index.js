import LearnLayout from '@/components/layout/learn'

import Announcement from '@/components/learn/announcement'
import TeachAndLearn from '@/components/learn/teachandlearn'
import Chapter from '@/components/learn/teachandlearn/chapter'
import Select from '@/components/learn/teachandlearn/chapter/select'
import Learning from '@/components/learn/teachandlearn/chapter/learning'
import Live from '@/components/learn/teachandlearn/live'
import Library from '@/components/learn/library'
import Discussion from '@/components/learn/discussion'

export default {
  path: '/learn/:courseId',
  component: LearnLayout,
  name: 'learn',
  redirect: '/learn/:courseId/announcement',
  children: [
    {
      path: 'announcement',
      component: Announcement,
      name: 'announcement'
    },
    {
      path: 'teach-and-learn',
      component: TeachAndLearn,
      name: 'teach-and-learn',
      redirect: 'teach-and-learn/chapter',
      children: [
        {
          path: 'chapter',
          component: Chapter,
          name: 'chapter',
          redirect: 'chapter/select',
          children: [
            {
              path: 'select',
              component: Select,
              name: 'chapter-select'
            },
            {
              path: 'learning/:chapterId',
              component: Learning,
              name: 'learning'
            }
          ]
        },
        {
          path: 'live',
          component: Live,
          name: 'live'
        }
      ]
    },
    {
      path: 'library',
      component: Library,
      name: 'library'
    },
    {
      path: 'discussion',
      component: Discussion,
      name: 'discussion'
    }
  ]
}
