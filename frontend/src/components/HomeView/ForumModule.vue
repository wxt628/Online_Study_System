<template>
  <el-card class="module-card" shadow="hover">
    <template #header>
      <div class="module-header">
        <div class="header-left">
          <el-icon class="module-icon" :size="24" color="#fff" style="background-color: #FF9800; padding: 8px; border-radius: 8px;">
            <School />
          </el-icon>
          <h2>校园论坛</h2>
        </div>
        <router-link to="/forum" class="module-more">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
      <p class="module-description">校园交流社区，支持发帖、回帖与互动</p>
    </template>

    <!-- 筛选和排序 -->
    <div class="forum-controls">
      <el-row :gutter="20">
        <el-col :span="14" :xs="24">
          <el-radio-group v-model="currentCategory" size="small" @change="loadPosts" class="compact-radio-group">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button 
              v-for="category in categories.filter(c => c.value)" 
              :key="category.value" 
              :label="category.value"
            >
              {{ category.label }}
            </el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :span="10" :xs="24" class="sort-col">
          <el-radio-group v-model="sortBy" size="small" @change="loadPosts">
            <el-radio-button v-for="option in sortOptions" :key="option.value" :label="option.value">
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-list" v-loading="loading">
      <div v-if="filteredPosts.length > 0">
        <el-card 
          v-for="post in filteredPosts" 
          :key="post.post_id" 
          class="post-item"
          shadow="hover"
          @click="viewPost(post)"
        >
          <div class="post-content">
            <div class="post-header">
              <h4 class="post-title">{{ post.title }}</h4>
              <el-tag size="small" :type="getCategoryType(post.category)">{{ post.category }}</el-tag>
            </div>
            <div class="post-preview">{{ post.content_preview || post.content }}</div>
            <div class="post-info">
              <div class="post-author">
                <el-avatar :size="24" :icon="UserFilled" class="author-avatar" />
                <span class="author-name">{{ post.author?.name || '匿名用户' }}</span>
              </div>
              <div class="post-stats">
                <span 
                  class="stat-item" 
                  @click.stop="togglePostLike(post)"
                  :style="{ color: post.is_liked ? '#F56C6C' : '' }"
                >
                  <el-icon><StarFilled v-if="post.is_liked" /><Star v-else /></el-icon>
                  {{ post.like_count || 0 }}
                </span>
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ post.comment_count || 0 }}
                </span>
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ post.view_count || 0 }}
                </span>
                <span class="post-time">{{ formatTimeAgo(post.created_at) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-else-if="!loading" description="暂无帖子">
        <el-button 
          type="primary" 
          v-if="authStore.isAuthenticated" 
          @click="goToFullEditor"
        >
          发布第一个帖子
        </el-button>
      </el-empty>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/config'
import { 
  School, ArrowRight, UserFilled, Star, StarFilled, 
  ChatDotRound, View, EditPen 
} from '@element-plus/icons-vue'
import { ALargeSmall } from 'lucide-vue-next'

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

// 从 ForumView.vue 复制分类
const categories = ref([
  { value: null, label: '全部' },
  { value: '教务', label: '教务' },
  { value: '生活', label: '生活' },
  { value: '工具', label: '工具' },
  { value: '健康', label: '健康' },
  { value: '娱乐', label: '娱乐' }
])

// 排序选项
const sortOptions = ref([
  { label: '最新', value: 'created_at' },
  { label: '热度', value: 'view_count' }, // 简化标签
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
    const resp = await api.post('/posts/search', {
      category: currentCategory.value,
      sort_by: sortBy.value,
      order: 'desc',
      page: 1,
      pageSize: props.limit || 10
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
  const mockPosts = []
  // 这里可以添加一些mock数据用于展示
  posts.value = mockPosts.map(post => ({
    ...post,
    timeAgo: formatTimeAgo(post.created_at)
  }))
}

const viewPost = (post) => {
  // 导航到论坛页面查看详情
  router.push(`/forum?post=${post.post_id}`)
}

const togglePostLike = async (post) => {
  if (!authStore.isAuthenticated) {
    // 提示登录
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

const goToFullEditor = () => {
  if (!authStore.isAuthenticated) {
    // 提示登录
    return
  }
  router.push('/forum?new=true')
}

// 辅助函数
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

const getCategoryType = (category) => {
  const map = {
    '教务': 'primary',
    '生活': 'success',
    '工具': 'info',
    '健康': 'danger',
    '娱乐': 'warning'
  }
  return map[category] || ''
}
</script>

<style scoped>
.module-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
}

.module-description {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 0.9rem;
}

.module-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409EFF;
  text-decoration: none;
  font-size: 0.9rem;
}

.forum-controls {
  margin-bottom: 15px;
}

.sort-col {
  display: flex;
  justify-content: flex-end;
}

.posts-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.post-item {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #EBEEF5;
}

.post-item:hover {
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.post-title {
  margin: 0;
  font-size: 1rem;
  color: #303133;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

.post-preview {
  font-size: 0.9rem;
  color: #606266;
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
  font-size: 0.85rem;
  color: #909399;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  background-color: #f0f2f5;
  color: #909399;
}

.compact-radio-group :deep(.el-radio-button__inner) {
  padding: 5px 11px;
	width: 45px;
  font-size: 12px;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.stat-item:hover {
  color: #409EFF;
}

/* Category Colors - Consistent with ForumView */
.cat-edu { background-color: #409EFF; border-color: #409EFF; color: white; }
.cat-life { background-color: #67C23A; border-color: #67C23A; color: white; }
.cat-tool { background-color: #909399; border-color: #909399; color: white; }
.cat-health { background-color: #F56C6C; border-color: #F56C6C; color: white; }
.cat-ent { background-color: #E6A23C; border-color: #E6A23C; color: white; }
.cat-other { background-color: #409EFF; border-color: #409EFF; color: white; }

@media (max-width: 768px) {
  .sort-col {
    justify-content: flex-start;
    margin-top: 10px;
  }
}
</style>