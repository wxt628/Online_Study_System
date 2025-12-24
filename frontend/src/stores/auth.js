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
      // 兼容不同后端返回格式（可能为 { code,message,data:{token, ...} }）
      const payload = response.data?.data || response.data || {}
      const authToken = payload?.token || payload?.access_token || response.data?.token || response.data?.access_token || null
      if (!authToken) {
        throw new Error('登录返回中未包含 token')
      }

      // 存储 token（先存 token，后续用 /me 拉取完整用户信息）
      token.value = authToken
      localStorage.setItem('token', authToken)

      // 尝试使用 /me 接口获取并保存用户信息
      try {
        const meResp = await getCurrentUser()
        // getCurrentUser 已在接口层做过 unwrap，如果后端仍然返回包装对象也能兼容
        user.value = meResp.data
        localStorage.setItem('user', JSON.stringify(meResp.data))
        return { success: true, data: meResp.data }
      } catch (meErr) {
        // 如果 /me 失败，仍将登录视为成功，但返回 token 信息，前端可重试获取用户信息
        console.warn('登录后拉取用户信息失败:', meErr)
        return { success: true, data: null }
      }
    } catch (err) {
      error.value = err.response?.data?.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // 获取当前用户
  const fetchCurrentUser = async () => {
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