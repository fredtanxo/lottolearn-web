import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Cookies from 'js-cookie'

import storeobj from './store'
import routes from './router'
import App from './App.vue'

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

const token = Cookies.get('token')
sessionStorage.removeItem('token')
if (token) {
  sessionStorage.setItem('token', token)
}

router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && !sessionStorage.getItem('token')) {
    next({ name: 'login' })
  } else {
    next()
  }
})

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
