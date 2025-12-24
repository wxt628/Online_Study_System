import api from './config'

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const logout = () => {
  return api.post('/auth/logout')
}

export const Me = () => {
  return api.get('/me')
}

export const getMiniProgram = () => {
  return api.get('/mini-programs')
}