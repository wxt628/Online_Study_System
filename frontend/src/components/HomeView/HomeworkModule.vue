<!-- HomeworkModule.vue -->
<template>
  <div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background-color: #FF9800;">
        <i class="fas fa-book-open"></i>
      </div>
      <h2>作业管理</h2>
      <router-link to="/homework" class="module-more" v-if="!showAll">
        查看全部 <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>
    <div class="module-description">
      <p>查看课程作业，提交作业，下载附件</p>
    </div>
    
    <!-- 课程选择 -->
    <div class="module-controls" v-if="showControls">
      <div class="course-selector">
        <select v-model="selectedCourseId" @change="loadAssignments">
          <option value="">所有课程</option>
          <option 
            v-for="course in courses" 
            :key="course.course_id"
            :value="course.course_id"
          >
            {{ course.name }} - {{ course.teacher }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- 作业列表 -->
    <div class="assignments-list">
      <div 
        v-for="assignment in sortedAssignments" 
        :key="assignment.assignment_id" 
        class="assignment-card"
      >
        <div class="assignment-header">
          <h3>{{ assignment.title }}</h3>
          <div class="assignment-meta">
            <span class="course-name">{{ getCourseName(assignment.course_id) }}</span>
            <span class="deadline" :class="{ 'urgent': isUrgent(assignment.deadline) }">
              截止: {{ formatDate(assignment.deadline) }}
            </span>
          </div>
        </div>
        
        <div class="assignment-description">
          {{ truncateText(assignment.description, 100) }}
        </div>
        
        <div class="assignment-actions">
          <button 
            class="btn-details"
            @click="viewAssignmentDetails(assignment)"
          >
            <i class="fas fa-eye"></i> 查看详情
          </button>
          
          <button 
            class="btn-download"
            @click="downloadAttachment(assignment)"
            v-if="assignment.attachment_url"
          >
            <i class="fas fa-download"></i> 下载附件
          </button>
          
          <button 
            class="btn-submit"
            @click="openSubmitModal(assignment)"
          >
            <i class="fas fa-upload"></i> 提交作业
          </button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="skeleton-card" v-for="n in 3" :key="n"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && assignments.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>暂无作业</p>
      </div>
    </div>

    <!-- 作业详情模态框 -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ currentAssignment.title }}</h3>
          <button class="modal-close" @click="closeDetailsModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="assignment-detail">
            <div class="detail-row">
              <span class="label">课程:</span>
              <span class="value">{{ getCourseName(currentAssignment.course_id) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">截止时间:</span>
              <span class="value deadline" :class="{ 'urgent': isUrgent(currentAssignment.deadline) }">
                {{ formatDate(currentAssignment.deadline) }}
              </span>
            </div>
            <div class="detail-row full-width">
              <span class="label">作业描述:</span>
              <div class="value description">
                {{ currentAssignment.description }}
              </div>
            </div>
            <div class="detail-row" v-if="currentAssignment.attachment_url">
              <span class="label">附件:</span>
              <button class="btn-attachment" @click="downloadAttachment(currentAssignment)">
                <i class="fas fa-paperclip"></i> 下载附件
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailsModal">关闭</button>
          <button class="btn-primary" @click="openSubmitModal(currentAssignment)">
            <i class="fas fa-upload"></i> 提交作业
          </button>
        </div>
      </div>
    </div>

    <!-- 提交作业模态框 -->
    <div v-if="showSubmitModal" class="modal-overlay" @click="closeSubmitModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>提交作业 - {{ currentAssignment.title }}</h3>
          <button class="modal-close" @click="closeSubmitModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submit">
            <div class="form-group">
              <label for="file">选择文件:</label>
              <input 
                type="file" 
                id="file" 
                ref="fileInput"
                required
                accept=".pdf,.doc,.docx,.zip,.rar,.txt"
              >
            </div>
            <div class="form-group">
              <label for="comment">备注 (可选):</label>
              <textarea 
                id="comment" 
                v-model="submitComment" 
                placeholder="可以添加备注信息..."
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <div class="file-info" v-if="selectedFile">
                已选择: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeSubmitModal">取消</button>
          <button 
            class="btn-primary" 
            @click="submit"
            :disabled="!selectedFile || submitting"
          >
            <i class="fas fa-upload" v-if="!submitting"></i>
            <i class="fas fa-spinner fa-spin" v-if="submitting"></i>
            {{ submitting ? '提交中...' : '提交作业' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { showToast } from '../../api/Toast'
import { 
  getCourses, 
  getCourseAssignments, 
  getAssignment, 
  submitAssignment 
} from '../../api/interface'

const authStore = useAuthStore()

// 组件属性
const props = defineProps({
  showControls: {
    type: Boolean,
    default: false
  },
  showAll: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: null
  }
})

// 响应式数据
const courses = ref([])
const assignments = ref([])
const loading = ref(false)
const selectedCourseId = ref('')

// 模态框相关
const showDetailsModal = ref(false)
const showSubmitModal = ref(false)
const currentAssignment = ref(null)
const submitComment = ref('')
const selectedFile = ref(null)
const submitting = ref(false)

// 计算属性 - 按截止时间排序
const sortedAssignments = computed(() => {
  const sorted = [...assignments.value].sort((a, b) => {
    return new Date(a.deadline) - new Date(b.deadline)
  })
  
  if (props.limit && sorted.length > props.limit) {
    return sorted.slice(0, props.limit)
  }
  
  return sorted
})

// 生命周期
onMounted(() => {
  loadCourses()
})

// 方法
const loadCourses = async () => {
  try {
    const response = await getCourses()
    if (response.status === 200) {
      courses.value = response.data
      if (courses.value.length > 0) {
        selectedCourseId.value = courses.value[0].course_id
      }
      loadAssignments()
    }
  } catch (err) {
    console.error('加载课程失败:', err)
    showToast('加载课程失败', 'error')
  }
}

const loadAssignments = async () => {
  loading.value = true
  
  try {
    if (selectedCourseId.value) {
      // 加载指定课程的作业
      const response = await getCourseAssignments(selectedCourseId.value)
      if (response.status === 200) {
        assignments.value = response.data
      }
    } else if (props.showAll) {
      // 加载所有课程的作业（需要后端支持，这里简化为加载第一个课程的作业）
      if (courses.value.length > 0) {
        const response = await getCourseAssignments(courses.value[0].course_id)
        if (response.status === 200) {
          assignments.value = response.data
        }
      }
    }
  } catch (err) {
    console.error('加载作业失败:', err)
    showToast('加载作业失败', 'error')
  } finally {
    loading.value = false
  }
}

const getCourseName = (courseId) => {
  const course = courses.value.find(c => c.course_id === courseId)
  return course ? course.name : '未知课程'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const isUrgent = (deadline) => {
  if (!deadline) return false
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffHours = (deadlineDate - now) / (1000 * 60 * 60)
  return diffHours < 48 && diffHours > 0 // 48小时内为紧急
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const viewAssignmentDetails = async (assignment) => {
  try {
    const response = await getAssignment(assignment.assignment_id)
    if (response.status === 200) {
      currentAssignment.value = response.data
      showDetailsModal.value = true
    }
  } catch (err) {
    console.error('获取作业详情失败:', err)
    showToast('获取作业详情失败', 'error')
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  currentAssignment.value = null
}

const openSubmitModal = (assignment) => {
  if (!authStore.isAuthenticated) {
    showToast('请先登录', 'error')
    return
  }
  
  currentAssignment.value = assignment
  submitComment.value = ''
  selectedFile.value = null
  if (window.$refs && window.$refs.fileInput) {
    window.$refs.fileInput.value = ''
  }
  showSubmitModal.value = true
}

const closeSubmitModal = () => {
  showSubmitModal.value = false
  currentAssignment.value = null
  submitting.value = false
}

const downloadAttachment = (assignment) => {
  if (!assignment.attachment_url) {
    showToast('该作业没有附件', 'info')
    return
  }
  
  // 创建临时链接下载
  const link = document.createElement('a')
  link.href = assignment.attachment_url
  link.download = assignment.title + '_附件'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const submit = async () => {
  if (!authStore.isAuthenticated) {
    showToast('请先登录', 'error')
    return
  }
  
  const fileInput = document.getElementById('file')
  if (!fileInput.files.length) {
    showToast('请选择文件', 'error')
    return
  }
  
  const file = fileInput.files[0]
  selectedFile.value = file
  
  submitting.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (submitComment.value) {
      formData.append('comment', submitComment.value)
    }
    
    const response = await submitAssignment(currentAssignment.value.assignment_id, formData)
    
    if (response.status === 200) {
      showToast('作业提交成功', 'success')
      closeSubmitModal()
    }
  } catch (err) {
    console.error('提交作业失败:', err)
    showToast('提交作业失败', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.module-card {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.module-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 1.5rem;
}

.module-header h2 {
  font-size: 1.5rem;
  flex-grow: 1;
  color: #2c3e50;
}

.module-more {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

.module-more i {
  margin-left: 5px;
  transition: transform 0.3s;
}

.module-more:hover i {
  transform: translateX(5px);
}

.module-description {
  margin-bottom: 20px;
  color: #666;
}

/* 课程选择器 */
.module-controls {
  margin-bottom: 20px;
}

.course-selector select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.course-selector select:focus {
  outline: none;
  border-color: #3498db;
}

/* 作业列表 */
.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.assignment-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.assignment-card:hover {
  background-color: #f0f7ff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.assignment-header {
  margin-bottom: 10px;
}

.assignment-header h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.assignment-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
}

.course-name {
  background-color: #e8f4ff;
  padding: 3px 8px;
  border-radius: 4px;
  color: #3498db;
}

.deadline {
  padding: 3px 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.deadline.urgent {
  background-color: #ffebee;
  color: #f44336;
  font-weight: 500;
}

.assignment-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 15px;
}

.assignment-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.assignment-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-details {
  background-color: #e8f4ff;
  color: #3498db;
}

.btn-details:hover {
  background-color: #d4e7ff;
}

.btn-download {
  background-color: #f0f9f0;
  color: #4CAF50;
}

.btn-download:hover {
  background-color: #e0f2e0;
}

.btn-submit {
  background-color: #fff3e0;
  color: #FF9800;
}

.btn-submit:hover {
  background-color: #ffeccc;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 25px;
}

.assignment-detail {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-row .label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.detail-row .value {
  color: #333;
  flex: 1;
}

.detail-row .description {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  line-height: 1.6;
  margin-top: 5px;
}

.btn-attachment {
  padding: 6px 12px;
  background-color: #f0f9f0;
  border: none;
  border-radius: 6px;
  color: #4CAF50;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-attachment:hover {
  background-color: #e0f2e0;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-secondary, .btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.btn-primary {
  background-color: #FF9800;
  color: white;
}

.btn-primary:hover {
  background-color: #f57c00;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="file"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.file-info {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #666;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skeleton-card {
  background-color: #e0e0e0;
  border-radius: 10px;
  height: 120px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 15px;
}

.empty-state p {
  color: #888;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .assignment-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer button {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .module-card {
    padding: 20px;
  }
  
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .module-more {
    align-self: flex-end;
  }
  
  .assignment-actions {
    flex-direction: column;
  }
  
  .assignment-actions button {
    width: 100%;
    justify-content: center;
  }
}
</style>