<template>
  <main class="container">
    <section>
      <MiniSearch 
        :searchKeyword="miniAppsStore.searchKeyword"
        :activeCategory="miniAppsStore.activeCategory"
        :activeSort="miniAppsStore.activeSort"
        @search="handleSearch"
        @filter-category="handleFilterCategory"
        @sort-change="handleSortChange"
      />
    </section>
    
    <section>
      <FavoriteMiniPrograms 
        :favoritePrograms="favoriteProgramsComputed"
        @need-login="handleNeedLogin"
        @open-program="handleOpenProgram"
        @save-favorites="handleSaveFavorites"
      />
    </section>

    <section>
      <AllMiniPrograms 
        :searchKeyword="miniAppsStore.searchKeyword"
        :activeCategory="miniAppsStore.activeCategory"
        :activeSort="miniAppsStore.activeSort"
        :loading="miniAppsStore.loading"  
        @need-login="handleNeedLogin"
        @open-program="handleOpenProgram"
        @favorite-changed="handleFavoriteChanged"
      />
    </section>

    <section>
      <RecentMiniPrograms 
        :recentPrograms="recentProgramsComputed"
        @need-login="handleNeedLogin"
        @open-program="handleOpenProgram"
        @recent-cleared="handleRecentCleared"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMiniAppsStore } from '../stores/miniApps'
import MiniSearch from '../components/MiniappsView/MiniSearch.vue'
import AllMiniPrograms from '../components/MiniappsView/AllMiniPrograms.vue'
import FavoriteMiniPrograms from '../components/MiniappsView/FavoriteMiniPrograms.vue'
import RecentMiniPrograms from '../components/MiniappsView/RecentMiniPrograms.vue'

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
  // 触发登录逻辑
  console.log('需要登录')
}

const handleOpenProgram = (program) => {
  // 记录最近使用
  miniAppsStore.addRecentUse(program.program_id)
  console.log('打开小程序:', program.name)
}

const handleFavoriteChanged = (programId, isFavorite) => {
  // 这个事件可以用于更新其他组件的状态
  console.log(`小程序 ${programId} ${isFavorite ? '已收藏' : '取消收藏'}`)
}

const handleSaveFavorites = (favorites) => {
  // 这里可以保存到服务器
  console.log('保存收藏:', favorites)
}

const handleRecentCleared = () => {
  miniAppsStore.clearRecent()
}
</script>