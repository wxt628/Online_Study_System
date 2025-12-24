<!-- ForumModule.vue -->
<template>
  <div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background-color: #FF9800;">
        <span class="icon-text">🏫</span>
      </div>
      <h2>校园论坛</h2>
      <router-link to="/forum" class="module-more">
        查看全部 <span class="arrow-icon">→</span>
      </router-link>
    </div>
    
    <div class="module-description">
      <p>校园交流社区，支持发帖、回帖与互动</p>
    </div>

    <!-- 筛选和排序 -->
    <div class="forum-controls">
      <div class="sort-options">
        <button 
          v-for="option in sortOptions" 
          :key="option.value"
          :class="{ active: sortBy === option.value }"
          @click="changeSort(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="filter-categories">
        <button 
          :class="{ active: currentCategory === null }"
          @click="selectCategory(null)"
        >
          全部
        </button>
        <button 
          v-for="category in categories.filter(c => c.value)" 
          :key="category.value"
          :class="{ active: currentCategory === category.value }"
          @click="selectCategory(category.value)"
        >
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-list">
      <div 
        v-for="post in filteredPosts" 
        :key="post.post_id" 
        class="post-item"
        @click="viewPost(post)"
      >
        <div class="post-content">
          <div class="post-header">
            <div class="post-title">{{ post.title }}</div>
            <div :class="['post-category', 'category-' + post.category.toLowerCase()]">
              {{ post.category }}
            </div>
          </div>
          <div class="post-preview">{{ post.content_preview || post.content }}</div>
          <div class="post-info">
            <div class="post-author">
              <div class="author-avatar">
                <span class="avatar-icon">👤</span>
              </div>
              <span class="author-name">{{ post.author?.name || '匿名用户' }}</span>
            </div>
            <div class="post-stats">
              <span 
                class="stat-item" 
                @click.stop="togglePostLike(post)"
                :style="{ color: post.is_liked ? '#ef4444' : '' }"
              >
                <span class="stat-icon">❤️</span>
                {{ post.like_count || 0 }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ post.comment_count || 0 }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">👁️</span>
                {{ post.view_count || 0 }}
              </span>
              <span class="post-time">{{ formatTimeAgo(post.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="skeleton-item" v-for="n in 3" :key="n">
          <div class="skeleton-category"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-content"></div>
          <div class="skeleton-meta">
            <div class="skeleton-meta-item"></div>
            <div class="skeleton-meta-item"></div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && posts.length === 0" class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3 class="empty-state-title">暂无帖子</h3>
        <p class="empty-state-description">快来发布第一条帖子吧~</p>
        <button 
          class="btn-post-first" 
          v-if="authStore.isAuthenticated" 
          @click="goToFullEditor"
        >
          发布第一个帖子
        </button>
        <button 
          class="btn-login" 
          v-else
          @click="emit('needLogin')"
        >
          登录后发帖
        </button>
      </div>

      <!-- 查看更多 -->
      <div v-if="posts.length > 0" class="view-more">
        <router-link to="/forum" class="btn-view-more">
          查看更多帖子 <span class="arrow-icon">→</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/config'

const router = useRouter()
const authStore = useAuthStore()

// 组件属性
const props = defineProps({
  showQuickPost: {
    type: Boolean,
    default: true
  },
  limit: {
    type: Number,
    default: 5
  }
})

// 响应式数据
const posts = ref([])
const loading = ref(false)
const sortBy = ref('created_at')
const currentCategory = ref(null)
const quickPostTitle = ref('')
const quickPostCategory = ref('教务')

// 从 ForumView.vue 复制分类
const categories = ref([
  { value: null, label: '全部', icon: '≡' },
  { value: '教务', label: '教务', icon: '🎓' },
  { value: '生活', label: '生活', icon: '🏠' },
  { value: '工具', label: '工具', icon: '🔧' },
  { value: '健康', label: '健康', icon: '❤️' },
  { value: '娱乐', label: '娱乐', icon: '🎮' }
])

// 排序选项
const sortOptions = ref([
  { label: '最新发布', value: 'created_at' },
  { label: '最多点赞', value: 'like_count' },
  { label: '最多评论', value: 'comment_count' },
  { label: '最多浏览', value: 'view_count' }
])

// 计算属性
const filteredPosts = computed(() => {
  let filtered = [...posts.value]
  
  // 按分类筛选
  if (currentCategory.value) {
    filtered = filtered.filter(post => post.category === currentCategory.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    if (sortBy.value === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy.value === 'like_count') {
      return (b.like_count || 0) - (a.like_count || 0)
    } else if (sortBy.value === 'comment_count') {
      return (b.comment_count || 0) - (a.comment_count || 0)
    } else if (sortBy.value === 'view_count') {
      return (b.view_count || 0) - (a.view_count || 0)
    }
    return 0
  })
  
  // 限制数量
  if (props.limit && filtered.length > props.limit) {
    return filtered.slice(0, props.limit)
  }
  
  return filtered
})

// 生命周期
onMounted(() => {
  loadPosts()
})

// 方法
const loadPosts = async () => {
  loading.value = true
  
  try {
    const resp = await api.get('/posts', {
      params: {
        category: currentCategory.value,
        sort_by: sortBy.value,
        page: 1,
        page_size: props.limit || 10
      }
    })

    const data = resp.data.data
    posts.value = (data.items ?? []).map(post => ({
      ...post,
      timeAgo: formatTimeAgo(post.created_at)
    }))
    
  } catch (error) {
    console.error('Failed to load posts:', error)
    // 使用模拟数据作为备选
    loadMockPosts()
  } finally {
    loading.value = false
  }
}

const loadMockPosts = () => {
  // 模拟数据
  const mockPosts = [
    { 
      post_id: 1, 
      title: "寻找一起学习的小伙伴", 
      content: "有没有同学想一起准备期末考试？我们可以组织学习小组，互相督促，共同进步。",
      content_preview: "有没有同学想一起准备期末考试？我们可以组织学习小组，互相督促，共同进步。",
      author: { 
        user_id: 2, 
        name: "李四"
      }, 
      category: "教务", 
      like_count: 15, 
      view_count: 120, 
      comment_count: 8, 
      created_at: "2024-03-10T14:30:00Z",
      is_liked: false
    },
    { 
      post_id: 2, 
      title: "转让二手教材", 
      content: "计算机组成原理教材，九成新，原价65元，现在30元转让。",
      content_preview: "计算机组成原理教材，九成新，原价65元，现在30元转让。",
      author: { 
        user_id: 3, 
        name: "王五"
      }, 
      category: "生活", 
      like_count: 5, 
      view_count: 80, 
      comment_count: 3, 
      created_at: "2024-03-09T10:15:00Z",
      is_liked: true
    },
    { 
      post_id: 3, 
      title: "校园篮球赛招募队员", 
      content: "本周五下午校园篮球赛，现招募队员3名。要求有一定篮球基础。",
      content_preview: "本周五下午校园篮球赛，现招募队员3名。要求有一定篮球基础。",
      author: { 
        user_id: 4, 
        name: "赵六"
      }, 
      category: "娱乐", 
      like_count: 12, 
      view_count: 95, 
      comment_count: 5, 
      created_at: "2024-03-11T09:30:00Z",
      is_liked: false
    }
  ]
  
  posts.value = mockPosts.map(post => ({
    ...post,
    timeAgo: formatTimeAgo(post.created_at)
  }))
}

const viewPost = (post) => {
  // 导航到论坛页面查看详情
  router.push(`/forum?post=${post.post_id}`)
}

const changeSort = (sortValue) => {
  sortBy.value = sortValue
  loadPosts()
}

const selectCategory = (category) => {
  currentCategory.value = category
  loadPosts()
}

const togglePostLike = async (post) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  const originalLiked = post.is_liked
  const originalCount = post.like_count || 0
  
  // 立即更新UI
  post.is_liked = !post.is_liked
  post.like_count = (post.like_count || 0) + (post.is_liked ? 1 : -1)
  
  try {
    await api.post(`/posts/${post.post_id}/like`)
  } catch (error) {
    console.error('Failed to toggle like:', error)
    // 恢复原始状态
    post.is_liked = originalLiked
    post.like_count = originalCount
  }
}

const createQuickPost = async () => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  if (!quickPostTitle.value.trim()) return
  
  try {
    const formData = new FormData()
    formData.append('title', quickPostTitle.value)
    formData.append('content', quickPostTitle.value) // 使用标题作为简单内容
    if (quickPostCategory.value) {
      formData.append('category', quickPostCategory.value)
    }

    const response = await api.post('/posts', formData)
    
    if (response.data.code === 200) {
      // 清空表单
      clearQuickPost()
      // 重新加载帖子
      loadPosts()
    }
  } catch (error) {
    console.error('Failed to create post:', error)
  }
}

const clearQuickPost = () => {
  quickPostTitle.value = ''
  quickPostCategory.value = '教务'
}

const goToFullEditor = () => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  // 导航到论坛页面使用完整编辑器
  router.push('/forum?new=true')
}

