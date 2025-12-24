<!-- HomeworkView.vue -->
<template>
  <main class="homework-view">
    <!-- 页面标题和搜索 -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-tasks"></i> 作业平台</h1>
        <p class="subtitle">查看、管理和提交作业的线上协作环境</p>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="header-actions">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="搜索作业标题或课程名称..."
            @input="handleSearch"
          />
        </div>
        <button class="btn-refresh" @click="refreshAssignments">
          <i class="fas fa-redo-alt"></i> 刷新
        </button>
      </div>
    </div>
    
    <!-- 状态筛选 -->
    <div class="status-filter">
      <button 
        v-for="status in statusFilters" 
        :key="status.value"
        :class="{ active: activeStatus === status.value }"
        @click="filterByStatus(status.value)"
      >
        <i :class="status.icon"></i> {{ status.label }}
        <span class="count-badge" v-if="getStatusCount(status.value) > 0">
          {{ getStatusCount(status.value) }}
        </span>
      </button>
    </div>
    
    <!-- 作业统计 -->
    <div class="homework-stats">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #3498db;">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">待办作业</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #2ecc71;">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ submittedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #e74c3c;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ urgentCount }}</div>
          <div class="stat-label">即将截止</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #9b59b6;">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ avgScore || '--' }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </div>
    </div>
    
    <!-- 作业列表 -->
    <div class="homework-list-section">
      <div class="section-header">
        <h2><i class="fas fa-list-ul"></i> 作业列表</h2>
        <div class="list-controls">
          <div class="sort-options">
            <label>排序：</label>
            <select v-model="sortBy" @change="handleSortChange">
              <option value="deadline">截止时间</option>
              <option value="created_at">发布时间</option>
              <option value="course_name">课程名称</option>
              <option value="title">作业标题</option>
            </select>
          </div>
          <div class="view-options">
            <button 
              :class="{ active: viewMode === 'list' }" 
              @click="viewMode = 'list'"
              title="列表视图"
            >
              <i class="fas fa-list"></i>
            </button>
            <button 
              :class="{ active: viewMode === 'grid' }" 
              @click="viewMode = 'grid'"
              title="网格视图"
            >
              <i class="fas fa-th-large"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="homework-list">
        <div 
          v-for="assignment in filteredAssignments" 
          :key="assignment.assignment_id" 
          class="assignment-card list-view"
          :class="{ 
            'urgent': assignment.daysLeft <= 1, 
            'expired': assignment.daysLeft < 0,
            'submitted': assignment.has_submitted
          }"
        >
          <div class="assignment-main">
            <div class="assignment-header">
              <div class="assignment-title-section">
                <div class="assignment-title">{{ assignment.title }}</div>
                <div class="assignment-course">{{ assignment.course_name }} | {{ assignment.teacher }}</div>
              </div>
              <div class="assignment-status">
                <div class="status-badge" :class="getStatusClass(assignment)">
                  {{ assignment.submission_status }}
                </div>
                <div v-if="assignment.score !== null" class="assignment-score">
                  <i class="fas fa-star"></i> {{ assignment.score }}分
                </div>
              </div>
            </div>
            
            <div class="assignment-description">
              {{ assignment.description }}
            </div>
            
            <div class="assignment-meta">
              <div class="meta-item">
                <i class="far fa-calendar-alt"></i>
                发布时间：{{ formatDate(assignment.created_at) }}
              </div>
              <div class="meta-item">
                <i class="far fa-clock"></i>
                截止时间：{{ formatDate(assignment.deadline) }}
                <span v-if="assignment.daysLeft >= 0" class="days-left">
                  {{ getDaysLeftText(assignment.daysLeft) }}
                </span>
              </div>
              <div class="meta-item">
                <i class="fas fa-file"></i>
                附件：{{ assignment.attachment_count || 0 }}个
              </div>
            </div>
          </div>
          
          <div class="assignment-actions">
            <button 
              v-if="!assignment.has_submitted && assignment.daysLeft >= 0"
              class="btn btn-primary"
              @click="submitAssignment(assignment)"
            >
              <i class="fas fa-paper-plane"></i> 提交作业
            </button>
            <button 
              v-else-if="assignment.has_submitted"
              class="btn btn-success"
              @click="viewSubmission(assignment)"
            >
              <i class="fas fa-eye"></i> 查看提交
            </button>
            <button 
              v-else
              class="btn btn-secondary"
              disabled
            >
              <i class="fas fa-ban"></i> 已截止
            </button>
            <button 
              v-if="assignment.attachment_url"
              class="btn btn-outline"
              @click.stop="downloadAttachment(assignment)"
            >
              <i class="fas fa-download"></i> 下载附件
            </button>
            <button 
              class="btn btn-outline"
              @click.stop="viewAssignmentDetails(assignment)"
            >
              <i class="fas fa-info-circle"></i> 详情
            </button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && filteredAssignments.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>没有找到相关作业</h3>
          <p v-if="searchKeyword">尝试更换搜索关键词或重置筛选条件</p>
          <p v-else>当前没有{{ activeStatus === 'all' ? '' : activeStatus }}作业</p>
          <button class="btn btn-primary" @click="resetFilters">
            <i class="fas fa-redo"></i> 重置筛选
          </button>
        </div>
      </div>
      
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="homework-grid">
        <div 
          v-for="assignment in filteredAssignments" 
          :key="assignment.assignment_id" 
          class="assignment-card grid-view"
          :class="{ 
            'urgent': assignment.daysLeft <= 1, 
            'expired': assignment.daysLeft < 0,
            'submitted': assignment.has_submitted
          }"
        >
          <div class="grid-header">
            <div class="status-indicator" :class="getStatusClass(assignment)"></div>
            <div class="grid-course">{{ assignment.course_name }}</div>
            <div class="grid-status">
              <span class="status-badge" :class="getStatusClass(assignment)">
                {{ assignment.submission_status }}
              </span>
            </div>
          </div>
          
          <div class="grid-body">
            <div class="grid-title">{{ assignment.title }}</div>
            <div class="grid-teacher">
              <i class="fas fa-user-graduate"></i> {{ assignment.teacher }}
            </div>
            <div class="grid-description">
              {{ truncateText(assignment.description, 60) }}
            </div>
            
            <div class="grid-deadline">
              <i class="far fa-clock"></i>
              <span>{{ formatDate(assignment.deadline) }}</span>
              <span v-if="assignment.daysLeft >= 0" class="grid-days-left">
                {{ getDaysLeftText(assignment.daysLeft) }}
              </span>
            </div>
            
            <div v-if="assignment.has_submitted && assignment.score !== null" class="grid-score">
              <i class="fas fa-star"></i> 成绩：{{ assignment.score }}分
            </div>
          </div>
          
          <div class="grid-actions">
            <button 
              v-if="!assignment.has_submitted && assignment.daysLeft >= 0"
              class="btn btn-primary btn-sm"
              @click="submitAssignment(assignment)"
            >
              <i class="fas fa-paper-plane"></i> 提交
            </button>
            <button 
              v-else-if="assignment.has_submitted"
              class="btn btn-success btn-sm"
              @click="viewSubmission(assignment)"
            >
              <i class="fas fa-eye"></i> 查看
            </button>
            <button 
              v-else
              class="btn btn-secondary btn-sm"
              disabled
            >
              已截止
            </button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && filteredAssignments.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>没有找到相关作业</h3>
          <p v-if="searchKeyword">尝试更换搜索关键词或重置筛选条件</p>
          <p v-else>当前没有{{ activeStatus === 'all' ? '' : activeStatus }}作业</p>
          <button class="btn btn-primary" @click="resetFilters">
            <i class="fas fa-redo"></i> 重置筛选
          </button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载作业...</p>
      </div>
    </div>
    
    <!-- 作业提交弹窗 -->
    <div v-if="showSubmitModal" class="submit-modal" @click.self="closeSubmitModal">
      <div class="submit-modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-paper-plane"></i> 提交作业</h3>
          <button class="modal-close" @click="closeSubmitModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 作业详情展示 -->
          <div class="assignment-preview">
            <h4>{{ currentAssignment?.title }}</h4>
            <div class="preview-info">
              <div class="info-row">
                <span class="label">课程：</span>
                <span class="value">{{ currentAssignment?.course_name }}</span>
              </div>
              <div class="info-row">
                <span class="label">教师：</span>
                <span class="value">{{ currentAssignment?.teacher }}</span>
              </div>
              <div class="info-row">
                <span class="label">截止时间：</span>
                <span class="value deadline">{{ formatDateTime(currentAssignment?.deadline) }}</span>
              </div>
              <div class="info-row">
                <span class="label">作业要求：</span>
                <span class="value">{{ currentAssignment?.description }}</span>
              </div>
            </div>
          </div>
          
          <!-- 文件上传区域 -->
          <div class="upload-section">
            <h4><i class="fas fa-upload"></i> 提交文件</h4>
            <div class="upload-area" 
                 @dragenter.prevent @dragover.prevent @drop="handleDrop"
                 :class="{ 'drag-over': isDragOver }"
            >
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileSelect"
                style="display: none"
                multiple
              />
              <div v-if="selectedFiles.length === 0" class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>点击或拖拽文件到此处上传</p>
                <p class="upload-hint">支持多种文件格式，单个文件最大50MB</p>
                <button class="btn btn-outline" @click="selectFile">
                  <i class="fas fa-folder-open"></i> 选择文件
                </button>
              </div>
              <div v-else class="files-list">
                <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                  <i :class="getFileIcon(file)"></i>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <button class="btn-remove" @click="removeFile(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button class="btn-add-more" @click="selectFile">
                  <i class="fas fa-plus"></i> 添加更多文件
                </button>
              </div>
            </div>
            
            <!-- 提交说明 -->
            <div class="form-group">
              <label for="comment">
                <i class="fas fa-comment"></i> 提交说明（可选）
              </label>
              <textarea 
                v-model="submitComment" 
                placeholder="可以添加作业说明、备注等信息"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <!-- 提交操作 -->
          <div class="submit-actions">
            <button 
              class="btn btn-primary" 
              :disabled="selectedFiles.length === 0 || submitting"
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
          <h3><i class="fas fa-file-alt"></i> 提交详情</h3>
          <button class="modal-close" @click="closeDetailModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="submission-detail">
            <div class="submission-header">
              <div class="submission-title">{{ selectedSubmission?.title }}</div>
              <div class="submission-course">{{ selectedSubmission?.course_name }}</div>
            </div>
            
            <!-- 提交信息 -->
            <div class="info-section">
              <h4><i class="fas fa-info-circle"></i> 基本信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">提交时间：</span>
                  <span class="value">{{ formatDateTime(selectedSubmission?.submitted_at) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">提交状态：</span>
                  <span class="value status-submitted">已提交</span>
                </div>
                <div v-if="selectedSubmission?.score !== null" class="info-item">
                  <span class="label">批改状态：</span>
                  <span class="value status-graded">已批改</span>
                </div>
              </div>
            </div>
            
            <!-- 评分信息 -->
            <div v-if="selectedSubmission?.score !== null" class="info-section">
              <h4><i class="fas fa-chart-line"></i> 评分信息</h4>
              <div class="score-section">
                <div class="score-display">
                  <div class="score-value">
                    {{ selectedSubmission?.score }}<span class="score-unit">分</span>
                  </div>
                  <div class="score-grade">
                    <span :class="getGradeClass(selectedSubmission?.score)">
                      等级：{{ getGrade(selectedSubmission?.score) }}
                    </span>
                  </div>
                </div>
                <div v-if="selectedSubmission?.feedback" class="feedback-section">
                  <div class="feedback-label">教师反馈：</div>
                  <div class="feedback-content">{{ selectedSubmission?.feedback }}</div>
                </div>
              </div>
            </div>
            
            <!-- 提交文件 -->
            <div class="info-section">
              <h4><i class="fas fa-file"></i> 提交文件</h4>
              <div class="files-section">
                <div v-for="(file, index) in selectedSubmission?.files || []" :key="index" class="submitted-file">
                  <i :class="getFileIcon(file)"></i>
                  <div class="file-details">
                    <div class="file-name">{{ file.name || file.file_name }}</div>
                    <div class="file-info">
                      <span class="file-size">{{ file.size || file.file_size }}</span>
                      <span class="file-time">{{ formatDateTime(file.uploaded_at) }}</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <button class="btn-download" @click="downloadFile(file)">
                      <i class="fas fa-download"></i> 下载
                    </button>
                    <button class="btn-preview" @click="previewFile(file)">
                      <i class="fas fa-eye"></i> 预览
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 提交说明 -->
            <div v-if="selectedSubmission?.comment" class="info-section">
              <h4><i class="fas fa-comment"></i> 提交说明</h4>
              <div class="comment-section">
                {{ selectedSubmission?.comment }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 作业详情弹窗 -->
    <div v-if="showAssignmentModal" class="assignment-modal" @click.self="closeAssignmentModal">
      <div class="assignment-modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-info-circle"></i> 作业详情</h3>
          <button class="modal-close" @click="closeAssignmentModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="assignment-detail">
            <div class="detail-header">
              <div class="detail-title">{{ selectedAssignment?.title }}</div>
              <div class="detail-subtitle">
                {{ selectedAssignment?.course_name }} | {{ selectedAssignment?.teacher }}
              </div>
            </div>
            
            <div class="detail-section">
              <h4><i class="fas fa-clipboard-list"></i> 作业要求</h4>
              <div class="detail-content">
                {{ selectedAssignment?.description }}
              </div>
            </div>
            
            <div class="detail-section">
              <h4><i class="fas fa-calendar-alt"></i> 时间信息</h4>
              <div class="time-info">
                <div class="time-item">
                  <span class="label">发布时间：</span>
                  <span class="value">{{ formatDateTime(selectedAssignment?.created_at) }}</span>
                </div>
                <div class="time-item">
                  <span class="label">截止时间：</span>
                  <span class="value deadline">{{ formatDateTime(selectedAssignment?.deadline) }}</span>
                  <span v-if="selectedAssignment?.daysLeft >= 0" class="days-left">
                    {{ getDaysLeftText(selectedAssignment?.daysLeft) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="detail-section" v-if="selectedAssignment?.attachments && selectedAssignment.attachments.length > 0">
              <h4><i class="fas fa-paperclip"></i> 附件</h4>
              <div class="attachments-list">
                <div v-for="(attachment, index) in selectedAssignment?.attachments" :key="index" class="attachment-item">
                  <i class="fas fa-file"></i>
                  <div class="attachment-name">{{ attachment.name }}</div>
                  <button class="btn-download" @click="downloadAttachment(selectedAssignment, attachment)">
                    <i class="fas fa-download"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="detail-actions">
              <button 
                v-if="!selectedAssignment?.has_submitted && selectedAssignment?.daysLeft >= 0"
                class="btn btn-primary"
                @click="submitAssignment(selectedAssignment)"
              >
                <i class="fas fa-paper-plane"></i> 提交作业
              </button>
              <button 
                v-else-if="selectedAssignment?.has_submitted"
                class="btn btn-success"
                @click="viewSubmission(selectedAssignment)"
              >
                <i class="fas fa-eye"></i> 查看提交
              </button>
              <button class="btn btn-secondary" @click="closeAssignmentModal">
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { showToast } from '../api/Toast'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const assignments = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const activeStatus = ref('all')
const viewMode = ref('list') // 'list' or 'grid'
const sortBy = ref('deadline')
const showSubmitModal = ref(false)
const showDetailModal = ref(false)
const showAssignmentModal = ref(false)
const submitting = ref(false)
const currentAssignment = ref(null)
const selectedSubmission = ref(null)
const selectedAssignment = ref(null)
const selectedFiles = ref([])
const submitComment = ref('')
const isDragOver = ref(false)
const error = ref(null)

// 状态筛选选项
const statusFilters = ref([
  { label: '全部', value: 'all', icon: 'fas fa-list' },
  { label: '待提交', value: 'pending', icon: 'fas fa-clock' },
  { label: '已提交', value: 'submitted', icon: 'fas fa-check-circle' },
  { label: '已截止', value: 'expired', icon: 'fas fa-ban' },
  { label: '待批改', value: 'ungraded', icon: 'fas fa-hourglass-half' },
  { label: '已批改', value: 'graded', icon: 'fas fa-star' }
])

// 模拟数据（后期替换为API调用）
const mockData = {
  assignments: [
    { 
      assignment_id: 1, 
      title: "第一次编程作业", 
      description: "实现基本的排序算法，包括冒泡排序、快速排序和归并排序，要求有完整的注释和测试用例", 
      deadline: "2024-03-15T23:59:59Z",
      created_at: "2024-03-01T10:00:00Z",
      has_submitted: false, 
      submission_status: "未提交",
      course_name: "计算机科学导论",
      course_code: "CS101",
      teacher: "王教授",
      attachments: [
        { name: "作业要求.pdf", url: "/files/assignments/1.pdf" }
      ],
      attachment_count: 1,
      daysLeft: 3
    },
    { 
      assignment_id: 2, 
      title: "数据结构实验报告", 
      description: "实现链表数据结构，包括单链表和双向链表，要求提供完整的代码和测试结果", 
      deadline: "2024-03-18T23:59:59Z",
      created_at: "2024-03-05T14:30:00Z",
      has_submitted: true, 
      submission_status: "已提交",
      course_name: "数据结构",
      course_code: "CS201",
      teacher: "李教授",
      score: 90.5,
      feedback: "代码结构清晰，算法实现正确，但注释可以更详细一些",
      submitted_at: "2024-03-14T15:30:00Z",
      files: [
        { name: "实验报告.zip", size: "2.5MB", uploaded_at: "2024-03-14T15:30:00Z" }
      ],
      daysLeft: 5
    },
    { 
      assignment_id: 3, 
      title: "高等数学第三章习题", 
      description: "完成课后习题1-20，需要详细计算过程，并附上解题思路", 
      deadline: "2024-03-10T23:59:59Z",
      created_at: "2024-03-02T09:15:00Z",
      has_submitted: false, 
      submission_status: "已截止",
      course_name: "高等数学",
      course_code: "MA101",
      teacher: "张教授",
      daysLeft: -2
    },
    { 
      assignment_id: 4, 
      title: "数据库设计实验", 
      description: "设计一个学生选课系统的数据库，包括ER图、关系模式和SQL语句", 
      deadline: "2024-03-20T23:59:59Z",
      created_at: "2024-03-06T13:45:00Z",
      has_submitted: true, 
      submission_status: "待批改",
      course_name: "数据库系统",
      course_code: "CS301",
      teacher: "刘教授",
      submitted_at: "2024-03-12T10:20:00Z",
      files: [
        { name: "数据库设计.docx", size: "1.8MB", uploaded_at: "2024-03-12T10:20:00Z" }
      ],
      daysLeft: 7
    }
  ]
}

// 计算属性
const filteredAssignments = computed(() => {
  let filtered = [...assignments.value]
  
  // 按状态筛选
  if (activeStatus.value !== 'all') {
    filtered = filtered.filter(assignment => {
      switch (activeStatus.value) {
        case 'pending':
          return !assignment.has_submitted && assignment.daysLeft >= 0
        case 'submitted':
          return assignment.has_submitted
        case 'expired':
          return assignment.daysLeft < 0
        case 'ungraded':
          return assignment.has_submitted && assignment.score === null
        case 'graded':
          return assignment.has_submitted && assignment.score !== null
        default:
          return true
      }
    })
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(assignment => 
      assignment.title.toLowerCase().includes(keyword) ||
      assignment.course_name.toLowerCase().includes(keyword) ||
      assignment.teacher.toLowerCase().includes(keyword) ||
      assignment.description.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline)
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'course_name':
        return a.course_name.localeCompare(b.course_name)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return new Date(a.deadline) - new Date(b.deadline)
    }
  })
  
  return filtered
})

const pendingCount = computed(() => {
  return assignments.value.filter(a => !a.has_submitted && a.daysLeft >= 0).length
})

const submittedCount = computed(() => {
  return assignments.value.filter(a => a.has_submitted).length
})

const urgentCount = computed(() => {
  return assignments.value.filter(a => a.daysLeft >= 0 && a.daysLeft <= 1).length
})

const avgScore = computed(() => {
  const gradedAssignments = assignments.value.filter(a => a.score !== null)
  if (gradedAssignments.length === 0) return null
  const sum = gradedAssignments.reduce((acc, a) => acc + a.score, 0)
  return (sum / gradedAssignments.length).toFixed(1)
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
      status: activeStatus.value,
      search: searchKeyword.value,
      sort_by: sortBy.value
    })
    
    if (response.success) {
      assignments.value = response.data.assignments.map(assignment => {
        const deadline = new Date(assignment.deadline)
        const now = new Date()
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
        
        return {
          ...assignment,
          daysLeft,
          submission_status: getSubmissionStatus(assignment, daysLeft)
        }
      })
    } else {
      error.value = response.error
      // 加载失败时使用模拟数据
      assignments.value = mockData.assignments.map(processAssignmentData)
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟加载延迟
    setTimeout(() => {
      assignments.value = mockData.assignments.map(processAssignmentData)
      loading.value = false
    }, 800)
    
  } catch (err) {
    console.error('加载作业失败:', err)
    error.value = '加载失败，请稍后重试'
    assignments.value = mockData.assignments.map(processAssignmentData)
    loading.value = false
  }
}

const processAssignmentData = (assignment) => {
  const deadline = new Date(assignment.deadline)
  const now = new Date()
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  
  return {
    ...assignment,
    daysLeft,
    submission_status: getSubmissionStatus(assignment, daysLeft)
  }
}

const getSubmissionStatus = (assignment, daysLeft) => {
  if (assignment.has_submitted) {
    return assignment.score !== null ? '已批改' : '已提交'
  } else if (daysLeft < 0) {
    return '已截止'
  } else if (daysLeft <= 1) {
    return '即将截止'
  } else {
    return '未提交'
  }
}

const getStatusClass = (assignment) => {
  if (assignment.has_submitted) {
    return assignment.score !== null ? 'graded' : 'submitted'
  } else if (assignment.daysLeft < 0) {
    return 'expired'
  } else if (assignment.daysLeft <= 1) {
    return 'urgent'
  } else {
    return 'pending'
  }
}

const getStatusCount = (status) => {
  if (status === 'all') return assignments.value.length
  
  return assignments.value.filter(assignment => {
    switch (status) {
      case 'pending':
        return !assignment.has_submitted && assignment.daysLeft >= 0
      case 'submitted':
        return assignment.has_submitted
      case 'expired':
        return assignment.daysLeft < 0
      case 'ungraded':
        return assignment.has_submitted && assignment.score === null
      case 'graded':
        return assignment.has_submitted && assignment.score !== null
      default:
        return false
    }
  }).length
}

const filterByStatus = (status) => {
  activeStatus.value = status
}

const handleSearch = () => {
  // 防抖搜索逻辑
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadAssignments()
  }, 500)
}

