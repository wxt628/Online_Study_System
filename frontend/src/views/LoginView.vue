<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h1 class="login-title">{{ showReset ? '找回密码' : '登录' }}</h1>
      </template>
      
      <!-- Login Form -->
      <el-form 
        v-if="!showReset" 
        class="login-form" 
        label-position="top"
        size="large"
        @submit.prevent="onSubmit"
      >
        <el-form-item>
          <el-input
            v-model="studentId"
            placeholder="学号"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        
        <el-button type="primary" class="login-button" :loading="submitting" @click="onSubmit">
          {{ submitting ? '登录中...' : '登录' }}
        </el-button>
        
        <div class="login-links">
          <el-link type="primary" @click.prevent="toggleReset">忘记密码？</el-link>
        </div>
        
        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 10px"
        />
      </el-form>

      <!-- Reset Password Form -->
      <el-form 
        v-else 
        class="login-form" 
        label-position="top"
        size="large"
        @submit.prevent="onReset"
      >
        <el-form-item>
          <el-input
            v-model="resetStudentId"
            placeholder="学号"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="resetPhone"
            placeholder="手机号"
            :prefix-icon="Iphone"
            clearable
          />
        </el-form-item>
        
        <el-button type="primary" class="login-button" :loading="submitting" @click="onReset">
          {{ submitting ? '处理中...' : '找回密码' }}
        </el-button>
        
        <div class="login-links">
          <el-link type="primary" @click.prevent="toggleReset">返回登录</el-link>
        </div>
        
        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 10px"
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { resetPassword } from '../api/interface'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
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
  if (!studentId.value.trim() || !password.value.trim()) {
    ElMessage.warning('请输入学号和密码')
    return
  }
  submitting.value = true
  errorMessage.value = ''
  const { success, error } = await auth.loginUser({ student_id: studentId.value, password: password.value })
  submitting.value = false
  if (success) {
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
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
  if (!resetStudentId.value.trim() || !resetPhone.value.trim()) {
    ElMessage.warning('请输入学号和手机号')
    return
  }
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
    
    ElMessageBox.alert(`密码重置成功！密码已通过短信发送至您的手机号。`, '重置成功', {
      confirmButtonText: '确定',
      dangerouslyUseHTMLString: true,
      callback: () => {
        showReset.value = false
        studentId.value = resetStudentId.value
      }
    })
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
  background-color: #f0f2f5;
}
.login-card {
  width: 100%;
  max-width: 400px;
}
.login-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin: 0;
}
.login-button {
  width: 100%;
  margin-top: 10px;
}
.login-links {
  margin-top: 16px;
  text-align: center;
}
</style>
