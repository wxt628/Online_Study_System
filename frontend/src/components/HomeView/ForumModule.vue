<!-- ForumModule.vue -->
<template>
  <div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background-color: #FF9800;">
        <i class="fas fa-comments"></i>
      </div>
      <h2>校园论坛平台</h2>
      <router-link to="/forum" class="module-more">
        查看全部 <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>
    <div class="module-description">
      <p>校园交流社区，支持发帖、回帖与互动</p>
    </div>
    <div class="posts-list">
      <div 
        v-for="post in posts" 
        :key="post.post_id" 
        class="post-item"
        @click="viewPost(post)"
      >
        <div class="post-header">
          <div class="post-title">{{ post.title }}</div>
          <div class="post-category">{{ post.category }}</div>
        </div>
        <div class="post-preview">{{ post.content_preview }}</div>
        <div class="post-info">
          <div class="post-author">
            <img :src="post.author.avatar_url" :alt="post.author.name" class="author-avatar">
            <span class="author-name">{{ post.author.name }}</span>
          </div>
          <div class="post-stats">
            <span><i class="far fa-heart"></i> {{ post.like_count }}</span>
            <span><i class="far fa-comment"></i> {{ post.comment_count }}</span>
            <span class="post-time"><i class="far fa-clock"></i> {{ formatTimeAgo(post.created_at) }}</span>
          </div>
        </div>
      </div>
      <div v-if="loading" class="skeleton-item"></div>
      <div v-if="loading" class="skeleton-item"></div>
      <div v-if="loading" class="skeleton-item"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['viewPost', 'needLogin'])

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const viewPost = (post) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  emit('viewPost', post)
  // router.push(`/forum/post/${post.post_id}`)
}
</script>

<style scoped>
.module-card {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.module-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 1.5rem;
}

.module-header h2 {
  font-size: 1.5rem;
  flex-grow: 1;
  color: #2c3e50;
}

.module-more {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

.module-more i {
  margin-left: 5px;
  transition: transform 0.3s;
}

.module-more:hover i {
  transform: translateX(5px);
}

.module-description {
  margin-bottom: 20px;
  color: #666;
}

/* 帖子列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid #FF9800;
  cursor: pointer;
  transition: background-color 0.3s;
}

.post-item:hover {
  background-color: #f0f2f5;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.post-title {
  font-weight: 600;
  color: #2c3e50;
  flex-grow: 1;
}

.post-category {
  font-size: 0.8rem;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  background-color: #fff3e0;
  color: #ef6c00;
}

.post-preview {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.85rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 500;
}

.post-stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-time {
  display: flex;
  align-items: center;
  gap: 5px;
}

.skeleton-item {
  background-color: #e0e0e0;
  border-radius: 10px;
  height: 80px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 576px) {
  .module-card {
    padding: 20px;
  }
  
  .post-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .post-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>