import BrowseLayout from '@/components/layout/browse'

import Course from '@/components/browse/course'
import Discovery from '@/components/browse/discovery'
import Collcetions from '@/components/browse/collections'

export default {
  path: '/',
  component: BrowseLayout,
  name: 'browse',
  redirect: '/course',
  children: [
    {
      path: '/course',
      component: Course,
      name: 'course'
    },
    {
      path: '/discovery',
      component: Discovery,
      name: 'discovery'
    },
    {
      path: '/collections',
      component: Collcetions,
      name: 'collections'
    }
  ]
}
