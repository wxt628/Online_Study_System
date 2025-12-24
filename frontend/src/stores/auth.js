import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getCurrentUser, logout as apiLogout } from '../api/interface'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  // 登录方法
  const loginUser = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await login(credentials)
      const { token: authToken, student_id: userData } = response.data
      // 存储 token 和用户信息
      token.value = authToken
      user.value = userData
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, data: userData }
    } catch (err) {
      error.value = err.response?.data?.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // 获取当前用户
  const fetchCurrentUser = async () => {
    // TODO 后端还没写这个接口
    return
    if (!token.value) return
    
    try {
      const response = await getCurrentUser()
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (err) {
      console.error('获取用户信息失败:', err)
      // 如果 token 失效，清除本地存储
      if (err.response?.status === 401) {
        clearAuth()
      }
    }
  }
  
  // 退出登录
  const logout = async () => {
    try {
      await apiLogout()
    } catch (err) {
      console.error('退出登录失败:', err)
    } finally {
      clearAuth()
    }
  }
  
  // 清除认证信息
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  
  // 初始化时检查本地存储
  const init = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      // 可选：验证 token 是否有效
      fetchCurrentUser()
    }
  }
  
  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    loginUser,
    logout,
    fetchCurrentUser,
    clearAuth,
    init
  }
})