<template>
  <header class="navbar">
    <div class="container">
      <div class="logo">
        <i class="fas fa-graduation-cap"></i>
        <router-link to="/" class="logo-link">校园综合平台</router-link>
      </div>
      
      <nav class="nav-links">
        <router-link to="/" :class="{ active: $route.name === 'home' }">
          <i class="fas fa-home"></i> 首页
        </router-link>
        <router-link to="/miniapps" :class="{ active: $route.name === 'miniapps' }">
          <i class="fas fa-th-large"></i> 小程序
        </router-link>
        <router-link to="/homework" :class="{ active: $route.name === 'homework' }">
          <i class="fas fa-tasks"></i> 作业
        </router-link>
        <router-link to="/forum" :class="{ active: $route.name === 'forum' }">
          <i class="fas fa-comments"></i> 论坛
        </router-link>
      </nav>
      
      <div class="user-profile" ref="userProfile">
        <div class="user-info" @click="toggleDropdown">
          <div class="user-avatar">
            <img :src="userAvatar" alt="用户头像">
          </div>
          <div class="user-name">{{ userName }}</div>
          <i class="fas fa-chevron-down"></i>
        </div>
        
        <div class="user-dropdown" :class="{ 'show': showDropdown }">
          <a href="#" v-if="!isAuthenticated" @click.prevent="showLogin">
            <i class="fas fa-sign-in-alt"></i> 登录
          </a>
          <a href="#" v-else @click.prevent="goToProfile">
            <i class="fas fa-user"></i> 个人信息
          </a>
          <a href="#" v-if="isAuthenticated" @click.prevent="handleLogout">
            <i class="fas fa-sign-out-alt"></i> 退出登录
          </a>
        </div>
      </div>

      <div class="modal" :class="{ 'show': showModal }">
        <div class="modal-content">
          <div class="modal-header">
            <h2>用户登录</h2>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleLogin">
              <div class="form-group">
                <label for="student-id"><i class="fas fa-id-card"></i> 学号</label>
                <input
                  ref="studentIdInput"
                  v-model="formData.studentId"
                  type="text"
                  placeholder="请输入学号"
                  required
                >
              </div>
              <div class="form-group">
                <label for="password"><i class="fas fa-lock"></i> 密码</label>
                <input
                  v-model="formData.password"
                  type="password"
                  placeholder="请输入密码"
                  required
                >
              </div>
              <button type="submit" class="btn btn-primary btn-block">登录</button>
            </form>
            <div v-if="loginMessage" class="login-message" :class="{ 'success': successLogin, 'error': !successLogin }">{{ loginMessage }}</div>
          </div>
        </div>
      </div>

      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <i class="fas fa-bars"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const userProfile = ref(null)
const showDropdown = ref(false)
const showMobileMenu = ref(false)
const showModal = ref(false)
const successLogin = ref(true)
const loginMessage = ref('')
const studentIdInput = ref(null)
const formData = reactive({
  studentId: '',
  password: '',
  rememberMe: false
})
authStore.init()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const userName = computed(() => user.value || '请登录')
const userAvatar = computed(() => 
  user.value?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
)
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}
const showLogin = () => {
  showDropdown.value = false
  showModal.value = true
  loginMessage.value = ''
  formData.studentId = ''
  formData.password = ''
  formData.rememberMe = false
  nextTick(() => {
    studentIdInput.value?.focus()
  })
}
function closeModal() {
  showModal.value = false
}


const handleLogin = async () => {
  loginMessage.value = ''
  successLogin.value = true;
  const result = await authStore.loginUser({
    student_id: formData.studentId,
    password: formData.password
  })
  if (result.success) {
    closeModal()
    router.push('/')
  } else {
    successLogin.value = false;
    loginMessage.value = '密码错误'
  }
  
//   try {
//     loginMessage.value = '' 
//     const response = await login({
//       student_id: formData.studentId,
//       password: formData.password
//     })
//     console.log(response)
//     if (response.status === 200) {
//       // 保存token和用户信息到store
//     //   authStore.setToken(response.data.token)
//     //   authStore.setUser(response.data.user)
      
//     //   // 如果勾选了“记住我”，可以保存token到localStorage
//     //   if (formData.rememberMe) {
//     //     localStorage.setItem('token', response.data.token)
//     //     localStorage.setItem('user', JSON.stringify(response.data.user))
//     //   } else {
//     //     // 否则只保存到sessionStorage
//     //     sessionStorage.setItem('token', response.data.token)
//     //     sessionStorage.setItem('user', JSON.stringify(response.data.user))
//     //   }
      
//       router.push('/')
//     } else {
//       successLogin.value = false;
//       console.error('登录失败')
//       loginMessage.value = response.message || '登录失败'
//     }
//   } catch (error) {
//     successLogin.value = false;
//     console.error('登录出错:', error)
//     loginMessage.value = '登录失败，请检查网络连接'
//   }
}