const handleSortChange = () => {
  // 重新排序作业列表
  assignments.value.sort((a, b) => {
    switch (sortBy.value) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline)
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'course_name':
        return a.course_name.localeCompare(b.course_name)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return new Date(a.deadline) - new Date(b.deadline)
    }
  })
}

const refreshAssignments = () => {
  loadAssignments()
}

const resetFilters = () => {
  searchKeyword.value = ''
  activeStatus.value = 'all'
  loadAssignments()
}

const submitAssignment = (assignment) => {
  if (!authStore.isAuthenticated) {
    showToast('请先登录', 'error')
    return
  }
  
  currentAssignment.value = assignment
  selectedFiles.value = []
  submitComment.value = ''
  showSubmitModal.value = true
}

const viewSubmission = (assignment) => {
  // 模拟提交数据
  const mockSubmission = {
    assignment_id: assignment.assignment_id,
    title: assignment.title,
    course_name: assignment.course_name,
    submitted_at: assignment.submitted_at || new Date().toISOString(),
    score: assignment.score,
    feedback: assignment.feedback,
    comment: "按时完成作业，请老师批阅",
    files: assignment.files || [
      { name: assignment.file_name || 'assignment.zip', size: assignment.file_size || '2.5MB', uploaded_at: assignment.submitted_at }
    ]
  }
  
  selectedSubmission.value = mockSubmission
  showDetailModal.value = true
}

