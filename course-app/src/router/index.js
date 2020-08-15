import Login from '@/components/login'
import BrowseRouter from './browse'
import LearnRouter from './learn'

export default [
  {
    path: '/login',
    component: Login,
    name: 'login'
  },
  BrowseRouter,
  LearnRouter
]