const handleLogout = async () => {
  showDropdown.value = false
  await authStore.logout()
  router.push('/')
}

const goToProfile = () => {
  showDropdown.value = false
  alert('个人信息页面开发中...')
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  const navLinks = document.querySelector('.nav-links')
  if (navLinks) {
    navLinks.classList.toggle('show')
  }
}

const handleClickOutside = (event) => {
  if (userProfile.value && !userProfile.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 保持原有样式，可稍作调整 */
.nav-links a.router-link-active {
  color: #3498db;
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3498db;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

/* 顶部导航栏 */
.navbar {
    background-color: #ffffff;
    box-shadow: 0 2px 10px #e3e4e483;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 20px;
}

.logo {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #393939;
}

.logo i {
    margin-right: 10px;
    color: #9C9EE2;
}

.nav-links {
    display: flex;
    gap: 30px;
}

.nav-links a {
    text-decoration: none;
    color: #393939;
    font-weight: 500;
    padding: 0px 0;
    position: relative;
    transition: color 0.1s;
}

.nav-links a:hover,
.nav-links a.active {
    color: #3498db;
}

.nav-links a.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #3498db;
}

.nav-links a i {
    margin-right: 8px;
}

.user-profile {
    position: relative;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px 15px;
    border-radius: 50px;
    transition: background-color 0.3s;
}

.user-info:hover {
    background-color: #f0f2f5;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-name {
    font-weight: 500;
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    min-width: 180px;
    padding: 10px 0;
    display: none;
    z-index: 1000;
}

.user-dropdown.show {
    display: block;
}

.user-dropdown a {
    display: block;
    padding: 10px 20px;
    text-decoration: none;
    color: #333;
    transition: background-color 0.3s;
}

.user-dropdown a:hover {
    background-color: #f5f7fa;
}

.user-dropdown a i {
    margin-right: 10px;
    width: 20px;
    text-align: center;
}

.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #555;
    cursor: pointer;
}

/* 登录模态框 */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    display: none;
}

.modal.show {
    display: flex;
}

.modal-content {
    background-color: white;
    border-radius: 12px;
    width: 100%;
    max-width: 450px;
    overflow: hidden;
}

.modal-header {
    padding: 20px 25px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    font-size: 1.5rem;
    color: #2c3e50;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #888;
    line-height: 1;
}

.modal-body {
    padding: 25px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
}

.form-group label i {
    margin-right: 8px;
    width: 20px;
}

.form-group input[type="text"],
.form-group input[type="password"] {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #3498db;
}

.form-check {
    display: flex;
    align-items: center;
}

.form-check input {
    margin-right: 8px;
}

.form-check label {
    margin-bottom: 0;
}

.btn {
    display: inline-block;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background-color: #2980b9;
}

.btn-block {
    width: 100%;
}

.login-message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 6px;
    text-align: center;
    display: none;
}

.login-message.success {
    background-color: #d4edda;
    color: #155724;
    display: block;
}

.login-message.error {
    background-color: #f8d7da;
    color: #721c24;
    display: block;
}

/* 欢迎横幅 */
.welcome-banner {
    color: rgb(0, 0, 0);
    border-radius: 15px;
    padding: 30px;
    margin: 30px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.welcome-content h1 {
    font-size: 2.2rem;
    margin-bottom: 10px;
}

.welcome-content p {
    font-size: 1.1rem;
    opacity: 0.9;
}

.welcome-stats {
    display: flex;
    gap: 30px;
    margin-top: 15px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 15px;
}

.stat-item i {
    font-size: 2.5rem;
    opacity: 0.9;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    display: block;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
}

</style>