const viewAssignmentDetails = (assignment) => {
  selectedAssignment.value = assignment
  showAssignmentModal.value = true
}

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  
  // 验证文件
  files.forEach(file => {
    // 验证文件大小（最大50MB）
    if (file.size > 50 * 1024 * 1024) {
      showToast(`文件 ${file.name} 大小超过50MB限制`, 'error')
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
      showToast(`不支持的文件类型: ${file.type}`, 'error')
      return
    }
    
    // 添加到文件列表
    selectedFiles.value.push(file)
  })
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) {
    handleFileSelect({ target: { files } })
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const confirmSubmit = async () => {
  if (selectedFiles.value.length === 0) {
    showToast('请选择要提交的文件', 'error')
    return
  }
  
  submitting.value = true
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const formData = new FormData()
    selectedFiles.value.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    if (submitComment.value) {
      formData.append('comment', submitComment.value)
    }
    
    const response = await submitAssignmentAPI(
      currentAssignment.value.assignment_id,
      formData
    )
    
    if (response.success) {
      showToast('作业提交成功！', 'success')
      closeSubmitModal()
      loadAssignments() // 重新加载列表
    } else {
      showToast(response.error || '提交失败', 'error')
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟提交过程
    setTimeout(() => {
      showToast('作业提交成功！', 'success')
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
          files: selectedFiles.value.map(file => ({
            name: file.name,
            size: formatFileSize(file.size),
            uploaded_at: new Date().toISOString()
          }))
        }
      }
    }, 1500)
    
  } catch (err) {
    console.error('提交作业失败:', err)
    showToast('提交失败，请稍后重试', 'error')
    submitting.value = false
  }
}

