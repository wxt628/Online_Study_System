import api from './config'

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const getCurrentUser = () => {
  return api.get('/users/me')
}

export const updateUserProfile = (userData) => {
  return api.put('/users/me', userData)
}

export const logout = () => {
  return api.post('/auth/logout')
}