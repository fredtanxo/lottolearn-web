import axios from 'axios'
import Cookies from 'js-cookie'

import config from '../config'

axios.defaults.baseURL = config.apiBaseUrl
axios.defaults.headers.common['Authorization'] = `Bearer ${Cookies.get('token')}`

const Network = {
  get(url, params = {}) {
    return new Promise((resolve, reject) => {
      axios.get(url, { params })
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  },
  post(url, params = {}) {
    return new Promise((resolve, reject) => {
      axios.post(url, params)
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  },
  put(url, params = {}) {
    return new Promise((resolve, reject) => {
      axios.put(url, params)
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  },
  delete(url, params = {}) {
    return new Promise((resolve, reject) => {
      axios.delete(url, params)
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  }
}

export default Network
