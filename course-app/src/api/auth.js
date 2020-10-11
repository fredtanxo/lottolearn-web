import config from '../config'

export const login = params => {
  return fetch(`${config.authBaseUrl}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(params)
  })
}

export const refresh = () => {
  return fetch(`${config.authBaseUrl}/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  })
}

export const logout = () => {
  return fetch(`${config.authBaseUrl}/auth/logout`, {
    method: 'DELETE',
    credentials: 'include'
  })
}