// 辅助函数（从 ForumView.vue 复制）
const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 事件发射
const emit = defineEmits(['needLogin'])
</script>

<style scoped>
/* 基础样式 */
.module-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.module-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.icon-text {
  font-size: 20px;
}

.module-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.module-more {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.module-more:hover {
  color: #1d4ed8;
}

.module-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

/* 快速发帖区域 */
.quick-post {
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.post-input {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 20px;
  color: #1e40af;
}

.input-wrapper {
  flex: 1;
}

.post-input input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}

.post-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.category-option:hover {
  border-color: #9ca3af;
}

.category-option.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
  color: #1d4ed8;
}

.category-option-icon {
  font-size: 14px;
}

.category-option-label {
  white-space: nowrap;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel, .btn-post {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-post {
  background: #2563eb;
  color: white;
}

.btn-post:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-post:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 论坛控制区域 */
.forum-controls {
  margin-bottom: 20px;
}

.sort-options {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.sort-options button {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-options button:hover {
  border-color: #9ca3af;
}

.sort-options button.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.filter-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-categories button {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #f8fafc;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-categories button:hover {
  background: #e5e7eb;
}

.filter-categories button.active {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

/* 帖子列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.post-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.post-title {
  font-weight: 600;
  color: #333;
  font-size: 15px;
  flex: 1;
  margin-right: 12px;
}

.post-category {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
}

.post-preview {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-name {
  font-weight: 500;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.stat-item:hover {
  background-color: #f3f4f6;
}

.stat-icon {
  font-size: 12px;
}

.post-time {
  color: #9ca3af;
}

/* 分类颜色（从 ForumView.vue 复制） */
.category-教务 {
  background-color: #0891b2;
}

.category-生活 {
  background-color: #d97706;
}

.category-工具 {
  background-color: #059669;
}

.category-健康 {
  background-color: #dc2626;
}

.category-娱乐 {
  background-color: #7c3aed;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.skeleton-category {
  width: 60px;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 10px;
  margin-bottom: 8px;
}

.skeleton-title {
  width: 70%;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-content {
  width: 100%;
  height: 40px;
  background-color: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-meta {
  display: flex;
  gap: 16px;
}

.skeleton-meta-item {
  width: 60px;
  height: 16px;
  background-color: #e5e7eb;
  border-radius: 4px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.empty-state-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.btn-post-first, .btn-login {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-post-first {
  background: #2563eb;
  color: white;
}

.btn-post-first:hover {
  background: #1d4ed8;
}

.btn-login {
  background: #f3f4f6;
  color: #374151;
}

.btn-login:hover {
  background: #e5e7eb;
}

/* 查看更多 */
.view-more {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-view-more {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-view-more:hover {
  background-color: #eff6ff;
}

.arrow-icon {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .module-card {
    padding: 16px;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .post-category {
    align-self: flex-start;
  }
  
  .post-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .post-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .quick-post {
    padding: 12px;
  }
  
  .category-selection {
    flex-wrap: wrap;
  }
}
</style>