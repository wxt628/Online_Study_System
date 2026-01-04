<!-- MiniAppsModule.vue -->
<template>
  <el-card class="module-card" shadow="hover">
    <template #header>
      <div class="module-header">
        <div class="header-left">
          <el-icon class="module-icon" :size="24" color="#fff" style="background-color: #4CAF50; padding: 8px; border-radius: 8px;">
            <Menu />
          </el-icon>
          <h2>校园小程序平台</h2>
        </div>
        <router-link to="/miniapps" class="module-more">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
      <p class="module-description">集成多个校园服务小程序，统一入口，便捷访问</p>
    </template>
    
    <!-- 搜索和筛选 -->
    <div class="module-controls" v-if="showControls">
      <el-row :gutter="20">
        <el-col :span="12" :xs="24">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索小程序..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
            class="search-box"
          />
        </el-col>
        <el-col :span="12" :xs="24">
          <el-radio-group v-model="activeCategory" @change="filterByCategory">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button v-for="category in categories" :key="category.value" :label="category.value">
              {{ category.label }}
            </el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
    </div>
    
    <!-- 小程序网格 -->
    <div v-loading="loading">
      <el-row :gutter="20" v-if="filteredPrograms.length > 0">
        <el-col 
          v-for="program in filteredPrograms" 
          :key="program.program_id" 
          :xs="24" :sm="12" :md="12" :lg="8" :xl="8"
          class="program-col"
        >
          <div 
            class="mini-program-card" 
            @click="openMiniProgram(program)"
          >
            <div class="card-bg-decoration"></div>
            <div class="mini-content">
              <div class="mini-header">
                <div class="program-icon-wrapper" :class="getCategoryClass(program.category)">
                  <el-icon :size="28" color="#fff">
                    <component :is="getProgramIcon(program.name)" />
                  </el-icon>
                </div>
              </div>
              
              <div class="mini-body">
                <div class="program-name">{{ program.name }}</div>
                <div class="mini-tags">
                  <span class="program-category" :class="getCategoryClass(program.category)">{{ program.category }}</span>
                </div>
                <div class="program-description">{{ program.description }}</div>
              </div>
              
              <div class="mini-footer">
                <span class="enter-text">进入</span>
                <el-icon class="enter-icon"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 空状态 -->
      <el-empty v-else description="暂无小程序" />
    </div>

    <ModalShow v-model="currentProgram" />

  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { getMiniProgram } from '../../api/interface'
import ModalShow from '../common/ModalShow.vue'
import { 
  Menu, ArrowRight, Search, 
  CreditCard, Reading, Calendar, 
  Lightning, TrendCharts, House 
} from '@element-plus/icons-vue'

const currentProgram = ref(null)

const router = useRouter()
const authStore = useAuthStore()

// 组件属性
const props = defineProps({
  showControls: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: null
  }
})

// 响应式数据
const miniPrograms = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const activeCategory = ref('all')
const error = ref(null)

// 分类选项
const categories = ref([
  { label: '教务', value: '教务' },
  { label: '生活', value: '生活' },
  { label: '工具', value: '工具' },
  { label: '健康', value: '健康' },
  { label: '娱乐', value: '娱乐' }
])

// 计算属性
const filteredPrograms = computed(() => {
  let programs = miniPrograms.value
  
  // 按分类筛选
  if (activeCategory.value !== 'all') {
    programs = programs.filter(p => p.category === activeCategory.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    programs = programs.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.description.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword)
    )
  }
  
  // 限制数量
  if (props.limit && programs.length > props.limit) {
    return programs.slice(0, props.limit)
  }
  
  return programs
})

// 生命周期
onMounted(() => {
  loadMiniPrograms()
})

// 方法
const loadMiniPrograms = async () => {
  loading.value = true
  error.value = null
  
  try {
    const payload = activeCategory.value !== 'all' ? { category: activeCategory.value } : {}
    const response = await getMiniProgram(payload)
    console.log(response)
    if (response.status === 200) {
      miniPrograms.value = response.data
    }
    loading.value = false
  } catch (err) {
    loading.value = false
    console.error('加载小程序失败:', err)
    error.value = '加载失败，请稍后重试'
    miniPrograms.value = []
  }
}

const handleSearch = () => {
  // 防抖搜索逻辑
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // 触发搜索
  }, 300)
}

