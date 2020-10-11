import Login from '@/components/login'
import BrowseRouter from './browse'
import LearnRouter from './learn'

import config from '../config'

export default [
  {
    path: '/login',
    component: Login,
    name: 'login',
    beforeRouteEnter(to, from, next) {
      if (sessionStorage.getItem(config.accessTokenKey)) {
        next({ name: from.name, replace: true })
      } else {
        next()
      }
    }
  },
  BrowseRouter,
  LearnRouter
]
