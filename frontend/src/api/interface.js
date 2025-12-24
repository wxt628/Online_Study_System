import api from './config'

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const getCurrentUser = () => {
  return api.get('/me').then((resp) => {
    // 如果后端返回 { code, message, data: { ...user } }
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

export const updateUserProfile = (userData) => {
  // 如果传入的是 FormData（包含文件），则要让 axios 以 multipart/form-data 发送
  if (userData instanceof FormData) {
    // 后端接口在根路径 /user/update（不带 /api/v1 前缀），构造完整 URL
    const base = api.defaults.baseURL || ''
    const root = base.replace(/\/api\/v1\/?$/, '')
    // 不显式设置 Content-Type，让浏览器/axios 自动添加 boundary
    return api.post(root + '/user/update', userData).then((resp) => {
      if (resp?.data && resp.data.data) resp.data = resp.data.data
      return resp
    })
  }

  const base = api.defaults.baseURL || ''
  const root = base.replace(/\/api\/v1\/?$/, '')
  return api.post(root + '/user/update', userData).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

export const logout = () => {
  return api.post('/auth/logout')
}