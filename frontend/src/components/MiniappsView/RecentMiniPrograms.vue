<!-- RecentMiniPrograms.vue -->
<template>
  <el-card class="recent-section" shadow="hover">
    <template #header>
      <div class="section-header">
        <div class="header-title">
          <el-icon class="mr-2"><Clock /></el-icon>
          <span>最近使用</span>
        </div>
        <el-button 
          v-if="recentPrograms.length > 0" 
          type="danger" 
          link 
          @click="clearRecent"
        >
          <el-icon class="mr-1"><Delete /></el-icon>
          清空记录
        </el-button>
      </div>
    </template>
    
    <div class="recent-content">
      <el-row :gutter="20" v-if="recentPrograms.length > 0">
        <el-col 
          v-for="item in recentPrograms" 
          :key="item.program.program_id" 
          :xs="12" :sm="8" :md="6" :lg="4"
          class="mb-20"
        >
          <div class="mini-card-small" @click="openMiniProgram(item.program)">
            <div class="card-bg-decoration"></div>
            <div class="mini-content-small">
              <div class="mini-icon-small" :class="getCategoryClass(item.program.category)">
                <el-icon :size="24" color="#fff">
                  <component :is="getProgramIcon(item.program.name)" />
                </el-icon>
              </div>
              <div class="mini-name-small" :title="item.program.name">{{ item.program.name }}</div>
              <div class="recent-time">{{ formatTimeAgo(item.used_at) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 空状态 -->
      <el-empty 
        v-else 
        description="暂无最近使用记录" 
        :image-size="100"
      >
        <template #image>
          <el-icon :size="60" color="#909399"><Clock /></el-icon>
        </template>
      </el-empty>

      <ModalShow v-model="currentProgram" />
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useMiniAppsStore } from '../../stores/miniApps'
import ModalShow from '../common/ModalShow.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Clock, 
  Delete,
  Calendar,
  Document,
  Location,
  Search,
  ChatDotRound,
  Goods,
  Food,
  Ticket,
  Bicycle,
  Basketball,
  Reading,
  Money,
  Timer
} from '@element-plus/icons-vue'

const authStore = useAuthStore()
const miniAppsStore = useMiniAppsStore()
const currentProgram = ref(null)

const emit = defineEmits(['needLogin', 'open-program', 'recent-cleared'])

// 计算属性
const recentPrograms = computed(() => {
  return miniAppsStore.userRecentUse
    .slice(0, 6) // 只显示最近6个
    .map(item => {
      const program = miniAppsStore.miniPrograms.find(p => p.program_id === item.program_id)
      return program ? { program, used_at: item.used_at } : null
    })
    .filter(item => item !== null)
})

// 图标映射函数
const getProgramIcon = (name) => {
  if (name.includes('课表')) return Calendar
  if (name.includes('成绩')) return Document
  if (name.includes('图书')) return Reading
  if (name.includes('一卡通')) return Money
  if (name.includes('失物')) return Search
  if (name.includes('教室')) return Location
  
  const iconMap = {
    '课程表': Calendar,
    '成绩查询': Document,
    '校园地图': Location,
    '失物招领': Search,
    '校园论坛': ChatDotRound,
    '二手市场': Goods,
    '食堂点餐': Food,
    '校车查询': Ticket,
    '共享单车': Bicycle,
    '场馆预约': Basketball,
    '图书馆': Reading,
    '一卡通充值': Money,
    '考勤打卡': Timer
  }
  return iconMap[name] || Document
}

// 方法
const getCategoryClass = (category) => {
  const map = {
    '教务': 'cat-edu',
    '生活': 'cat-life',
    '工具': 'cat-tool',
    '健康': 'cat-health',
    '娱乐': 'cat-ent'
  }
  return map[category] || 'cat-other'
}

const openMiniProgram = (program) => {
  // 记录最近使用
  console.log(program)
  currentProgram.value = program
  miniAppsStore.addRecentUse(program.program_id)
  emit('open-program', program)
}

const clearRecent = () => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  ElMessageBox.confirm(
    '确定要清空最近使用记录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      miniAppsStore.clearRecent()
      emit('recent-cleared')
      ElMessage.success('已清空最近使用记录')
    })
    .catch(() => {
      // 取消操作
    })
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
</script>

<style scoped>
.recent-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
}

.mr-2 {
  margin-right: 8px;
}

.mr-1 {
  margin-right: 4px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mini-card-small {
  position: relative;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.mini-card-small:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  border-color: rgba(118, 75, 162, 0.1);
}

.card-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(180deg, rgba(245, 247, 250, 0.8) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 0;
}

.mini-content-small {
  position: relative;
  z-index: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mini-icon-small {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.mini-card-small:hover .mini-icon-small {
  transform: scale(1.1) rotate(-5deg);
}

.mini-name-small {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-bottom: 4px;
}

.recent-time {
  font-size: 0.75rem;
  color: #909399;
}

/* 颜色分类系统 */
.cat-edu { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 6px 15px rgba(79, 172, 254, 0.25); }
.cat-life { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); box-shadow: 0 6px 15px rgba(67, 233, 123, 0.25); }
.cat-tool { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 6px 15px rgba(118, 75, 162, 0.25); }
.cat-health { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); box-shadow: 0 6px 15px rgba(255, 154, 158, 0.25); }
.cat-ent { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); box-shadow: 0 6px 15px rgba(252, 182, 159, 0.25); }
.cat-other { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); box-shadow: 0 6px 15px rgba(161, 140, 209, 0.25); }
</style>