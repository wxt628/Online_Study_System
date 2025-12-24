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
    
    <!-- 搜索和筛选 -->
    <div class="module-controls" v-if="showControls">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索小程序..."
          @input="handleSearch"
        />
        <i class="fas fa-search"></i>
      </div>
      <div class="filter-categories">
        <button 
          v-for="category in categories" 
          :key="category.value"
          :class="{ active: activeCategory === category.value }"
          @click="filterByCategory(category.value)"
        >
          {{ category.label }}
        </button>
        <button 
          :class="{ active: activeCategory === 'all' }"
          @click="filterByCategory('all')"
        >
          全部
        </button>
      </div>
    </div>
    
    <!-- 小程序网格 -->
    <div class="mini-programs-grid">
      <div 
        v-for="program in filteredPrograms" 
        :key="program.program_id" 
        class="mini-program-card"
        @click="openMiniProgram(program)"
      >
        <div class="program-icon" :style="{ backgroundColor: getCategoryColor(program.category) }">
          <i :class="getProgramIcon(program.name)"></i>
        </div>
        <div class="program-name">{{ program.name }}</div>
        <div class="program-category">{{ program.category }}</div>
        <div class="program-description">{{ program.description }}</div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="skeleton-card" v-for="n in 6" :key="n"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && filteredPrograms.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>暂无小程序</p>
      </div>  
    </div>

    <ModalShow v-model="currentProgram" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { showToast } from '../../api/Toast'
import { getMiniProgram } from '../../api/interface'
import ModalShow from '../common/ModalShow.vue'
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

// 模拟数据（后期替换为API调用）
const mockData = {
  miniPrograms: [
    { program_id: 1, name: "校园一卡通", icon_url: "/icons/card.png", description: "校园卡充值、消费记录查询", url: "#", category: "生活", display_order: 1, updated_at: "2024-03-10T10:00:00Z" },
    { program_id: 2, name: "图书馆查询", icon_url: "/icons/library.png", description: "图书借阅、馆藏查询", url: "#", category: "教务", display_order: 2, updated_at: "2024-03-09T15:30:00Z" },
    { program_id: 3, name: "课表查询", icon_url: "/icons/schedule.png", description: "个人课程表查看", url: "#", category: "教务", display_order: 3, updated_at: "2024-03-08T09:15:00Z" },
    { program_id: 4, name: "电费缴纳", icon_url: "/icons/electricity.png", description: "宿舍电费查询与缴纳", url: "#", category: "生活", display_order: 4, updated_at: "2024-03-07T14:20:00Z" },
    { program_id: 5, name: "成绩查询", icon_url: "/icons/grades.png", description: "学期成绩查询", url: "#", category: "教务", display_order: 5, updated_at: "2024-03-06T11:45:00Z" },
    { program_id: 6, name: "失物招领", icon_url: "/icons/lost-found.png", description: "校园失物招领平台", url: "#", category: "生活", display_order: 6, updated_at: "2024-03-05T16:10:00Z" },
    { program_id: 7, name: "校园网充值", icon_url: "/icons/network.png", description: "校园网套餐办理与充值", url: "#", category: "生活", display_order: 7, updated_at: "2024-03-04T13:25:00Z" },
    { program_id: 8, name: "教室预约", icon_url: "/icons/classroom.png", description: "自习室、讨论室预约", url: "#", category: "教务", display_order: 8, updated_at: "2024-03-03T08:50:00Z" }
  ]
}
console.log(getMiniProgram())

// 分类选项
const categories = ref([
  { label: '教务', value: '教务' },
  { label: '生活', value: '生活' },
  { label: '工具', value: '工具' }
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
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const response = await fetchMiniProgramsAPI({
      category: activeCategory.value === 'all' ? null : activeCategory.value,
      limit: props.limit
    })
    
    if (response.success) {
      miniPrograms.value = response.data.miniPrograms
    } else {
      error.value = response.error
      // 加载失败时使用模拟数据
      miniPrograms.value = mockData.miniPrograms
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟加载延迟
    setTimeout(() => {
      miniPrograms.value = mockData.miniPrograms
      loading.value = false
    }, 500)
    
  } catch (err) {
    console.error('加载小程序失败:', err)
    error.value = '加载失败，请稍后重试'
    miniPrograms.value = mockData.miniPrograms
    loading.value = false
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
  activeCategory.value = category
  loadMiniPrograms()
}

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

const selectedProgram = ref(null)

const setSelectedProgram = (program) => {
  currentProgram.value = program
}

const openMiniProgram = (program) => {
  
  if (!authStore.isAuthenticated) {
    // 触发登录弹窗
    showToast('请登录！', 'error')
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

/* 搜索和筛选区域 */
.module-controls {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 15px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.filter-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-categories button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-categories button:hover {
  border-color: #3498db;
  color: #3498db;
}

.filter-categories button.active {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
}

/* 小程序网格 */
.mini-programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-bottom: 8px;
}

.program-description {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
  margin-top: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 加载状态 */
.loading-state {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.skeleton-card {
  background-color: #e0e0e0;
  border-radius: 10px;
  height: 180px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
}

.empty-state i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 15px;
}

.empty-state p {
  color: #888;
  font-size: 0.9rem;
}

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