import Network from '@/api'

export const findAllAccounts = () => {
  return Network.get('/account/current/all')
}

export const findUserAccountById = accountId => {
  return Network.get(`/account/id/${accountId}`)
}

export const addUserAccount = params => {
  return Network.post('/account/new', params)
}

export const updateUserAccount = (accountId, params) => {
  return Network.put(`/account/id/${accountId}`, params)
}
