<!-- AllMiniPrograms.vue -->
<template>
  <section class="mini-list-section">
    <div class="section-header">
      <h2><i class="fas fa-th-large"></i> 全部小程序</h2>
      <div class="mini-count">
        共 <span>{{ filteredPrograms.length }}</span> 个小程序
      </div>
    </div>
    
    <div class="mini-grid">
      <div 
        v-for="program in filteredPrograms" 
        :key="program.program_id" 
        class="mini-card"
        :class="{ favorite: isProgramFavorited(program.program_id) }"
        @click="openMiniProgram(program)"
      >
        <div class="mini-icon" :style="{ backgroundColor: getIconColor(program.program_id) }">
          <i :class="getProgramIcon(program.name)"></i>
        </div>
        <div class="mini-name">{{ program.name }}</div>
        <div class="mini-category">{{ program.category }}</div>
        <div class="mini-description">{{ program.description }}</div>
        <button 
          class="mini-favorite-btn"
          :class="{ favorite: isProgramFavorited(program.program_id) }"
          @click.stop="toggleFavorite(program.program_id)"
        >
          <i class="fas fa-star"></i>
        </button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-mini">
        <div class="loading-spinner"></div>
        <p>正在加载小程序...</p>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && filteredPrograms.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <h3>未找到相关小程序</h3>
        <p>请尝试其他搜索关键词或分类</p>
      </div>

      <ModalShow v-model="currentProgram" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useMiniAppsStore } from '../../stores/miniApps'
import ModalShow from '../common/ModalShow.vue'

const authStore = useAuthStore()
const miniAppsStore = useMiniAppsStore()
const currentProgram = ref(null)

// 组件属性
const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  activeCategory: {
    type: String,
    default: 'all'
  },
  activeSort: {
    type: String,
    default: 'display_order'
  },
  loading: {  // 添加loading属性
    type: Boolean,
    default: false
  }
})

// 本地状态用于收藏，确保响应式更新
const localFavorites = ref([...miniAppsStore.userFavorites])

// 监听store中的收藏变化
watch(
  () => miniAppsStore.userFavorites,
  (newFavorites) => {
    localFavorites.value = [...newFavorites]
  },
  { deep: true }
)

// 计算属性
const filteredPrograms = computed(() => {
  let programs = miniAppsStore.miniPrograms
  
  // 按分类筛选
  if (props.activeCategory !== 'all') {
    programs = programs.filter(p => p.category === props.activeCategory)
  }
  
  // 按关键词搜索
  if (props.searchKeyword) {
    const keyword = props.searchKeyword.toLowerCase()
    programs = programs.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  programs.sort((a, b) => {
    switch (props.activeSort) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'recent':
        // 按最近使用时间排序
        const aRecent = miniAppsStore.userRecentUse.find(item => item.program_id === a.program_id)
        const bRecent = miniAppsStore.userRecentUse.find(item => item.program_id === b.program_id)
        
        if (!aRecent && !bRecent) return 0
        if (!aRecent) return 1
        if (!bRecent) return -1
        
        return new Date(bRecent.used_at) - new Date(aRecent.used_at)
      case 'display_order':
      default:
        return a.display_order - b.display_order
    }
  })
  
  return programs
})

// 方法
const getIconColor = (programId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
    '#118AB2', '#073B4C', '#EF476F', '#7209B7',
    '#3A86FF', '#FB5607', '#8338EC', '#FF006E'
  ]
  return colors[programId % colors.length]
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
    '教室预约': 'fas fa-door-closed',
    '校园公告': 'fas fa-bullhorn',
    '校园导航': 'fas fa-map-marked-alt',
    '活动报名': 'fas fa-calendar-check',
    '校车时刻': 'fas fa-bus-alt'
  }
  return icons[name] || 'fas fa-th-large'
}

const isProgramFavorited = (programId) => {
  return localFavorites.value.includes(programId)
}

const toggleFavorite = (programId) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  // 调用store中的方法
  miniAppsStore.toggleFavorite(programId)
  
  // 触发事件
  const isFavorite = isProgramFavorited(programId)
  emit('favorite-changed', programId, !isFavorite)
}

const openMiniProgram = (program) => {
  if (!authStore.isAuthenticated) {
    // 触发登录弹窗
    showToast('请登录！', 'error')
    return
  }
  
  currentProgram.value = program
  
  // 记录最近使用
  miniAppsStore.addRecentUse(program.program_id)
  
  // 打开小程序
  emit('open-program', program)
}

// 事件发射
const emit = defineEmits(['needLogin', 'open-program', 'favorite-changed'])

// 需要导入 showToast 函数
import { showToast } from '../../api/Toast'
</script>

<style scoped>
.mini-list-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h2 i {
  color: #4CAF50;
}

.mini-count {
  color: #666;
  font-size: 0.95rem;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 25px;
}

.mini-card {
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
  text-align: center;
  border: 1px solid transparent;
}

.mini-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #e0f7e9;
}

.mini-card.favorite {
  border-color: #FFD700;
}

.mini-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 1.5rem;
}

.mini-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 1rem;
  line-height: 1.3;
}

.mini-category {
  font-size: 0.8rem;
  color: #888;
  background-color: #f5f5f5;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 10px;
}

.mini-description {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4em;
}

.mini-favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 10;
}

.mini-favorite-btn:hover {
  color: #FFD700;
  background-color: rgba(255, 215, 0, 0.1);
}

.mini-favorite-btn.favorite {
  color: #FFD700;
}

.loading-mini {
  grid-column: 1 / -1;
  padding: 50px;
  text-align: center;
  color: #888;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #aaa;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #ddd;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #888;
}

@media (max-width: 768px) {
  .mini-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 576px) {
  .mini-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 15px;
  }
  
  .mini-card {
    padding: 15px;
  }
  
  .mini-icon {
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
  }
}
</style>