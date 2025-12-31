<template>
  <main class="container">
    <section class="page-header">
      <h1 class="page-title"><i class="fas fa-tasks"></i> 作业平台</h1>
      <p class="page-subtitle">查看课程作业、提交作业、下载附件</p>
    </section>
    <section>
      <HomeworkModule :showControls="true" :showAll="true" />
    </section>
  </main>
</template>

<script setup>
import HomeworkModule from '../components/HomeView/HomeworkModule.vue'
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 20px auto;
  padding: 0 16px;
}
.page-title {
  font-size: 24px;
  margin: 0 0 6px 0;
}
.page-subtitle {
  color: #666;
  margin-bottom: 16px;
}
</style>
