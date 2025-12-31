import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getMiniProgram } from '../api/interface' // 导入API

export const useMiniAppsStore = defineStore('miniApps', () => {
  // 共享状态
  const searchKeyword = ref('')
  const activeCategory = ref('all')
  const activeSort = ref('display_order')
  
  // 小程序列表
  const miniPrograms = ref([])
  
  // 从localStorage初始化收藏和最近使用
  const userFavorites = ref(JSON.parse(localStorage.getItem('miniApps_favorites')) || [])
  const userRecentUse = ref(JSON.parse(localStorage.getItem('miniApps_recentUse')) || [])
  
  // 加载状态
  const loading = ref(false)
  
  // 监听收藏变化，自动保存到localStorage
  watch(
    userFavorites,
    (newFavorites) => {
      localStorage.setItem('miniApps_favorites', JSON.stringify(newFavorites))
    },
    { deep: true }
  )
  
  // 监听最近使用变化，自动保存到localStorage
  watch(
    userRecentUse,
    (newRecentUse) => {
      localStorage.setItem('miniApps_recentUse', JSON.stringify(newRecentUse))
    },
    { deep: true }
  )
  
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
    
    // 排序
    programs.sort((a, b) => {
      switch (activeSort.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
          const aRecent = userRecentUse.value.find(item => item.program_id === a.program_id)
          const bRecent = userRecentUse.value.find(item => item.program_id === b.program_id)
          
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
  
  const favoritePrograms = computed(() => {
    return userFavorites.value
      .map(id => miniPrograms.value.find(p => p.program_id === id))
      .filter(p => p !== undefined)
  })
  
  const recentPrograms = computed(() => {
    return userRecentUse.value
      .slice(0, 6)
      .map(item => {
        const program = miniPrograms.value.find(p => p.program_id === item.program_id)
        return program ? { program, used_at: item.used_at } : null
      })
      .filter(item => item !== null)
  })
  
  // 方法
  const loadMiniPrograms = async () => {
    loading.value = true
    try {
      // 调用API获取小程序列表
      const response = await getMiniProgram()
      
      if (response.status === 200) {
        // 确保每个小程序都有icon_fa字段
        miniPrograms.value = response.data.map(program => ({
          ...program,
          icon_fa: getProgramIcon(program.name)
        }))
      } else {
        throw new Error('API响应错误')
      }
    } catch (error) {
      console.error('加载小程序失败:', error)
      miniPrograms.value = []
    } finally {
      loading.value = false
    }
  }
  
  const toggleFavorite = (programId) => {
    const index = userFavorites.value.indexOf(programId)
    if (index > -1) {
      userFavorites.value.splice(index, 1)
    } else {
      userFavorites.value.push(programId)
    }
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
  }
  
  const clearRecent = () => {
    userRecentUse.value = []
  }
  
  // 获取程序图标
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
  
  return {
    // 状态
    searchKeyword,
    activeCategory,
    activeSort,
    miniPrograms,
    userFavorites,
    userRecentUse,
    loading,
    
    // 计算属性
    filteredPrograms,
    favoritePrograms,
    recentPrograms,
    
    // 方法
    loadMiniPrograms,
    toggleFavorite,
    addRecentUse,
    clearRecent,
    getProgramIcon
  }
})
