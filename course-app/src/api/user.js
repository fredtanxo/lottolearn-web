import Network from '@/api'

export const currentUser = () => {
  return Network.get('/user/current')
}

export const editUser = (userId, params) => {
  return Network.put(`/user/id/${userId}`, params)
}
