<!-- RecentMiniPrograms.vue -->
<template>
  <section class="recent-section">
    <div class="section-header">
      <h2><i class="fas fa-history"></i> 最近使用</h2>
      <button class="btn-clear" @click="clearRecent" v-if="recentPrograms.length > 0">
        <i class="fas fa-trash-alt"></i> 清空记录
      </button>
    </div>
    <div class="recent-grid">
      <div 
        v-for="item in recentPrograms" 
        :key="item.program.program_id" 
        class="recent-item"
        @click="openMiniProgram(item.program)"
      >
        <div class="recent-icon" :style="{ backgroundColor: getIconColor(item.program.program_id) }">
          <i :class="item.program.icon_fa || 'fa-th-large'"></i>
        </div>
        <div class="recent-name">{{ item.program.name }}</div>
        <div class="recent-time">{{ formatTimeAgo(item.used_at) }}</div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="recentPrograms.length === 0" class="empty-recent">
        <i class="fas fa-clock"></i>
        <p>暂无最近使用记录</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

// 响应式数据
const miniPrograms = ref([])
const userRecentUse = ref([])

// ========== 模拟数据区域开始 ==========
// 模拟数据（后期替换为API调用）
const mockPrograms = [
  {
    program_id: 1,
    name: "校园一卡通",
    description: "校园卡充值、消费记录查询",
    category: "生活服务",
    icon_fa: "fa-id-card",
    display_order: 1
  },
  {
    program_id: 2,
    name: "图书馆预约",
    description: "图书馆座位、书籍预约系统",
    category: "学习工具",
    icon_fa: "fa-book",
    display_order: 2
  },
  {
    program_id: 3,
    name: "校园课表",
    description: "个人课程表查询与管理",
    category: "学习工具",
    icon_fa: "fa-calendar-alt",
    display_order: 3
  }
]

const mockUserRecentUse = [
  { program_id: 3, used_at: "2024-12-20T14:30:00" },
  { program_id: 1, used_at: "2024-12-20T10:15:00" },
  { program_id: 2, used_at: "2024-12-19T09:30:00" }
]
// ========== 模拟数据区域结束 ==========

// 计算属性
const recentPrograms = computed(() => {
  return userRecentUse.value
    .slice(0, 6) // 只显示最近6个
    .map(item => {
      const program = miniPrograms.value.find(p => p.program_id === item.program_id)
      return program ? { program, used_at: item.used_at } : null
    })
    .filter(item => item !== null)
})

// 生命周期
onMounted(() => {
  loadRecentPrograms()
})

// 方法
const loadRecentPrograms = async () => {
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码
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
    
    // 获取最近使用记录
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
    
    // 使用模拟数据
    miniPrograms.value = mockPrograms
    userRecentUse.value = mockUserRecentUse
    
  } catch (err) {
    console.error('加载最近使用记录失败:', err)
    miniPrograms.value = mockPrograms
    userRecentUse.value = mockUserRecentUse
  }
}

const getIconColor = (programId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
    '#118AB2', '#073B4C', '#EF476F', '#7209B7'
  ]
  return colors[programId % colors.length]
}

const openMiniProgram = (program) => {
  emit('open-program', program)
}

const clearRecent = () => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  if (confirm('确定要清空最近使用记录吗？')) {
    userRecentUse.value = []
    
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码
    fetch('/api/v1/users/me/recent-use', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    */
    // ========== API调用区域结束 ==========
    
    emit('recent-cleared')
  }
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分钟前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    if (days < 7) {
      return `${days}天前`
    } else {
      // 显示具体日期
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }
}

// 事件发射
const emit = defineEmits(['needLogin', 'open-program', 'recent-cleared'])
</script>

<style scoped>
.recent-section {
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
  color: #FF5722;
}

.btn-clear {
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-clear:hover {
  background-color: #ffebee;
  border-color: #ffcdd2;
  color: #f44336;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  background-color: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  min-height: 150px;
}

.recent-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.recent-item:hover {
  transform: translateY(-3px);
}

.recent-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  color: white;
  font-size: 1.2rem;
}

.recent-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  line-height: 1.3;
  margin-bottom: 5px;
}

.recent-time {
  font-size: 0.75rem;
  color: #aaa;
}

.empty-recent {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px;
  color: #aaa;
}

.empty-recent i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #ddd;
}

@media (max-width: 768px) {
  .recent-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 15px;
    padding: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>