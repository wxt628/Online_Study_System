<template>
  <div class="profile-view">
    <div class="container">
      <el-card class="profile-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <h3>个人信息</h3>
            <el-button v-if="!editMode && userInfo" type="primary" text @click="startEdit">
              <el-icon class="mr-1"><Edit /></el-icon> 编辑
            </el-button>
          </div>
        </template>
        
        <div v-if="error" class="mb-4">
          <el-alert :title="error" type="error" show-icon :closable="false" />
        </div>
        
        <div v-else-if="userInfo" class="profile-content">
          <div class="avatar-section">
             <el-avatar :size="100" :src="avatarPreview || avatarSrc" class="mb-2" />
             <div v-if="editMode" class="avatar-actions">
               <el-upload
                 class="avatar-uploader"
                 action="#"
                 :show-file-list="false"
                 :auto-upload="false"
                 :on-change="onFileChange"
                 accept="image/*"
               >
                 <el-button size="small" type="primary">更换头像</el-button>
               </el-upload>
               <el-button v-if="avatarPreview || avatarFile" size="small" text @click="clearFile" class="ml-2">清除</el-button>
             </div>
             <h2 v-if="!editMode" class="user-name">{{ userInfo.name }}</h2>
          </div>

          <el-descriptions v-if="!editMode" :column="1" border class="profile-descriptions">
            <el-descriptions-item label="学号">{{ userInfo.student_id }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ userInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(userInfo.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="上次更新">{{ formatDate(userInfo.updated_at) }}</el-descriptions-item>
          </el-descriptions>

          <el-form v-else :model="form" label-width="80px" class="edit-form">
            <el-form-item label="姓名">
              <el-input v-model="form.name" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
             <el-form-item label="电话">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-divider content-position="center">修改密码</el-divider>
            <el-form-item label="旧密码">
              <el-input v-model="form.old_password" type="password" placeholder="无需修改请留空" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="form.new_password" type="password" placeholder="无需修改请留空" show-password />
            </el-form-item>
            
            <div class="form-actions">
              <el-button @click="cancelEdit">取消</el-button>
              <el-button type="primary" @click="saveProfile" :loading="saving">保存</el-button>
            </div>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCurrentUser } from '../api/interface'
import api from '../api/config'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'

const authStore = useAuthStore()

const userInfo = ref(null)
const loading = ref(true)
const error = ref(null)
const editMode = ref(false)
const saving = ref(false)
const form = ref({ name: '', email: '', phone: '', old_password: '', new_password: '' })
const avatarFile = ref(null)
const avatarPreview = ref('')

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
  if (!dateString) return '-'
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
    ElMessage.success('个人信息已更新')
  } catch (err) {
    console.error('更新用户信息失败', err)
    // Don't set global error, just show toast
    ElMessage.error(err.response?.data?.message || '更新用户信息失败')
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
}

const onFileChange = (file) => {
  // Element Plus passes a File object wrapped in a proxy, or we can get it from raw
  const rawFile = file.raw
  if (!rawFile) return

  avatarFile.value = rawFile
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = URL.createObjectURL(rawFile)
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
  padding: 40px 0;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.profile-content {
  padding: 10px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.user-name {
  margin-top: 15px;
  color: #303133;
}

.avatar-actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.ml-2 {
  margin-left: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-1 {
  margin-right: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.edit-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}
</style>
