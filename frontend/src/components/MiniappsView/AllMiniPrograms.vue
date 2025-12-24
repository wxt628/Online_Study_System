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
          <i :class="program.icon_fa || 'fa-th-large'"></i>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
const authStore = useAuthStore()

import ModalShow from '../common/ModalShow.vue'
const currentProgram = ref(null)


// 响应式数据
const miniPrograms = ref([])
const loading = ref(false)
const userFavorites = ref([])
const userRecentUse = ref([])

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
  }
})

// ========== 模拟数据区域开始 ==========
// 模拟数据（后期替换为API调用）
const mockPrograms = [
  {
    program_id: 1,
    name: "校园一卡通",
    description: "校园卡充值、消费记录查询",
    long_description: "校园一卡通小程序提供校园卡的在线充值、消费记录查询、余额查询、挂失解挂等服务。支持微信支付、支付宝等多种支付方式，方便快捷。",
    category: "生活服务",
    icon_fa: "fa-id-card",
    display_order: 1,
    use_count: 12543,
    rating: 4.8,
    last_updated: "2024-12-01T10:00:00",
    is_active: true,
    is_official: true,
    url: "https://campus-card.example.com",
    tags: ["充值", "查询", "校园卡"]
  },
  {
    program_id: 2,
    name: "图书馆预约",
    description: "图书馆座位、书籍预约系统",
    long_description: "图书馆预约小程序提供图书馆座位预约、书籍借阅预约、研讨室预约等功能。支持实时查看座位使用情况，提前预约心仪座位。",
    category: "学习工具",
    icon_fa: "fa-book",
    display_order: 2,
    use_count: 8945,
    rating: 4.7,
    last_updated: "2024-11-25T14:30:00",
    is_active: true,
    is_official: true,
    url: "https://library-booking.example.com",
    tags: ["座位", "预约", "图书"]
  },
  {
    program_id: 3,
    name: "校园课表",
    description: "个人课程表查询与管理",
    long_description: "校园课表小程序帮助您管理个人课程表，查看上课时间、地点、教师信息。支持课程提醒、成绩查询等功能，是学习生活的好帮手。",
    category: "学习工具",
    icon_fa: "fa-calendar-alt",
    display_order: 3,
    use_count: 15678,
    rating: 4.9,
    last_updated: "2024-12-10T09:15:00",
    is_active: true,
    is_official: true,
    url: "https://class-schedule.example.com",
    tags: ["课表", "课程", "提醒"]
  },
  {
    program_id: 4,
    name: "校园公告",
    description: "学校新闻、通知公告",
    long_description: "校园公告小程序实时推送学校重要通知、新闻动态、活动信息。支持按学院、类型筛选，不错过任何重要信息。",
    category: "校园资讯",
    icon_fa: "fa-bullhorn",
    display_order: 4,
    use_count: 11234,
    rating: 4.5,
    last_updated: "2024-12-05T16:20:00",
    is_active: true,
    is_official: true,
    url: "https://campus-news.example.com",
    tags: ["新闻", "通知", "公告"]
  },
  // 更多模拟数据...
]

const mockUserFavorites = [1, 3, 5]
const mockUserRecentUse = [
  { program_id: 3, used_at: "2024-12-20T14:30:00" },
  { program_id: 1, used_at: "2024-12-20T10:15:00" },
  { program_id: 2, used_at: "2024-12-19T09:30:00" }
]
// ========== 模拟数据区域结束 ==========

