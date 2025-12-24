<template>
  <main class="container">
    <section>
      <MiniSearch />
    </section>
    <section>
      <AllMiniPrograms />
    </section>
      <FavoriteMiniPrograms />

    
  </main>
</template>

<script setup>
  import MiniSearch from '../components/MiniappsView/MiniSearch.vue'
  import AllMiniPrograms from '../components/MiniappsView/AllMiniPrograms.vue'
  import FavoriteMiniPrograms from '../components/MiniappsView/FavoriteMiniPrograms.vue'
</script>