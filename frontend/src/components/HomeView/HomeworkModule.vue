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
    <div class="assignments-list">
      <div 
        v-for="assignment in assignments" 
        :key="assignment.assignment_id" 
        class="assignment-item"
      >
        <div class="assignment-header">
          <div class="assignment-title">{{ assignment.title }}</div>
          <div class="assignment-status" :class="assignment.has_submitted ? 'submitted' : 'pending'">
            {{ assignment.submission_status }}
          </div>
        </div>
        <div class="assignment-description">{{ assignment.description }}</div>
        <div class="assignment-info">
          <div class="assignment-deadline">
            <i class="far fa-clock"></i>
            <span>{{ formatDeadline(assignment.deadline) }}</span>
          </div>
          <div class="assignment-action">
            <button 
              v-if="!assignment.has_submitted" 
              class="btn-submit"
              @click="submitAssignment(assignment)"
            >
              立即提交
            </button>
            <button 
              v-else 
              class="btn-view"
              @click="viewAssignment(assignment)"
            >
              查看提交
            </button>
          </div>
        </div>
      </div>
      <div v-if="loading" class="skeleton-item"></div>
      <div v-if="loading" class="skeleton-item"></div>
      <div v-if="loading" class="skeleton-item"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  assignments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submitAssignment', 'viewAssignment', 'needLogin'])

const formatDeadline = (deadline) => {
  if (!deadline) return ''
  
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) {
    return '已截止'
  } else if (daysLeft === 0) {
    return '今天截止'
  } else if (daysLeft === 1) {
    return '明天截止'
  } else {
    return `${daysLeft}天后截止`
  }
}

const submitAssignment = (assignment) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  emit('submitAssignment', assignment)
  // router.push(`/homework/submit/${assignment.assignment_id}`)
}

const viewAssignment = (assignment) => {
  emit('viewAssignment', assignment)
  // router.push(`/homework/view/${assignment.assignment_id}`)
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

.assignment-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.assignment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.85rem;
}

.assignment-deadline {
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-submit, .btn-view {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
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

@media (max-width: 576px) {
  .module-card {
    padding: 20px;
  }
}
</style>