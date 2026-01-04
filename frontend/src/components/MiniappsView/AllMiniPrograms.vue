<template>
  <section class="mini-list-section">
    <div class="section-header">
      <h2><el-icon class="header-icon"><Menu /></el-icon> 全部小程序</h2>
      <div class="mini-count">
        共 <span class="count-number">{{ filteredPrograms.length }}</span> 个小程序
      </div>
    </div>
    
    <el-row :gutter="24" v-loading="loading">
      <el-col 
        v-for="program in filteredPrograms" 
        :key="program.program_id" 
        :xs="24" :sm="12" :md="8" :lg="6"
        class="mb-24"
      >
        <div 
          class="mini-card" 
          @click="openMiniProgram(program)"
        >
          <div class="card-bg-decoration"></div>
          <div class="mini-content">
            <div class="mini-header">
              <div class="mini-icon" :class="getCategoryClass(program.category)">
                <el-icon :size="28" color="#fff">
                  <component :is="getProgramIcon(program.name)" />
                </el-icon>
              </div>
              <el-button 
                class="mini-favorite-btn"
                :class="{ 'is-active': isProgramFavorited(program.program_id) }"
                circle
                size="small"
                @click.stop="toggleFavorite(program.program_id)"
              >
                <el-icon><StarFilled v-if="isProgramFavorited(program.program_id)" /><Star v-else /></el-icon>
              </el-button>
            </div>
            
            <div class="mini-body">
              <div class="mini-name">{{ program.name }}</div>
              <div class="mini-tags">
                <span class="category-tag" :class="getCategoryClass(program.category)">{{ program.category }}</span>
              </div>
              <div class="mini-description" :title="program.description">{{ program.description }}</div>
            </div>
            
            <div class="mini-footer">
              <span class="enter-text">点击进入</span>
              <el-icon class="enter-icon"><Right /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
      
    <!-- 空状态 -->
    <el-empty 
      v-if="!loading && filteredPrograms.length === 0" 
      description="未找到相关小程序"
      :image-size="160"
    >
      <template #extra>
        <p class="empty-tip">请尝试其他搜索关键词或分类</p>
      </template>
    </el-empty>

    <ModalShow v-model="currentProgram" />
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Menu, Star, StarFilled, Right,
  Calendar, TrendCharts, Reading, CreditCard, 
  Flag, Search, Van, Tools, FirstAidKit, 
  Message, MapLocation, Timer, Grid 
} from '@element-plus/icons-vue'
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
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['need-login', 'open-program', 'favorite-changed'])

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
      p.description.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  return [...programs].sort((a, b) => {
    if (props.activeSort === 'name') {
      return a.name.localeCompare(b.name, 'zh-CN')
    } else if (props.activeSort === 'popular') {
      return b.program_id - a.program_id
    } else if (props.activeSort === 'recent') {
      return 0
    }
    return a.display_order - b.display_order
  })
})

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

const getProgramIcon = (name) => {
  if (name.includes('课表')) return 'Calendar'
  if (name.includes('成绩')) return 'TrendCharts'
  if (name.includes('图书')) return 'Reading'
  if (name.includes('一卡通')) return 'CreditCard'
  if (name.includes('活动')) return 'Flag'
  if (name.includes('失物')) return 'Search'
  if (name.includes('校车')) return 'Van'
  if (name.includes('报修')) return 'Tools'
  if (name.includes('健康')) return 'FirstAidKit'
  if (name.includes('邮箱')) return 'Message'
  if (name.includes('地图')) return 'MapLocation'
  if (name.includes('考勤')) return 'Timer'
  return 'Grid'
}

const isProgramFavorited = (programId) => {
  return miniAppsStore.userFavorites.includes(programId)
}

const openMiniProgram = (program) => {
  currentProgram.value = program
}

const toggleFavorite = (programId) => {
  if (!authStore.isAuthenticated) {
    emit('need-login')
    return
  }
  
  miniAppsStore.toggleFavorite(programId)
  
  // 触发事件通知父组件
  emit('favorite-changed', programId, isProgramFavorited(programId))
}
</script>

<style scoped>
.mini-list-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e0e0e0;
}

.section-header h2 {
  font-size: 1.6rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px;
  border-radius: 12px;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(118, 75, 162, 0.3);
}

.mini-count {
  color: #606266;
  font-size: 0.95rem;
  background: #f5f7fa;
  padding: 6px 16px;
  border-radius: 20px;
}

.count-number {
  color: #764ba2;
  font-weight: 800;
  font-size: 1.1rem;
  margin: 0 4px;
}

.mb-24 {
  margin-bottom: 24px;
}

/* 卡片全新设计 */
.mini-card {
  position: relative;
  height: 100%;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.mini-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
  border-color: rgba(118, 75, 162, 0.1);
}

.card-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: linear-gradient(180deg, rgba(245, 247, 250, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 0;
}

.mini-content {
  position: relative;
  z-index: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.mini-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.mini-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.mini-card:hover .mini-icon {
  transform: scale(1.1) rotate(-5deg);
}

/* 颜色分类系统 */
.cat-edu { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); }
.cat-life { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); box-shadow: 0 8px 20px rgba(67, 233, 123, 0.3); }
.cat-tool { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 8px 20px rgba(118, 75, 162, 0.3); }
.cat-health { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); box-shadow: 0 8px 20px rgba(255, 154, 158, 0.3); }
.cat-ent { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); box-shadow: 0 8px 20px rgba(252, 182, 159, 0.3); }
.cat-other { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); box-shadow: 0 8px 20px rgba(161, 140, 209, 0.3); }

/* 文字颜色的辅助类，用于标签文字 */
.category-tag.cat-edu { color: #0093E9; background: rgba(0, 147, 233, 0.1); box-shadow: none; }
.category-tag.cat-life { color: #28C76F; background: rgba(40, 199, 111, 0.1); box-shadow: none; }
.category-tag.cat-tool { color: #7367F0; background: rgba(115, 103, 240, 0.1); box-shadow: none; }
.category-tag.cat-health { color: #FF9F43; background: rgba(255, 159, 67, 0.1); box-shadow: none; }
.category-tag.cat-ent { color: #EA5455; background: rgba(234, 84, 85, 0.1); box-shadow: none; }
.category-tag.cat-other { color: #A8A8A8; background: rgba(168, 168, 168, 0.1); box-shadow: none; }

.mini-favorite-btn {
  border: none;
  background: transparent;
  color: #dcdfe6;
  transition: all 0.3s;
  font-size: 1.2rem;
}

.mini-favorite-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
  color: #e6a23c;
}

.mini-favorite-btn.is-active {
  color: #e6a23c;
}

.mini-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mini-name {
  font-weight: 700;
  font-size: 1.15rem;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.4;
}

.mini-tags {
  margin-bottom: 12px;
}

.category-tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-block;
}

.mini-description {
  font-size: 0.9rem;
  color: #8c9bab;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
  margin-bottom: 16px;
}

.mini-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #a0a0a0;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.enter-text {
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s;
  margin-right: 4px;
  font-weight: 500;
}

.enter-icon {
  transition: all 0.3s;
}

.mini-card:hover .mini-footer {
  color: #764ba2;
}

.mini-card:hover .enter-text {
  opacity: 1;
  transform: translateX(0);
}

.mini-card:hover .enter-icon {
  transform: translateX(4px);
}

.empty-tip {
  color: #909399;
  font-size: 1rem;
}
</style>
