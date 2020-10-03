import Network from '@/api'

export const currentUser = () => {
  return Network.get('/user/current')
}
