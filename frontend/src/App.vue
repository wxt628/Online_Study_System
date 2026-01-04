<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// 监听认证状态，如果失效且在需要认证的页面，则跳转登录
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (!isAuth && route.meta.requiresAuth) {
    ElMessage.error('登录已过期，请重新登录')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
  }
})
</script>