const filterByCategory = (category) => {
  activeCategory.value = category === 'all' ? 'all' : category
  loadMiniPrograms()
}

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
  if (name.includes('课表')) return Calendar
  if (name.includes('成绩')) return TrendCharts
  if (name.includes('图书')) return Reading
  if (name.includes('一卡通')) return CreditCard
  if (name.includes('失物')) return Search
  if (name.includes('教室')) return House
  
  const icons = {
    '校园一卡通': CreditCard,
    '图书馆查询': Reading,
    '课表查询': Calendar,
    '电费缴纳': Lightning,
    '成绩查询': TrendCharts,
    '失物招领': Search,
    '校园网充值': CreditCard,
    '教室预约': House
  }
  return icons[name] || Menu
}

const setSelectedProgram = (program) => {
  currentProgram.value = program
}

const openMiniProgram = (program) => {
  
  if (!authStore.isAuthenticated) {
    // 触发登录弹窗
    ElMessage.error('请登录！')
    return
  }
  
  setSelectedProgram(program)
}

// 事件发射
const emit = defineEmits(['needLogin'])

// 搜索防抖计时器
let searchTimer = null
</script>

<style scoped>
.module-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.module-header h2 {
  font-size: 1.25rem;
  margin: 0;
  color: #303133;
}

.module-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409EFF;
  text-decoration: none;
  font-size: 0.9rem;
}

.module-description {
  margin: 10px 0 0;
  color: #909399;
  font-size: 0.9rem;
}

.module-controls {
  margin-bottom: 20px;
}

.module-controls :deep(.el-radio-group) {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 5px;
  -webkit-overflow-scrolling: touch;
}

.module-controls :deep(.el-radio-group)::-webkit-scrollbar {
  height: 4px;
}

.module-controls :deep(.el-radio-group)::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.search-box {
  margin-bottom: 10px;
}

.program-col {
  margin-bottom: 24px;
}

/* 卡片全新设计 */
.mini-program-card {
  position: relative;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.mini-program-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.08);
  border-color: rgba(118, 75, 162, 0.1);
}

.card-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: linear-gradient(180deg, rgba(245, 247, 250, 0.8) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 0;
}

.mini-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.mini-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.program-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  margin-bottom: 0;
  line-height: 1;
}

.program-icon-wrapper .el-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.mini-program-card:hover .program-icon-wrapper {
  transform: scale(1.1);
}

/* 颜色分类系统 */
.cat-edu { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 6px 15px rgba(79, 172, 254, 0.25); }
.cat-life { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); box-shadow: 0 6px 15px rgba(67, 233, 123, 0.25); }
.cat-tool { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 6px 15px rgba(118, 75, 162, 0.25); }
.cat-health { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); box-shadow: 0 6px 15px rgba(255, 154, 158, 0.25); }
.cat-ent { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); box-shadow: 0 6px 15px rgba(252, 182, 159, 0.25); }
.cat-other { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); box-shadow: 0 6px 15px rgba(161, 140, 209, 0.25); }

/* 文字颜色的辅助类，用于标签文字 */
.program-category.cat-edu { color: #0093E9; background: rgba(0, 147, 233, 0.1); box-shadow: none; }
.program-category.cat-life { color: #28C76F; background: rgba(40, 199, 111, 0.1); box-shadow: none; }
.program-category.cat-tool { color: #7367F0; background: rgba(115, 103, 240, 0.1); box-shadow: none; }
.program-category.cat-health { color: #FF9F43; background: rgba(255, 159, 67, 0.1); box-shadow: none; }
.program-category.cat-ent { color: #EA5455; background: rgba(234, 84, 85, 0.1); box-shadow: none; }
.program-category.cat-other { color: #A8A8A8; background: rgba(168, 168, 168, 0.1); box-shadow: none; }

.mini-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.program-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: #2c3e50;
  margin-bottom: 6px;
}

.mini-tags {
  margin-bottom: 10px;
}

.program-category {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  display: inline-block;
  transform: none; /* reset original transform */
  margin-bottom: 0;
}

.program-description {
  font-size: 0.85rem;
  color: #8c9bab;
  line-height: 1.5;
  height: 2.8em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 0;
  margin-bottom: 12px;
}

.mini-footer {
  margin-top: auto;
  padding-top: 12px;
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

.mini-program-card:hover .mini-footer {
  color: #764ba2;
}

.mini-program-card:hover .enter-text {
  opacity: 1;
  transform: translateX(0);
}

.mini-program-card:hover .enter-icon {
  transform: translateX(4px);
}

@media (max-width: 768px) {
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
