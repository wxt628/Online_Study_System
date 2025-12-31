import api from './config'

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

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const logout = () => {
  return api.post('/auth/logout')
}

export const getMiniProgram = (payload = {}) => {
  return api.post('/mini-programs/query', payload).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

// 在 interface.js 文件中添加以下函数

// 获取课程列表
export const getCourses = (semester) => {
  const params = semester ? { semester } : {}
  return api.get('/courses', { params }).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

// 获取课程详情
export const getCourseDetail = (courseId) => {
  return api.get(`/courses/${courseId}`).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

// 获取课程作业列表
export const getCourseAssignments = (courseId) => {
  return api.get(`/courses/${courseId}/assignments`).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

// 获取作业详情
export const getAssignment = (assignmentId) => {
  return api.get(`/assignments/${assignmentId}`).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

// 提交作业
export const submitAssignment = (assignmentId, formData) => {
  // formData 应该包含 file 和 comment（可选）
  return api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}

// 获取作业提交记录（如果需要）
export const getAssignmentSubmissions = (assignmentId) => {
  return api.get(`/assignments/${assignmentId}/submissions`).then((resp) => {
    if (resp?.data && resp.data.data) resp.data = resp.data.data
    return resp
  })
}
