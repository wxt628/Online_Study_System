<!-- HomeworkModule.vue -->
<template>
  <div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background-color: #2196F3;">
        <i class="fas fa-tasks"></i>
      </div>
      <h2>校园作业平台</h2>
      <router-link to="/homework" class="module-more">
        查看全部 <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>
    <div class="module-description">
      <p>作业查看、管理和提交的线上协作环境</p>
    </div>
    
    <!-- 作业统计 -->
    <div class="assignment-stats" v-if="showStats">
      <div class="stat-item">
        <i class="fas fa-clock"></i>
        <span class="stat-label">待办作业</span>
        <span class="stat-value">{{ pendingCount }}</span>
      </div>
      <div class="stat-item">
        <i class="fas fa-check-circle"></i>
        <span class="stat-label">已完成</span>
        <span class="stat-value">{{ submittedCount }}</span>
      </div>
      <div class="stat-item">
        <i class="fas fa-exclamation-triangle"></i>
        <span class="stat-label">即将截止</span>
        <span class="stat-value">{{ urgentCount }}</span>
      </div>
    </div>
    
    <!-- 作业列表 -->
    <div class="assignments-list">
      <div 
        v-for="assignment in assignments" 
        :key="assignment.assignment_id" 
        class="assignment-item"
        :class="{ 'urgent': assignment.daysLeft <= 1, 'expired': assignment.daysLeft < 0 }"
      >
        <div class="assignment-header">
          <div class="assignment-title">{{ assignment.title }}</div>
          <div class="assignment-status" :class="assignment.status">
            {{ assignment.submission_status }}
          </div>
        </div>
        <div class="assignment-description">{{ assignment.description }}</div>
        <div class="assignment-info">
          <div class="assignment-meta">
            <div class="course-info">
              <i class="fas fa-book"></i>
              <span>{{ assignment.course_name }}</span>
            </div>
            <div class="deadline-info">
              <i class="far fa-clock"></i>
              <span>{{ getDeadlineText(assignment.deadline) }}</span>
              <span v-if="assignment.daysLeft >= 0" class="days-left">
                {{ getDaysLeftText(assignment.daysLeft) }}
              </span>
            </div>
          </div>
          <div class="assignment-actions">
            <button 
              v-if="!assignment.has_submitted && assignment.daysLeft >= 0"
              class="btn-submit"
              @click.stop="submitAssignment(assignment)"
            >
              提交作业
            </button>
            <button 
              v-else-if="assignment.has_submitted"
              class="btn-view"
              @click.stop="viewSubmission(assignment)"
            >
              查看提交
            </button>
            <button 
              v-else
              class="btn-expired"
              disabled
            >
              已截止
            </button>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="skeleton-item" v-for="n in 3" :key="n"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && assignments.length === 0" class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>暂时没有待办作业</p>
        <button class="btn-refresh" @click="loadAssignments">
          <i class="fas fa-redo"></i> 刷新
        </button>
      </div>
    </div>
    
    <!-- 作业提交弹窗 -->
    <div v-if="showSubmitModal" class="submit-modal" @click.self="closeSubmitModal">
      <div class="submit-modal-content">
        <div class="modal-header">
          <h3>提交作业：{{ currentAssignment?.title }}</h3>
          <button class="modal-close" @click="closeSubmitModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="assignment-info">
            <div class="info-row">
              <span class="label">课程：</span>
              <span class="value">{{ currentAssignment?.course_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">截止时间：</span>
              <span class="value">{{ formatDateTime(currentAssignment?.deadline) }}</span>
            </div>
            <div class="info-row">
              <span class="label">要求：</span>
              <span class="value">{{ currentAssignment?.description }}</span>
            </div>
          </div>
          
          <div class="upload-area" @dragenter.prevent @dragover.prevent @drop="handleDrop">
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              style="display: none"
            />
            <div v-if="!selectedFile" class="upload-placeholder">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>点击或拖拽文件到此处上传</p>
              <p class="upload-hint">支持 PDF, DOC, ZIP 等格式，最大 50MB</p>
              <button class="btn-select" @click="selectFile">
                选择文件
              </button>
            </div>
            <div v-else class="file-preview">
              <i class="fas fa-file"></i>
              <div class="file-info">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
              <button class="btn-remove" @click="removeFile">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="comment">
              <i class="fas fa-comment"></i> 提交备注（可选）
            </label>
            <textarea 
              v-model="submitComment" 
              placeholder="可以添加作业说明、备注等信息"
              rows="3"
            ></textarea>
          </div>
          
          <div class="submit-actions">
            <button 
              class="btn btn-primary" 
              :disabled="!selectedFile || submitting"
              @click="confirmSubmit"
            >
              <span v-if="submitting">
                <i class="fas fa-spinner fa-spin"></i> 提交中...
              </span>
              <span v-else>
                <i class="fas fa-paper-plane"></i> 确认提交
              </span>
            </button>
            <button class="btn btn-secondary" @click="closeSubmitModal" :disabled="submitting">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 提交详情弹窗 -->
    <div v-if="showDetailModal" class="detail-modal" @click.self="closeDetailModal">
      <div class="detail-modal-content">
        <div class="modal-header">
          <h3>提交详情：{{ selectedSubmission?.title }}</h3>
          <button class="modal-close" @click="closeDetailModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="submission-info">
            <div class="info-section">
              <h4><i class="fas fa-info-circle"></i> 基本信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">提交时间：</span>
                  <span class="value">{{ formatDateTime(selectedSubmission?.submitted_at) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">文件大小：</span>
                  <span class="value">{{ selectedSubmission?.file_size }}</span>
                </div>
                <div class="info-item">
                  <span class="label">提交状态：</span>
                  <span class="value status-submitted">已提交</span>
                </div>
              </div>
            </div>
            
            <div class="info-section" v-if="selectedSubmission?.score !== null">
              <h4><i class="fas fa-chart-line"></i> 评分信息</h4>
              <div class="score-display">
                <div class="score-value">
                  {{ selectedSubmission?.score }}<span class="score-unit">分</span>
                </div>
                <div class="score-feedback">
                  <div class="feedback-label">教师反馈：</div>
                  <div class="feedback-content">{{ selectedSubmission?.feedback }}</div>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h4><i class="fas fa-file"></i> 提交文件</h4>
              <div class="file-display">
                <div class="file-item">
                  <i class="fas fa-file-word"></i>
                  <div class="file-details">
                    <div class="file-name">{{ selectedSubmission?.file_name }}</div>
                    <div class="file-actions">
                      <button class="btn-download" @click="downloadFile(selectedSubmission)">
                        <i class="fas fa-download"></i> 下载
                      </button>
                      <button class="btn-preview" @click="previewFile(selectedSubmission)">
                        <i class="fas fa-eye"></i> 预览
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 组件属性
const props = defineProps({
  showStats: {
    type: Boolean,
    default: true
  },
  limit: {
    type: Number,
    default: null
  }
})

// 响应式数据
const assignments = ref([])
const loading = ref(false)
const showSubmitModal = ref(false)
const showDetailModal = ref(false)
const submitting = ref(false)
const currentAssignment = ref(null)
const selectedSubmission = ref(null)
const selectedFile = ref(null)
const submitComment = ref('')
const error = ref(null)

// 模拟数据（后期替换为API调用）
const mockData = {
  assignments: [
    { 
      assignment_id: 1, 
      title: "第一次编程作业", 
      description: "实现基本的排序算法，包括冒泡排序、快速排序和归并排序", 
      deadline: "2024-03-15T23:59:59Z", 
      has_submitted: false, 
      submission_status: "未提交",
      course_name: "计算机科学导论",
      course_code: "CS101",
      teacher: "王教授",
      attachment_url: "/files/assignments/1.pdf",
      daysLeft: 3
    },
    { 
      assignment_id: 2, 
      title: "数据结构实验报告", 
      description: "实现链表数据结构，包括单链表和双向链表", 
      deadline: "2024-03-18T23:59:59Z", 
      has_submitted: true, 
      submission_status: "已提交",
      course_name: "数据结构",
      course_code: "CS201",
      teacher: "李教授",
      score: 90.5,
      feedback: "代码结构清晰，算法实现正确",
      submitted_at: "2024-03-14T15:30:00Z",
      file_name: "实验报告.zip",
      file_size: "2.5MB",
      daysLeft: 5
    },
    { 
      assignment_id: 3, 
      title: "高等数学第三章习题", 
      description: "完成课后习题1-20，需要详细计算过程", 
      deadline: "2024-03-10T23:59:59Z", 
      has_submitted: false, 
      submission_status: "已截止",
      course_name: "高等数学",
      course_code: "MA101",
      teacher: "张教授",
      daysLeft: -2
    }
  ]
}

// 计算属性
const pendingCount = computed(() => {
  return assignments.value.filter(a => !a.has_submitted && a.daysLeft >= 0).length
})

const submittedCount = computed(() => {
  return assignments.value.filter(a => a.has_submitted).length
})

const urgentCount = computed(() => {
  return assignments.value.filter(a => a.daysLeft >= 0 && a.daysLeft <= 1).length
})

// 生命周期
onMounted(() => {
  loadAssignments()
})

// 方法
const loadAssignments = async () => {
  loading.value = true
  error.value = null
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const response = await fetchAssignmentsAPI({
      status: 'pending', // 只获取未完成的作业
      limit: props.limit
    })
    
    if (response.success) {
      // 处理返回的数据，计算剩余天数
      assignments.value = response.data.assignments.map(assignment => {
        const deadline = new Date(assignment.deadline)
        const now = new Date()
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
        
        return {
          ...assignment,
          daysLeft,
          status: daysLeft < 0 ? 'expired' : (daysLeft <= 1 ? 'urgent' : 'pending')
        }
      })
    } else {
      error.value = response.error
      // 加载失败时使用模拟数据
      assignments.value = mockData.assignments
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟加载延迟
    setTimeout(() => {
      // 处理模拟数据，计算剩余天数
      assignments.value = mockData.assignments.map(assignment => {
        const deadline = new Date(assignment.deadline)
        const now = new Date()
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
        
        return {
          ...assignment,
          daysLeft,
          status: daysLeft < 0 ? 'expired' : (daysLeft <= 1 ? 'urgent' : 'pending')
        }
      })
      loading.value = false
    }, 500)
    
  } catch (err) {
    console.error('加载作业失败:', err)
    error.value = '加载失败，请稍后重试'
    assignments.value = mockData.assignments.map(assignment => ({
      ...assignment,
      daysLeft: 0
    }))
    loading.value = false
  }
}

const getDeadlineText = (deadline) => {
  if (!deadline) return ''
  const date = new Date(deadline)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDaysLeftText = (daysLeft) => {
  if (daysLeft < 0) return '已截止'
  if (daysLeft === 0) return '今天截止'
  if (daysLeft === 1) return '明天截止'
  return `${daysLeft}天后截止`
}

const submitAssignment = (assignment) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  currentAssignment.value = assignment
  showSubmitModal.value = true
  selectedFile.value = null
  submitComment.value = ''
}

const viewSubmission = (assignment) => {
  // 模拟提交数据
  const mockSubmission = {
    assignment_id: assignment.assignment_id,
    title: assignment.title,
    submitted_at: assignment.submitted_at || new Date().toISOString(),
    file_name: assignment.file_name || 'assignment.zip',
    file_size: assignment.file_size || '2.5MB',
    score: assignment.score,
    feedback: assignment.feedback
  }
  
  selectedSubmission.value = mockSubmission
  showDetailModal.value = true
}

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 验证文件大小（最大50MB）
    if (file.size > 50 * 1024 * 1024) {
      alert('文件大小不能超过50MB')
      return
    }
    
    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'image/png',
      'image/jpeg',
      'application/x-rar-compressed'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert('不支持的文件类型')
      return
    }
    
    selectedFile.value = file
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file) {
    handleFileSelect({ target: { files: [file] } })
  }
}

const removeFile = () => {
  selectedFile.value = null
}

const confirmSubmit = async () => {
  if (!selectedFile.value) {
    alert('请选择要提交的文件')
    return
  }
  
  submitting.value = true
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    if (submitComment.value) {
      formData.append('comment', submitComment.value)
    }
    
    const response = await submitAssignmentAPI(
      currentAssignment.value.assignment_id,
      formData
    )
    
    if (response.success) {
      alert('作业提交成功！')
      closeSubmitModal()
      loadAssignments() // 重新加载列表
    } else {
      alert(response.error || '提交失败')
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟提交过程
    setTimeout(() => {
      alert('作业提交成功！')
      submitting.value = false
      closeSubmitModal()
      
      // 更新作业状态
      const assignmentIndex = assignments.value.findIndex(
        a => a.assignment_id === currentAssignment.value.assignment_id
      )
      if (assignmentIndex !== -1) {
        assignments.value[assignmentIndex] = {
          ...assignments.value[assignmentIndex],
          has_submitted: true,
          submission_status: '已提交',
          submitted_at: new Date().toISOString(),
          file_name: selectedFile.value.name,
          file_size: formatFileSize(selectedFile.value.size)
        }
      }
    }, 1500)
    
  } catch (err) {
    console.error('提交作业失败:', err)
    alert('提交失败，请稍后重试')
    submitting.value = false
  }
}

const downloadFile = (submission) => {
  alert(`下载文件: ${submission.file_name}`)
  // 实际应该通过文件URL下载
}

const previewFile = (submission) => {
  alert(`预览文件: ${submission.file_name}`)
  // 实际可以跳转到文件预览页面或打开预览弹窗
}

const closeSubmitModal = () => {
  showSubmitModal.value = false
  currentAssignment.value = null
  selectedFile.value = null
  submitComment.value = ''
  submitting.value = false
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedSubmission.value = null
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 文件输入引用
const fileInput = ref(null)

// 事件发射
const emit = defineEmits(['needLogin'])
</script>

<style scoped>
/* 基本样式（与之前相同，略作调整） */
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

/* 统计区域 */
.assignment-stats {
  display: flex;
  justify-content: space-around;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-item i {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.stat-item i.fa-clock {
  color: #ff9800;
}

.stat-item i.fa-check-circle {
  color: #4caf50;
}

.stat-item i.fa-exclamation-triangle {
  color: #f44336;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

/* 作业列表 */
.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.assignment-item {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid #3498db;
  transition: all 0.3s;
}

.assignment-item.urgent {
  border-left-color: #ff9800;
  background-color: #fff8e1;
}

.assignment-item.expired {
  border-left-color: #9e9e9e;
  background-color: #f5f5f5;
  opacity: 0.8;
}

.assignment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.assignment-title {
  font-weight: 600;
  color: #2c3e50;
  flex-grow: 1;
  font-size: 1.05rem;
}

.assignment-status {
  font-size: 0.8rem;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.assignment-status.pending {
  background-color: #ffebee;
  color: #c62828;
}

.assignment-status.submitted {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.assignment-status.expired {
  background-color: #f5f5f5;
  color: #757575;
}

.assignment-status.urgent {
  background-color: #fff3e0;
  color: #ef6c00;
}

.assignment-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
}

.assignment-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.assignment-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.course-info, .deadline-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 0.85rem;
}

.days-left {
  margin-left: 8px;
  padding: 2px 6px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 10px;
  font-size: 0.75rem;
}

.assignment-item.urgent .days-left {
  background-color: #fff3e0;
  color: #ef6c00;
}

.assignment-actions {
  display: flex;
  gap: 8px;
}

.btn-submit, .btn-view, .btn-expired {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-submit {
  background-color: #3498db;
  color: white;
}

.btn-submit:hover {
  background-color: #2980b9;
}

.btn-view {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-view:hover {
  background-color: #e9ecef;
}

.btn-expired {
  background-color: #f5f5f5;
  color: #9e9e9e;
  cursor: not-allowed;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skeleton-item {
  background-color: #e0e0e0;
  border-radius: 10px;
  height: 80px;
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
  color: #4caf50;
  margin-bottom: 15px;
}

.empty-state p {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.btn-refresh {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-refresh:hover {
  background-color: #2980b9;
}

/* 弹窗样式（类似小程序模块） */
.submit-modal, .detail-modal {
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
}

.submit-modal-content, .detail-modal-content {
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
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8rem;
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

.assignment-info .info-row {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.assignment-info .label {
  font-weight: 500;
  color: #666;
  min-width: 70px;
}

.assignment-info .value {
  color: #333;
  flex: 1;
  line-height: 1.5;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin: 20px 0;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.upload-placeholder i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 15px;
}

.upload-placeholder p {
  color: #666;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 20px !important;
}

.btn-select {
  padding: 8px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-select:hover {
  background-color: #2980b9;
}

/* 文件预览 */
.file-preview {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.file-preview i {
  font-size: 2rem;
  color: #3498db;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 500;
  margin-bottom: 5px;
  word-break: break-all;
}

.file-size {
  color: #666;
  font-size: 0.85rem;
}

.btn-remove {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background-color: #ffebee;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

/* 提交操作 */
.submit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn {
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
  min-width: 100px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e9ecef;
}

/* 提交详情样式 */
.submission-info .info-section {
  margin-bottom: 25px;
}

.submission-info h4 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-radius: 8px;
}

.info-item .label {
  font-weight: 500;
  color: #666;
  display: block;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

.status-submitted {
  color: #4caf50;
}

/* 评分显示 */
.score-display {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4caf50;
  text-align: center;
  margin-bottom: 15px;
}

.score-unit {
  font-size: 1.5rem;
  font-weight: 500;
}

.feedback-label {
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.feedback-content {
  color: #333;
  line-height: 1.5;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #eee;
}

/* 文件显示 */
.file-display .file-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.file-item i {
  font-size: 2.5rem;
  color: #2c57aa;
}

.file-details {
  flex: 1;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.btn-download, .btn-preview {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-download {
  background-color: #4caf50;
  color: white;
}

.btn-download:hover {
  background-color: #3d8b40;
}

.btn-preview {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-preview:hover {
  background-color: #e9ecef;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .assignment-stats {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .stat-item {
    flex: 1;
    min-width: 100px;
  }
  
  .assignment-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .assignment-actions {
    justify-content: flex-start;
  }
  
  .submit-actions {
    flex-direction: column;
  }
  
  .submit-actions .btn {
    width: 100%;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
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
  
  .file-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .file-info {
    text-align: center;
  }
  
  .file-actions {
    justify-content: center;
  }
}
</style>