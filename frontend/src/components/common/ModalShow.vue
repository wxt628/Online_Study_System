<template>
  <!-- 小程序详情弹窗 -->
  <Teleport to="body">
    <div v-if="modelValue" class="program-modal" @click.self="closeModal">
      <div class="program-modal-content">
        <div class="modal-header">
          <h3>{{ modelValue.name }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="program-detail">
            <div class="program-icon-large" :style="{ backgroundColor: getCategoryColor(modelValue.category) }">
              <i :class="getProgramIcon(modelValue.name)"></i>
            </div>
            <div class="program-info">
              <div class="info-row">
                <span class="label">分类：</span>
                <span class="value">{{ modelValue.category }}</span>
              </div>
              <div class="info-row">
                <span class="label">描述：</span>
                <span class="value">{{ modelValue.description }}</span>
              </div>
              <div class="info-row">
                <span class="label">更新时间：</span>
                <span class="value">{{ formatDate(modelValue.updated_at) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" @click="launchProgram(modelValue)">
              <i class="fas fa-external-link-alt"></i> 立即使用
            </button>
            <button class="btn btn-secondary" @click="closeModal">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { showToast } from '../../api/Toast'

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

// 方法
const getCategoryColor = (category) => {
  const colors = {
    '教务': '#3498db',
    '生活': '#2ecc71',
    '工具': '#9b59b6',
    '其他': '#95a5a6'
  }
  return colors[category] || colors['其他']
}

const getProgramIcon = (name) => {
  const icons = {
    '校园一卡通': 'fas fa-credit-card',
    '图书馆查询': 'fas fa-book',
    '课表查询': 'fas fa-calendar-alt',
    '电费缴纳': 'fas fa-bolt',
    '成绩查询': 'fas fa-chart-line',
    '失物招领': 'fas fa-search',
    '校园网充值': 'fas fa-wifi',
    '教室预约': 'fas fa-door-closed'
  }
  return icons[name] || 'fas fa-th-large'
}

const launchProgram = (program) => {
  const url = program && program.url
  if (!url) {
    showToast('未配置链接', 'error')
    return
  }
  try {
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (e) {
    location.href = url
  }
  closeModal()
}

const closeModal = () => {
  emit('update:modelValue', null)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>
<style scoped>
/* 详情弹窗 */
.program-modal {
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

.program-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
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

.program-detail {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 25px;
}

.program-icon-large {
  width: 80px;
  height: 80px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  flex-shrink: 0;
}

.program-info {
  flex: 1;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
}

.info-row .label {
  font-weight: 500;
  color: #666;
  min-width: 60px;
}

.info-row .value {
  color: #333;
  flex: 1;
}

.modal-actions {
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
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mini-programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
  
  .program-detail {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .info-row {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
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
}
</style>