const downloadAttachment = (assignment, attachment = null) => {
  const fileName = attachment ? attachment.name : '附件'
  showToast(`下载文件: ${fileName}`, 'info')
  // 实际应该通过文件URL下载
}

const downloadFile = (file) => {
  showToast(`下载文件: ${file.name || file.file_name}`, 'info')
  // 实际应该通过文件URL下载
}

const previewFile = (file) => {
  showToast(`预览文件: ${file.name || file.file_name}`, 'info')
  // 实际可以跳转到文件预览页面或打开预览弹窗
}

const closeSubmitModal = () => {
  showSubmitModal.value = false
  currentAssignment.value = null
  selectedFiles.value = []
  submitComment.value = ''
  submitting.value = false
  isDragOver.value = false
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedSubmission.value = null
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  selectedAssignment.value = null
}

// 辅助函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
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

const getDaysLeftText = (daysLeft) => {
  if (daysLeft < 0) return '已截止'
  if (daysLeft === 0) return '今天截止'
  if (daysLeft === 1) return '明天截止'
  return `${daysLeft}天后截止`
}

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file) => {
  const name = file.name || file.file_name || ''
  if (name.endsWith('.pdf')) return 'fas fa-file-pdf'
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'fas fa-file-word'
  if (name.endsWith('.zip') || name.endsWith('.rar')) return 'fas fa-file-archive'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) return 'fas fa-file-image'
  return 'fas fa-file'
}

