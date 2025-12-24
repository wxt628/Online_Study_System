<template>
  <main class="container">
    <section>
      <MiniSearch />
    </section>
    <section>
      <AllMiniPrograms />
    </section>
    <section>
      <FavoriteMiniPrograms />
    </section>
      <RecentMiniPrograms />

    
  </main>
</template>

<script setup>
  import MiniSearch from '../components/MiniappsView/MiniSearch.vue'
  import AllMiniPrograms from '../components/MiniappsView/AllMiniPrograms.vue'
  import FavoriteMiniPrograms from '../components/MiniappsView/FavoriteMiniPrograms.vue'
  import RecentMiniPrograms from '../components/MiniappsView/RecentMiniPrograms.vue'
</script>