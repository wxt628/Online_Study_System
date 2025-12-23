<!-- MiniAppsModule.vue -->
<template>
  <div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background-color: #4CAF50;">
        <i class="fas fa-th-large"></i>
      </div>
      <h2>校园小程序平台</h2>
      <router-link to="/miniapps" class="module-more">
        查看全部 <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>
    <div class="module-description">
      <p>集成多个校园服务小程序，统一入口，便捷访问</p>
    </div>
    <div class="mini-programs-grid">
      <div 
        v-for="program in miniPrograms" 
        :key="program.program_id" 
        class="mini-program-card"
        @click="openMiniProgram(program)"
      >
        <div class="program-icon" :style="{ backgroundColor: getCategoryColor(program.category) }">
          <i :class="getProgramIcon(program.name)"></i>
        </div>
        <div class="program-name">{{ program.name }}</div>
        <div class="program-category">{{ program.category }}</div>
      </div>
      <div v-if="loading" class="skeleton-card"></div>
      <div v-if="loading" class="skeleton-card"></div>
      <div v-if="loading" class="skeleton-card"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  miniPrograms: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['openProgram'])

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
    '失物招领': 'fas fa-search'
  }
  return icons[name] || 'fas fa-th-large'
}

const openMiniProgram = (program) => {
  if (!authStore.isAuthenticated) {
    // 触发登录弹窗逻辑
    emit('needLogin')
    return
  }
  emit('openProgram', program)
  // 这里可以添加跳转到小程序详情页的逻辑
  // router.push(`/miniapp/${program.program_id}`)
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

/* 小程序网格 */
.mini-programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.mini-program-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.mini-program-card:hover {
  background-color: #eef5ff;
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
}

.program-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  color: white;
  font-size: 1.3rem;
}

.program-name {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: #333;
}

.program-category {
  font-size: 0.75rem;
  color: #888;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
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

@media (max-width: 576px) {
  .module-card {
    padding: 20px;
  }
}
</style>