<template>
  <main class="container">
    <!-- 欢迎横幅 -->
    <WelcomeBanner />
    
    <!-- 功能模块区 -->
    <section class="modules-section">
      <!-- 小程序平台模块 -->
      <MiniProgramsModule />
      
      <!-- 作业平台模块 -->
      <AssignmentsModule :showAll="true" />
      
      <!-- 论坛平台模块 -->
      <PostsModule />
    </section>
    
  </main>
</template>

<script setup>
import WelcomeBanner from '../components/HomeView/WelcomeBanner.vue'
import MiniProgramsModule  from '../components/HomeView/MiniAppsModule.vue'
import AssignmentsModule from '../components/HomeView/HomeworkModule.vue'
import PostsModule from '../components/HomeView/ForumModule.vue'
</script>
