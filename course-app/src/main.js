import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Cookies from 'js-cookie'

import storeobj from './store'
import routes from './router'
import App from './App.vue'

import config from './config'

import { refresh } from './api/auth'

Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(ElementUI)

const store = new Vuex.Store(storeobj)

const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && !sessionStorage.getItem(config.accessTokenKey)) {
    next({ name: 'login' })
  } else {
    next()
  }
})

// 确保Vue实例加载前已经获得access_token并存入sessionStorage
new Promise((resolve, reject) => {
  const accessToken = Cookies.get(config.accessTokenKey)
  sessionStorage.removeItem(config.accessTokenKey)
  if (accessToken) {
    sessionStorage.setItem(config.accessTokenKey, accessToken)
    resolve()
  } else {
    reject()
  }
})
.catch(async () => {
  const response = await refresh()
  if (response.status === 200) {
    const json = await response.json()
    Cookies.set(config.accessTokenKey, json['access_token'], {
      path: '/',
      domain: 'lottolearn.com',
      // expires: new Date(json['access_token_expiration'])
    })
    sessionStorage.setItem(config.accessTokenKey, json['access_token'])
  }
})
.finally(() => {
  new Vue({
    store,
    router,
    render: h => h(App),
  }).$mount('#app')
})
