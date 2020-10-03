import Network from '@/api'

export const login = params => {
  return Network.post('/auth/login', params)
}

export const refresh = () => {
  return Network.post('/auth/refresh')
}

export const logout = () => {
  return Network.delete('/auth/logout')
}