// 计算属性
const filteredPrograms = computed(() => {
  let programs = miniPrograms.value.filter(p => p.is_active)
  
  // 按分类筛选
  if (props.activeCategory !== 'all') {
    programs = programs.filter(p => p.category.includes(props.activeCategory))
  }
  
  // 按关键词搜索
  if (props.searchKeyword) {
    const keyword = props.searchKeyword.toLowerCase()
    programs = programs.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(keyword))) ||
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
        const aRecent = userRecentUse.value.find(item => item.program_id === a.program_id)
        const bRecent = userRecentUse.value.find(item => item.program_id === b.program_id)
        
        if (!aRecent && !bRecent) return 0
        if (!aRecent) return 1
        if (!bRecent) return -1
        
        return new Date(bRecent.used_at) - new Date(aRecent.used_at)
      case 'popular':
        return b.use_count - a.use_count
      case 'display_order':
      default:
        return a.display_order - b.display_order
    }
  })
  
  return programs
})

// 生命周期
onMounted(() => {
  loadMiniPrograms()
})

// 方法
const loadMiniPrograms = async () => {
  loading.value = true
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    // 获取小程序列表
    const response = await fetch('/api/v1/mini-programs', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.code === 200) {
        miniPrograms.value = data.data.items
      }
    }
    
    // 获取用户收藏
    const favoritesResponse = await fetch('/api/v1/users/me/favorites', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (favoritesResponse.ok) {
      const data = await favoritesResponse.json()
      if (data.code === 200) {
        userFavorites.value = data.data.favorites
      }
    }
    
    // 获取最近使用
    const recentResponse = await fetch('/api/v1/users/me/recent-use', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (recentResponse.ok) {
      const data = await recentResponse.json()
      if (data.code === 200) {
        userRecentUse.value = data.data.recent_use
      }
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟加载延迟
    setTimeout(() => {
      miniPrograms.value = mockPrograms
      userFavorites.value = mockUserFavorites
      userRecentUse.value = mockUserRecentUse
      loading.value = false
    }, 500)
    
  } catch (err) {
    console.error('加载小程序失败:', err)
    loading.value = false
    
    // 加载失败时使用模拟数据
    miniPrograms.value = mockPrograms
    userFavorites.value = mockUserFavorites
    userRecentUse.value = mockUserRecentUse
  }
}

const getIconColor = (programId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
    '#118AB2', '#073B4C', '#EF476F', '#7209B7',
    '#3A86FF', '#FB5607', '#8338EC', '#FF006E'
  ]
  return colors[programId % colors.length]
}

const isProgramFavorited = (programId) => {
  return userFavorites.value.includes(programId)
}

const toggleFavorite = (programId) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  const index = userFavorites.value.indexOf(programId)
  
  if (index > -1) {
    // 取消收藏
    userFavorites.value.splice(index, 1)
  } else {
    // 添加收藏
    userFavorites.value.push(programId)
  }
  
  // ========== API调用区域开始 ==========
  /*
  // 实际API调用代码
  fetch(`/api/v1/mini-programs/${programId}/favorite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authStore.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      favorite: !isProgramFavorited(programId)
    })
  })
  */
  // ========== API调用区域结束 ==========
  
  emit('favorite-changed', programId, index === -1)
}

const openMiniProgram = (program) => {
  if (!authStore.isAuthenticated) {
    // 触发登录弹窗
    showToast('请登录！', 'error')
    return
  }
  currentProgram.value = program

  
  // 记录最近使用
  addRecentUse(program.program_id)
  
  // 打开小程序
  emit('open-program', program)
}

const addRecentUse = (programId) => {
  // 移除已存在的记录
  userRecentUse.value = userRecentUse.value.filter(item => item.program_id !== programId)
  
  // 添加新记录到开头
  userRecentUse.value.unshift({
    program_id: programId,
    used_at: new Date().toISOString()
  })
  
  // 只保留最近的20条记录
  if (userRecentUse.value.length > 20) {
    userRecentUse.value = userRecentUse.value.slice(0, 20)
  }
  
  // ========== API调用区域开始 ==========
  /*
  // 实际API调用代码
  fetch(`/api/v1/mini-programs/${programId}/record-use`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authStore.token}`
    }
  })
  */
  // ========== API调用区域结束 ==========
}

// 事件发射
const emit = defineEmits(['needLogin', 'open-program', 'favorite-changed'])
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