const getGrade = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '不及格'
}

const getGradeClass = (score) => {
  if (score >= 90) return 'grade-excellent'
  if (score >= 80) return 'grade-good'
  if (score >= 70) return 'grade-medium'
  if (score >= 60) return 'grade-pass'
  return 'grade-fail'
}

// 引用
const fileInput = ref(null)

// 搜索防抖计时器
let searchTimer = null
</script>

<style scoped>
.homework-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  background-color: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.header-content h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.search-box input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn-refresh {
  padding: 12px 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-refresh:hover {
  background-color: #e9ecef;
}

/* 状态筛选 */
.status-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.status-filter button {
  padding: 10px 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  position: relative;
}

.status-filter button:hover {
  border-color: #3498db;
  color: #3498db;
}

.status-filter button.active {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
}

.count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* 统计卡片 */
.homework-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 作业列表区域 */
.homework-list-section {
  background-color: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-options label {
  color: #666;
  font-size: 0.9rem;
}

.sort-options select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  color: #555;
  cursor: pointer;
}

.view-options {
  display: flex;
  gap: 5px;
}

.view-options button {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.view-options button:hover {
  background-color: #e9ecef;
}

.view-options button.active {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
}

/* 列表视图 */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.assignment-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  border-left: 4px solid #3498db;
}

.assignment-card.list-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.assignment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.assignment-card.urgent {
  border-left-color: #e74c3c;
  background-color: #fff5f5;
}

.assignment-card.expired {
  border-left-color: #95a5a6;
  background-color: #f5f5f5;
  opacity: 0.9;
}

.assignment-card.submitted {
  border-left-color: #2ecc71;
  background-color: #f0fff4;
}

.assignment-main {
  flex: 1;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.assignment-title-section {
  flex: 1;
}

.assignment-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.assignment-course {
  color: #666;
  font-size: 0.9rem;
}

.assignment-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.pending {
  background-color: #ffebee;
  color: #c62828;
}

.status-badge.submitted {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.expired {
  background-color: #f5f5f5;
  color: #757575;
}

.status-badge.urgent {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-badge.graded {
  background-color: #e3f2fd;
  color: #1565c0;
}

.assignment-score {
  color: #f39c12;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.assignment-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.assignment-meta {
  display: flex;
  gap: 20px;
  color: #888;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.days-left {
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 10px;
  font-size: 0.8rem;
}

.assignment-card.urgent .days-left {
  background-color: #fff3e0;
  color: #ef6c00;
}

.assignment-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* 网格视图 */
.homework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.assignment-card.grid-view {
  display: flex;
  flex-direction: column;
  min-height: 250px;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
}

.status-indicator {
  position: absolute;
  left: -24px;
  top: 0;
  width: 4px;
  height: 100%;
  border-radius: 2px;
}

.status-indicator.pending {
  background-color: #c62828;
}

.status-indicator.submitted {
  background-color: #2e7d32;
}

.status-indicator.expired {
  background-color: #757575;
}

.status-indicator.urgent {
  background-color: #ef6c00;
}

.status-indicator.graded {
  background-color: #1565c0;
}

.grid-course {
  font-weight: 600;
  color: #3498db;
  flex: 1;
}

.grid-status {
  font-size: 0.8rem;
}

.grid-body {
  flex: 1;
  margin-bottom: 15px;
}

.grid-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.grid-teacher {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.grid-description {
  color: #777;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.grid-deadline {
  color: #888;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.grid-days-left {
  margin-left: 8px;
  padding: 2px 6px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 10px;
  font-size: 0.75rem;
}

.assignment-card.urgent .grid-days-left {
  background-color: #fff3e0;
  color: #ef6c00;
}

.grid-score {
  color: #f39c12;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.grid-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-success {
  background-color: #2ecc71;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e9ecef;
}

.btn-outline {
  background-color: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #e3f2fd;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  color: #2ecc71;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 10px;
}

.empty-state p {
  color: #888;
  margin-bottom: 20px;
}

/* 加载状态 */
.loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 弹窗样式 */
.submit-modal,
.detail-modal,
.assignment-modal {
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

.submit-modal-content,
.detail-modal-content,
.assignment-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
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
  display: flex;
  align-items: center;
  gap: 10px;
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

/* 作业预览 */
.assignment-preview {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.assignment-preview h4 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.preview-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.info-row .label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-row .value {
  color: #333;
  flex: 1;
  line-height: 1.5;
}

.info-row .deadline {
  color: #e74c3c;
  font-weight: 500;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 25px;
}

.upload-section h4 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.upload-area.drag-over {
  border-color: #3498db;
  background-color: #e3f2fd;
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

.files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.file-item i {
  font-size: 1.5rem;
  color: #3498db;
  width: 30px;
}

.file-info {
  flex: 1;
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
  color: #e74c3c;
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

.btn-add-more {
  padding: 10px 15px;
  background-color: transparent;
  border: 1px dashed #ddd;
  color: #666;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: all 0.3s;
}

.btn-add-more:hover {
  border-color: #3498db;
  color: #3498db;
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

/* 提交详情 */
.submission-detail {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.submission-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.submission-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.submission-course {
  color: #666;
  font-size: 1rem;
}

.info-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.info-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-section h4 {
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
  color: #2ecc71;
}

.status-graded {
  color: #3498db;
}

/* 评分区域 */
.score-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  color: #3498db;
  line-height: 1;
}

.score-unit {
  font-size: 1.5rem;
  font-weight: 500;
}

.score-grade span {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
}

.grade-excellent {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.grade-good {
  background-color: #e3f2fd;
  color: #1565c0;
}

.grade-medium {
  background-color: #fff3e0;
  color: #ef6c00;
}

.grade-pass {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.grade-fail {
  background-color: #ffebee;
  color: #c62828;
}

.feedback-section {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.feedback-label {
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.feedback-content {
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* 文件区域 */
.files-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.submitted-file {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.submitted-file i {
  font-size: 2rem;
  color: #3498db;
  width: 40px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.file-info {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.85rem;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.btn-download,
.btn-preview {
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
  background-color: #3498db;
  color: white;
}

.btn-download:hover {
  background-color: #2980b9;
}

.btn-preview {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-preview:hover {
  background-color: #e9ecef;
}

/* 评论区域 */
.comment-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #2ecc71;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* 作业详情 */
.assignment-detail {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.detail-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.detail-subtitle {
  color: #666;
  font-size: 1rem;
}

.detail-section h4 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-content {
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-item .label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.time-item .value {
  color: #333;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-radius: 8px;
}

.attachment-item i {
  color: #3498db;
  width: 20px;
}

.attachment-name {
  flex: 1;
  color: #333;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .homework-view {
    padding: 15px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-filter {
    justify-content: center;
  }
  
  .homework-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .list-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .assignment-card.list-view {
    flex-direction: column;
    align-items: stretch;
  }
  
  .assignment-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .assignment-status {
    flex-direction: row;
    justify-content: flex-start;
  }
  
  .assignment-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .homework-grid {
    grid-template-columns: 1fr;
  }
  
  .submit-modal-content,
  .detail-modal-content,
  .assignment-modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .score-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .submitted-file {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .file-info {
    justify-content: center;
  }
  
  .detail-actions {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .homework-stats {
    grid-template-columns: 1fr;
  }
  
  .status-filter {
    flex-direction: column;
  }
  
  .status-filter button {
    justify-content: center;
  }
}
</style>