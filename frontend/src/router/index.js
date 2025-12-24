import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'
import { showToast } from '../api/Toast'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/miniapps',
    name: 'miniapps',
    component: () => import('../views/MiniappsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/homework',
    name: 'homework',
    component: () => import('../views/HomeworkView.vue'),
    meta: { requiresAuth: true }
  },
//   {
//     path: '/forum',
//     name: 'forum',
//     component: () => import('../views/ForumView.vue'),
//     meta: { requiresAuth: true }
//   }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫 - 认证检查
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    showToast('请登录！', 'error')
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router