<template>
  <el-header class="navbar" height="60px">
    <div class="container">
      <div class="logo">
        <el-icon :size="24" style="margin-right: 10px; color: #9C9EE2;"><Reading /></el-icon>
        <router-link to="/" class="logo-link">校园综合平台</router-link>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="nav-menu"
        mode="horizontal"
        :router="true"
        :ellipsis="false"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>首页
        </el-menu-item>
        <el-menu-item index="/miniapps">
          <el-icon><Menu /></el-icon>小程序
        </el-menu-item>
        <el-menu-item index="/homework">
          <el-icon><List /></el-icon>作业
        </el-menu-item>
        <el-menu-item index="/forum">
          <el-icon><ChatDotRound /></el-icon>论坛
        </el-menu-item>
      </el-menu>
      
      <div class="user-profile">
        <el-dropdown trigger="click" v-if="isAuthenticated">
          <div class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="user-name">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToProfile">
                <el-icon><User /></el-icon>个人信息
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button v-else type="primary" link @click="showLogin">
          <el-icon style="margin-right: 5px"><UserFilled /></el-icon>登录
        </el-button>
      </div>

      <el-dialog
        v-model="showModal"
        title="用户登录"
        width="400px"
        align-center
      >
        <el-form :model="formData" label-width="0" @submit.prevent="handleLogin">
          <el-form-item>
            <el-input
              v-model="formData.studentId"
              placeholder="请输入学号"
              :prefix-icon="Postcard"
              ref="studentIdInput"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button type="primary" class="btn-block" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form>
      </el-dialog>

      <!-- Mobile menu button hidden for now as element plus handles responsive menu differently, 
           or we can implement drawer for mobile -->
    </div>
  </el-header>
</template>

<script setup>
import { ref, computed, reactive, nextTick } from 'vue'
import api from '../api/config'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  Reading, House, Menu, List, ChatDotRound, 
  ArrowDown, User, SwitchButton, UserFilled,
  Postcard, Lock
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const showModal = ref(false)
const studentIdInput = ref(null)
const loading = ref(false)
const formData = reactive({
  studentId: '',
  password: ''
})

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const userName = computed(() => user.value?.name || '请登录')
const userAvatar = computed(() => {
  const url = user.value?.avatar_url
  if (!url) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
  if (/^https?:\/\//i.test(url)) return url
  const base = api.defaults.baseURL || ''
  const root = base.replace(/\/api\/v1\/?$/, '')
  const path = url.startsWith('/') ? url : '/' + url
  return root + path
})

const showLogin = () => {
  showModal.value = true
  formData.studentId = ''
  formData.password = ''
  nextTick(() => {
    studentIdInput.value?.focus()
  })
}

const handleLogin = async () => {
  if (!formData.studentId || !formData.password) {
    ElMessage.warning('请输入学号和密码')
    return
  }
  
  loading.value = true
  const result = await authStore.loginUser({
    student_id: formData.studentId,
    password: formData.password
  })
  loading.value = false
  
  if (result.success) {
    showModal.value = false
    ElMessage.success('登陆成功！')
    setTimeout(() => { window.location.reload(false) }, 1000)
  } else {
    ElMessage.error('密码错误或登录失败')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  ElMessage.success('注销成功！')
  setTimeout(() => { window.location.reload(false) }, 1000)
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 10px #e3e4e483;
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: #393939;
  min-width: 200px;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.nav-menu {
  flex-grow: 1;
  justify-content: center;
  border-bottom: none !important;
  background-color: transparent !important;
}

.user-profile {
  display: flex;
  align-items: center;
  min-width: 100px;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-name {
  font-size: 14px;
  color: #606266;
}

.btn-block {
  width: 100%;
}
</style>