<template>
  <div class="profile-view">
    <div class="container">
      <h1>个人信息</h1>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="userInfo" class="profile-card">
        <div class="profile-header">
          <img :src="avatarSrc" alt="用户头像" class="avatar">
          <h2 v-if="!editMode">{{ userInfo.name }}</h2>
        </div>
        <div class="profile-details">
          <template v-if="editMode">
            <div class="edit-form">
              <div class="detail-item">
                <label>姓名:</label>
                <input v-model="form.name" type="text" readonly>
              </div>
              <div class="detail-item">
                <label>邮箱:</label>
                <input v-model="form.email" type="email">
              </div>
              <div class="detail-item">
                <label>电话:</label>
                <input v-model="form.phone" type="text">
              </div>
              <!-- 头像由文件上传支持，移除手动 avatar_url 输入 -->
              <div class="detail-item">
                <label>上传头像:</label>
                <input ref="fileInput" type="file" accept="image/*" @change="onFileChange">
                <button v-if="avatarPreview || avatarFile" class="btn" type="button" @click="clearFile" style="margin-left:10px">清除</button>
              </div>
              <div v-if="avatarPreview" class="detail-item">
                <label>预览:</label>
                <img :src="avatarPreview" alt="avatar preview" style="width:80px; height:80px; border-radius:8px; object-fit:cover">
              </div>
              <div class="detail-item">
                <label>旧密码:</label>
                <input v-model="form.old_password" type="password" placeholder="无需修改请留空">
              </div>
              <div class="detail-item">
                <label>新密码:</label>
                <input v-model="form.new_password" type="password" placeholder="无需修改请留空">
              </div>
            </div>
          </template>

          <template v-else>
            <div class="detail-item">
              <label>学号:</label>
              <span>{{ userInfo.student_id }}</span>
            </div>
            <div class="detail-item">
              <label>邮箱:</label>
              <span>{{ userInfo.email }}</span>
            </div>
            <div class="detail-item">
              <label>电话:</label>
              <span>{{ userInfo.phone }}</span>
            </div>
						<div class="detail-item">
							<label>注册时间:</label>
							<span>{{ formatDate(userInfo.created_at) }}</span>
						</div>
						<div class="detail-item">
							<label>上次更新:</label>
							<span>{{ formatDate(userInfo.updated_at) }}</span>
						</div>
          </template>
        </div>
				<div v-if="editMode" class="edit-actions">
					<button class="btn btn-primary" @click="saveProfile" :disabled="saving">保存</button>
					<button class="btn" @click="cancelEdit" :disabled="saving">取消</button>
				</div>
				<div class="detail-item" style="justify-content: flex-end;">
					<button v-if="!editMode" class="btn" @click="startEdit">编辑个人信息</button>
				</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { getCurrentUser, updateUserProfile } from '../api/interface'
import api from '../api/config'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const userInfo = ref(null)
const loading = ref(true)
const error = ref(null)
const editMode = ref(false)
const saving = ref(false)
const form = ref({ name: '', email: '', phone: '', old_password: '', new_password: '' })
const avatarFile = ref(null)
const avatarPreview = ref('')
const fileInput = ref(null)

const fetchUserInfo = async () => {
  try {
    const response = await getCurrentUser()
    userInfo.value = response.data
    // populate form
    form.value = {
      name: userInfo.value.name || '',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || '',
      old_password: '',
      new_password: ''
    }
    // reset avatar file/preview
    avatarFile.value = null
    if (avatarPreview.value) {
      URL.revokeObjectURL(avatarPreview.value)
      avatarPreview.value = ''
    }
  } catch (err) {
    error.value = err.response?.data?.message || '获取用户信息失败'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchUserInfo()
})

const startEdit = () => {
  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  // reset form
  form.value = {
    name: userInfo.value.name || '',
    email: userInfo.value.email || '',
    phone: userInfo.value.phone || '',
    old_password: '',
    new_password: ''
  }
  // clear file/preview
  avatarFile.value = null
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value)
    avatarPreview.value = ''
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    const fd = new FormData()
    if (avatarFile.value) fd.append('avatar', avatarFile.value)
    fd.append('name', form.value.name)
    fd.append('email', form.value.email)
    fd.append('phone', form.value.phone)
    if (form.value.old_password && form.value.new_password) {
      fd.append('old_password', form.value.old_password)
      fd.append('new_password', form.value.new_password)
    }

		const resp = await api.post('/user/update', fd)

    const updated = resp.data?.data || resp.data
    if (resp.data?.code && resp.data.code !== 200) {
      throw new Error(resp.data?.message || '更新失败')
    }

    userInfo.value = updated
    try {
      authStore.user = updated
      localStorage.setItem('user', JSON.stringify(updated))
    } catch (e) {}

    clearFile()
    form.value.old_password = ''
    form.value.new_password = ''
    editMode.value = false
  } catch (err) {
    console.error('更新用户信息失败', err)
    error.value = err.response?.data?.message || '更新用户信息失败'
  } finally {
    saving.value = false
  }
}

const clearFile = () => {
  avatarFile.value = null
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value)
    avatarPreview.value = ''
  }
  if (fileInput.value) fileInput.value.value = ''
}

const onFileChange = (e) => {
  const files = e.target.files
  const f = files && files[0]
  if (!f) {
    // user cleared selection or cancelled
    clearFile()
    return
  }
  avatarFile.value = f
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = URL.createObjectURL(f)
}

const avatarSrc = computed(() => {
  const url = userInfo.value?.avatar_url
  if (!url) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (userInfo.value?.user_id || 'guest')
  if (/^https?:\/\//i.test(url)) return url
  // url is relative (e.g. /uploads/...), build absolute root from api.defaults.baseURL
  const base = api.defaults.baseURL || ''
  const root = base.replace(/\/api\/v1\/?$/, '')
  // ensure leading slash
  const path = url.startsWith('/') ? url : '/' + url
  return root + path
})
</script>

<style scoped>
.profile-view {
  padding: 20px 0;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.loading, .error {
  text-align: center;
  padding: 50px;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

.profile-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 30px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.profile-header h2 {
  margin: 0;
  color: #333;
}

.profile-details {
  display: grid;
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: bold;
  min-width: 100px;
  color: #555;
}

.detail-item span {
  color: #333;
}

/* Edit form and button styles */
.edit-form input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.edit-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.btn {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  background: #f0f2f5;
  color: #333;
}

.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}
</style>