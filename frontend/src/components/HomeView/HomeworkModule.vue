<template>
  <el-card class="homework-module" shadow="hover">
    <template #header>
      <div class="module-header">
        <div class="header-left">
          <el-icon class="module-icon" :size="24" color="#fff" style="background-color: #E6A23C; padding: 8px; border-radius: 8px;">
            <Collection />
          </el-icon>
          <h2>我的作业</h2>
        </div>
        
        <div class="header-controls">
          <el-select 
            v-model="selectedCourse" 
            placeholder="全部课程" 
            clearable 
            style="width: 160px"
            @change="filterAssignments"
          >
            <template #prefix>
              <el-icon><Notebook /></el-icon>
            </template>
            <el-option label="全部课程" value="" />
            <el-option 
              v-for="course in courses" 
              :key="course.course_id" 
              :label="course.name" 
              :value="course.course_id" 
            />
          </el-select>
        </div>
      </div>
    </template>

    <div class="module-content">
      <el-tabs v-model="activeTab" class="homework-tabs" @tab-click="filterAssignments">
        <el-tab-pane label="未提交" name="unsubmitted">
          <template #label>
            <span>
              <el-icon><Warning /></el-icon> 未提交
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已提交" name="submitted">
          <template #label>
            <span>
              <el-icon><CircleCheck /></el-icon> 已提交
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已截止" name="expired">
          <template #label>
            <span>
              <el-icon><CircleClose /></el-icon> 已截止
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div v-loading="loading" class="assignment-list">
        <div v-if="filteredAssignments.length > 0">
          <el-card 
            v-for="assignment in filteredAssignments" 
            :key="assignment.assignment_id" 
            class="assignment-item" 
            shadow="hover"
            @click="openDetailsModal(assignment)"
          >
            <div class="assignment-main">
              <div class="assignment-info">
                <h4 class="assignment-title">{{ assignment.title }}</h4>
                <div class="assignment-meta">
                  <el-tag size="small" type="info" effect="plain">{{ getCourseName(assignment.course_id) }}</el-tag>
                  <span class="deadline" :class="{ 'urgent': isUrgent(assignment.deadline) && activeTab === 'unsubmitted' }">
                    <el-icon><Clock /></el-icon> {{ formatDate(assignment.deadline) }}
                  </span>
                </div>
              </div>
              <div class="assignment-status">
                <el-button 
                  v-if="activeTab === 'unsubmitted'" 
                  type="primary" 
                  size="small" 
                  @click.stop="openSubmitModal(assignment)"
                >
                  提交
                </el-button>
                <el-tag v-else-if="activeTab === 'submitted'" type="success" effect="dark">
                  已提交
                </el-tag>
                <el-tag v-else type="danger" effect="dark">
                  已截止
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
        
        <el-empty v-else :description="getEmptyText()" />
      </div>
    </div>

    <!-- 作业详情模态框 -->
    <el-dialog
      v-model="showDetailsModal"
      :title="currentAssignment?.title"
      width="600px"
      destroy-on-close
      align-center
    >
      <div v-if="currentAssignment" class="assignment-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课程">
            <el-tag size="small">{{ getCourseName(currentAssignment.course_id) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="截止时间">
            <span :class="{ 'text-danger': isUrgent(currentAssignment.deadline) }">
              {{ formatDate(currentAssignment.deadline) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="作业描述">
            <div class="description-content">{{ currentAssignment.description }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="附件" v-if="currentAssignment.attachment_url">
            <el-button link type="primary" @click="downloadAttachment(currentAssignment)">
              <el-icon><Paperclip /></el-icon> 下载附件
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDetailsModal">关闭</el-button>
          <el-button 
            v-if="activeTab === 'unsubmitted'" 
            type="primary" 
            @click="openSubmitModal(currentAssignment)"
          >
            去提交
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 提交作业模态框 -->
    <el-dialog
      v-model="showSubmitModal"
      title="提交作业"
      width="500px"
      destroy-on-close
      align-center
    >
      <div v-if="currentAssignment" class="submit-form">
        <p class="submit-target">正在提交: <strong>{{ currentAssignment.title }}</strong></p>
        
        <el-form label-position="top">
          <el-form-item label="作业文件">
            <el-upload
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF, Word, Zip 等格式
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="备注留言">
            <el-input
              v-model="submitComment"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（可选）"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeSubmitModal">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submit">
            确认提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getCourses, getCourseAssignments, submitAssignment } from '../../api/interface'
import { 
  Collection, Notebook, Warning, CircleCheck, CircleClose, 
  Clock, Paperclip, UploadFilled 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const assignments = ref([])
const courses = ref([])
const selectedCourse = ref('')
const activeTab = ref('unsubmitted') // unsubmitted, submitted, expired

// 模态框状态
const showDetailsModal = ref(false)
const showSubmitModal = ref(false)
const currentAssignment = ref(null)
const submitComment = ref('')
const selectedFile = ref(null)
const fileList = ref([])

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadData()
  }
})

const loadData = async () => {
  loading.value = true
  try {
    // 1. 获取课程列表
    const coursesRes = await getCourses()
    if (coursesRes.data) {
      courses.value = coursesRes.data
    } else {
      courses.value = []
    }
    
    // 2. 获取每个课程的作业
    if (courses.value.length > 0) {
      const assignmentsPromises = courses.value.map(course => 
        getCourseAssignments(course.course_id).catch(() => ({ data: [] }))
      )
      
      const assignmentsResults = await Promise.all(assignmentsPromises)
      
      let allAssignments = []
      assignmentsResults.forEach(res => {
        if (res && res.data) {
          allAssignments = allAssignments.concat(res.data)
        }
      })
      
      assignments.value = allAssignments
    } else {
      assignments.value = []
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    ElMessage.error('加载作业数据失败')
  } finally {
    loading.value = false
  }
}

// 过滤作业列表
const filteredAssignments = computed(() => {
  let result = assignments.value
  
  // 按课程筛选
  if (selectedCourse.value) {
    result = result.filter(a => a.course_id === selectedCourse.value)
  }
  
  // 按状态筛选
  const now = new Date()
  
  if (activeTab.value === 'unsubmitted') {
    result = result.filter(a => !a.submitted && new Date(a.deadline) > now)
  } else if (activeTab.value === 'submitted') {
    result = result.filter(a => a.submitted)
  } else if (activeTab.value === 'expired') {
    result = result.filter(a => !a.submitted && new Date(a.deadline) <= now)
  }
  
  return result
})

const filterAssignments = () => {
  // 触发计算属性更新
}

const getCourseName = (courseId) => {
  const course = courses.value.find(c => c.course_id === courseId)
  return course ? course.name : `课程 ${courseId}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const isUrgent = (deadline) => {
  const now = new Date()
  const due = new Date(deadline)
  const diffHours = (due - now) / (1000 * 60 * 60)
  return diffHours < 24 && diffHours > 0
}

const getEmptyText = () => {
  if (activeTab.value === 'unsubmitted') return '暂无待交作业，太棒了！'
  if (activeTab.value === 'submitted') return '还没有已提交的作业'
  if (activeTab.value === 'expired') return '没有已截止的作业'
  return '暂无数据'
}

// 模态框操作
const openDetailsModal = (assignment) => {
  currentAssignment.value = assignment
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  setTimeout(() => {
    currentAssignment.value = null
  }, 300)
}

const openSubmitModal = (assignment) => {
  // 如果是从详情页打开的，先关闭详情页
  if (showDetailsModal.value) {
    showDetailsModal.value = false
  }
  
  currentAssignment.value = assignment
  submitComment.value = ''
  selectedFile.value = null
  fileList.value = []
  showSubmitModal.value = true
}

const closeSubmitModal = () => {
  showSubmitModal.value = false
  setTimeout(() => {
    currentAssignment.value = null
    selectedFile.value = null
    fileList.value = []
  }, 300)
}

const handleFileChange = (uploadFile) => {
  selectedFile.value = uploadFile.raw
  fileList.value = [uploadFile]
}

const handleFileRemove = () => {
  selectedFile.value = null
  fileList.value = []
}

const downloadAttachment = (assignment) => {
  // 模拟下载
  window.open(assignment.attachment_url, '_blank')
}

const submit = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.error('请先登录')
    return
  }
  
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  
  submitting.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    if (submitComment.value) {
      formData.append('comment', submitComment.value)
    }
    
    // 注意：这里假设API支持formData上传
    const response = await submitAssignment(currentAssignment.value.assignment_id, formData)
    
    if (response.status === 200 || response.status === 201) {
      ElMessage.success('作业提交成功')
      closeSubmitModal()
      // 重新加载作业列表以更新状态
      await loadData()
      // 自动切换到"已提交"标签页
      activeTab.value = 'submitted'
    }
  } catch (err) {
    console.error('提交作业失败:', err)
    ElMessage.error('提交作业失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.homework-module {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
}

.module-content {
  margin-top: -10px;
}

.homework-tabs {
  margin-bottom: 15px;
}

.assignment-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

/* 自定义滚动条 */
.assignment-list::-webkit-scrollbar {
  width: 6px;
}

.assignment-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.assignment-item {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #EBEEF5;
}

.assignment-item:hover {
  transform: translateY(-2px);
}

.assignment-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-info {
  flex: 1;
}

.assignment-title {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #303133;
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #909399;
}

.deadline {
  display: flex;
  align-items: center;
  gap: 4px;
}

.deadline.urgent {
  color: #F56C6C;
  font-weight: 500;
}

.text-danger {
  color: #F56C6C;
}

.description-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.submit-target {
  margin-bottom: 20px;
  color: #606266;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-controls {
    width: 100%;
  }
  
  .el-select {
    width: 100% !important;
  }
}
</style>