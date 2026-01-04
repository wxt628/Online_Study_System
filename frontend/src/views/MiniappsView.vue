<template>
  <div class="miniapps-container">
    <div class="section-wrapper">
      <MiniSearch 
        :searchKeyword="miniAppsStore.searchKeyword"
        :activeCategory="miniAppsStore.activeCategory"
        :activeSort="miniAppsStore.activeSort"
        @search="handleSearch"
        @filter-category="handleFilterCategory"
        @sort-change="handleSortChange"
      />
    </div>
    
    <div class="section-wrapper">
      <FavoriteMiniPrograms 
        :favoritePrograms="favoriteProgramsComputed"
        @need-login="handleNeedLogin"
        @open-program="handleOpenProgram"
        @save-favorites="handleSaveFavorites"
      />
    </div>

    <div class="section-wrapper">
      <RecentMiniPrograms 
        :recentPrograms="recentProgramsComputed"
        @need-login="handleNeedLogin"
        @open-program="handleOpenProgram"
        @recent-cleared="handleRecentCleared"
      />
    </div>

    <div class="section-wrapper">
      <AllMiniPrograms 
        :searchKeyword="miniAppsStore.searchKeyword"
        :activeCategory="miniAppsStore.activeCategory"
        :activeSort="miniAppsStore.activeSort"
        :loading="miniAppsStore.loading"  
        @need-login="handleNeedLogin"
        @open-program="handleOpenProgram"
        @favorite-changed="handleFavoriteChanged"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMiniAppsStore } from '../stores/miniApps'
import MiniSearch from '../components/MiniappsView/MiniSearch.vue'
import AllMiniPrograms from '../components/MiniappsView/AllMiniPrograms.vue'
import FavoriteMiniPrograms from '../components/MiniappsView/FavoriteMiniPrograms.vue'
import RecentMiniPrograms from '../components/MiniappsView/RecentMiniPrograms.vue'
import { ElMessage } from 'element-plus'

const miniAppsStore = useMiniAppsStore()

// 生命周期 - 在组件挂载时加载小程序数据
onMounted(() => {
  // 如果还没有加载过小程序数据，则加载
  if (miniAppsStore.miniPrograms.length === 0) {
    miniAppsStore.loadMiniPrograms()
  }
})

// 计算属性
const favoriteProgramsComputed = computed(() => {
  return miniAppsStore.favoritePrograms
})

const recentProgramsComputed = computed(() => {
  return miniAppsStore.recentPrograms
})

// 事件处理函数
const handleSearch = (keyword) => {
  miniAppsStore.searchKeyword = keyword
}

const handleFilterCategory = (category) => {
  miniAppsStore.activeCategory = category
}

const handleSortChange = (sort) => {
  miniAppsStore.activeSort = sort
}

const handleNeedLogin = () => {
  ElMessage.warning('请先登录')
}

const handleOpenProgram = (program) => {
  // 记录最近使用
  miniAppsStore.addRecentUse(program.program_id)
  console.log('打开小程序:', program.name)
}

const handleFavoriteChanged = (programId, isFavorite) => {
  // 这个事件可以用于更新其他组件的状态
  const action = isFavorite ? '已收藏' : '取消收藏'
  ElMessage.success(`小程序${action}`)
}

const handleSaveFavorites = (favorites) => {
  // 更新 store 中的收藏列表（保持顺序）
  miniAppsStore.userFavorites = favorites
  ElMessage.success('收藏列表已更新')
}

const handleRecentCleared = () => {
  miniAppsStore.clearRecent()
}
</script>

<style scoped>
.miniapps-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-wrapper {
  margin-bottom: 24px;
}
</style>