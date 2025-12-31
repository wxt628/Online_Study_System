<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">{{ showReset ? '找回密码' : '登录' }}</h1>
      
      <!-- Login Form -->
      <form v-if="!showReset" class="login-form" @submit.prevent="onSubmit">
        <div class="form-item">
          <input
            v-model="studentId"
            class="form-input"
            type="text"
            placeholder="学号"
            required
          />
        </div>
        <div class="form-item">
          <input
            v-model="password"
            class="form-input"
            type="password"
            placeholder="密码"
            required
          />
        </div>
        <button class="btn btn-primary login-button" :disabled="submitting">
          {{ submitting ? '登录中...' : '登录' }}
        </button>
        <div class="login-links">
          <a href="#" class="link" @click.prevent="toggleReset">忘记密码？</a>
        </div>
        <div v-if="errorMessage" class="login-error">
          {{ errorMessage }}
        </div>
      </form>

      <!-- Reset Password Form -->
      <form v-else class="login-form" @submit.prevent="onReset">
        <div class="form-item">
          <input
            v-model="resetStudentId"
            class="form-input"
            type="text"
            placeholder="学号"
            required
          />
        </div>
        <div class="form-item">
          <input
            v-model="resetPhone"
            class="form-input"
            type="text"
            placeholder="手机号"
            required
          />
        </div>
        <button class="btn btn-primary login-button" :disabled="submitting">
          {{ submitting ? '处理中...' : '找回密码' }}
        </button>
        <div class="login-links">
          <a href="#" class="link" @click.prevent="toggleReset">返回登录</a>
        </div>
        <div v-if="errorMessage" class="login-error">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { resetPassword } from '../api/interface'

const router = useRouter()
const auth = useAuthStore()

// Login State
const studentId = ref('')
const password = ref('')

// Reset State
const showReset = ref(false)
const resetStudentId = ref('')
const resetPhone = ref('')

// Shared State
const submitting = ref(false)
const errorMessage = ref('')

const toggleReset = () => {
  showReset.value = !showReset.value
  errorMessage.value = ''
}

const onSubmit = async () => {
  if (!studentId.value.trim() || !password.value.trim()) return
  submitting.value = true
  errorMessage.value = ''
  const { success, error } = await auth.loginUser({ student_id: studentId.value, password: password.value })
  submitting.value = false
  if (success) {
    router.replace({ name: 'home' })
  } else {
    errorMessage.value = error || '登录失败'
  }
}

const generateRandomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const onReset = async () => {
  if (!resetStudentId.value.trim() || !resetPhone.value.trim()) return
  submitting.value = true
  errorMessage.value = ''
  
  const newPassword = generateRandomPassword()
  
  try {
    await resetPassword({
      student_id: resetStudentId.value,
      phone: resetPhone.value,
      new_password: newPassword
    })
    console.log('新密码:', newPassword)
    alert(`密码重置成功！\n新密码已输出到浏览器控制台 (F12)。\n新密码: ${newPassword}`)
    showReset.value = false
    // Pre-fill login with reset student id
    studentId.value = resetStudentId.value
  } catch (err) {
    errorMessage.value = err.response?.data?.detail?.error?.message || '重置失败，请检查学号和手机号'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}
.login-card {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
}
.login-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 16px;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-item {
  display: flex;
  flex-direction: column;
}
.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.login-button {
  width: 100%;
}
.login-error {
  margin-top: 8px;
  color: #ef4444;
  font-size: 13px;
  text-align: center;
}
.login-links {
  margin-top: 8px;
  text-align: center;
}
.link {
  color: #2563eb;
  text-decoration: none;
  font-size: 13px;
}
.link:hover {
  color: #1d4ed8;
}
</style>
