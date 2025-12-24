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
      // 如果API调用失败，使用默认数据
      const defaultPrograms = [
        { program_id: 1, name: "校园一卡通", description: "校园卡充值、消费记录查询", url: "#", category: "生活", display_order: 1, updated_at: "2024-03-10T10:00:00Z" },
        { program_id: 2, name: "图书馆查询", description: "图书借阅、馆藏查询", url: "#", category: "教务", display_order: 2, updated_at: "2024-03-09T15:30:00Z" },
        { program_id: 3, name: "课表查询", description: "个人课程表查看", url: "#", category: "教务", display_order: 3, updated_at: "2024-03-08T09:15:00Z" },
        { program_id: 4, name: "电费缴纳", description: "宿舍电费查询与缴纳", url: "#", category: "生活", display_order: 4, updated_at: "2024-03-07T14:20:00Z" },
        { program_id: 5, name: "成绩查询", description: "学期成绩查询", url: "#", category: "教务", display_order: 5, updated_at: "2024-03-06T11:45:00Z" },
        { program_id: 6, name: "失物招领", description: "校园失物招领平台", url: "#", category: "生活", display_order: 6, updated_at: "2024-03-05T16:10:00Z" },
        { program_id: 7, name: "校园网充值", description: "校园网套餐办理与充值", url: "#", category: "生活", display_order: 7, updated_at: "2024-03-04T13:25:00Z" },
        { program_id: 8, name: "教室预约", description: "自习室、讨论室预约", url: "#", category: "教务", display_order: 8, updated_at: "2024-03-03T08:50:00Z" },
        { program_id: 9, name: "校园公告", description: "学校新闻、通知公告", url: "#", category: "工具", display_order: 9, updated_at: "2024-03-02T11:30:00Z" },
        { program_id: 10, name: "校园导航", description: "校园地图与导航", url: "#", category: "工具", display_order: 10, updated_at: "2024-03-01T14:15:00Z" },
        { program_id: 11, name: "活动报名", description: "校园活动在线报名", url: "#", category: "生活", display_order: 11, updated_at: "2024-02-28T09:45:00Z" },
        { program_id: 12, name: "校车时刻", description: "校车时刻表查询", url: "#", category: "工具", display_order: 12, updated_at: "2024-02-27T16:20:00Z" }
      ]
      
      miniPrograms.value = defaultPrograms.map(program => ({
        ...program,
        icon_fa: getProgramIcon(program.name)
      }))
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