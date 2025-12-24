<!-- WelcomeBanner.vue -->
<template>
  <section class="welcome-banner">
    <div class="welcome-content">
      <h1>{{ welcomeText }}</h1>
      <p>{{ welcomeDescription }}</p>
    </div>
    <div class="welcome-stats">
      <div class="stat-item">
        <i class="fas fa-th-large"></i>
        <div>
          <span class="stat-number">{{ stats.miniPrograms }}</span>
          <span class="stat-label">个小程序</span>
        </div>
      </div>
      <div class="stat-item">
        <i class="fas fa-tasks"></i>
        <div>
          <span class="stat-number">{{ stats.assignments }}</span>
          <span class="stat-label">个待办作业</span>
        </div>
      </div>
      <div class="stat-item">
        <i class="fas fa-comments"></i>
        <div>
          <span class="stat-number">{{ stats.posts }}</span>
          <span class="stat-label">条新帖子</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      miniPrograms: 8,
      assignments: 0,
      posts: 3
    })
  },
  welcomeDescription: {
    type: String,
    default: '一站式校园服务，集成学习、生活、交流多种功能'
  }
})

const welcomeText = computed(() => {
  if (user.value) {
    return `欢迎回来，${user.value.name}同学`
  }
  return '欢迎使用校园综合平台'
})
</script>

<style scoped>
.welcome-banner {
  color: rgb(0, 0, 0);
  border-radius: 15px;
  padding: 30px;
  margin: 30px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.welcome-content h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.welcome-content p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.welcome-stats {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-item i {
  font-size: 2.5rem;
  opacity: 0.9;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .welcome-stats {
    width: 100%;
    justify-content: space-between;
    margin-top: 25px;
  }
}

@media (max-width: 768px) {
  .welcome-content h1 {
    font-size: 1.8rem;
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .stat-item i {
    font-size: 2rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .welcome-banner {
    padding: 20px;
  }
}
</style>