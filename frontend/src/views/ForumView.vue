<template>
  <div class="forum-container">
    <!-- 导航栏 -->
    <header class="forum-header">
      <div class="header-container">
        <div class="header-left">
          <div class="logo">
            <span class="logo-icon">🏫</span>
            <span class="logo-text">校园论坛</span>
          </div>
        </div>

        <div class="header-right">
          <button class="btn btn-new-post" @click="showCreatePost = true">
            <span class="btn-icon">📝</span>
            发帖
          </button>
          
          <div class="notification-wrapper">
            <div v-if="showNotifications" class="notification-dropdown" v-click-outside="() => showNotifications = false">
              <div class="notification-header">
                <h3>通知</h3>
                <button
                  v-if="unreadCount > 0"
                  @click="markAllRead"
                  class="btn-mark-all"
                >
                  全部已读
                </button>
              </div>
              
              <div v-if="notifications.length === 0" class="notification-empty">
                暂无通知
              </div>
              
              <div v-for="notification in notifications" :key="notification.notification_id">
                <div
                  @click="markRead(notification.notification_id)"
                  :class="['notification-item', { 'notification-unread': !notification.is_read }]"
                >
                  <div class="notification-item-header">
                    <h4>{{ notification.title }}</h4>
                    <span class="notification-time">{{ formatDate(notification.created_at) }}</span>
                  </div>
                  <p class="notification-content">{{ notification.content }}</p>
                  <div v-if="!notification.is_read" class="notification-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="forum-main">
      <div v-if="selectedPost" class="post-detail-container">
        <!-- 返回按钮 -->
        <button class="btn-back" @click="selectedPost = null">
          <span class="back-icon">←</span>
          返回列表
        </button>
        
        <!-- 帖子详情 -->
        <div class="post-detail-card">
          <div class="post-detail-header">
            <div>
              <div class="post-meta">
                <span :class="['post-category', 'category-' + selectedPost.category.toLowerCase()]">
                  {{ selectedPost.category }}
                </span>
                <span class="post-time">{{ formatDate(selectedPost.created_at) }}</span>
              </div>
              <h1 class="post-title">{{ selectedPost.title }}</h1>
            </div>
          </div>
          
          <div class="post-content">
            <div v-html="selectedPost.content"></div>
          </div>
          
          <div class="post-actions">
            <div class="action-buttons">
              <button
                @click="toggleLike(selectedPost.post_id)"
                :class="['action-btn', selectedPost.is_liked ? 'liked' : '']"
              >
                <span class="action-icon">❤️</span>
                <span>{{ selectedPost.like_count || 0 }}</span>
              </button>
              <button class="action-btn">
                <span class="action-icon">💬</span>
                <span>{{ comments.items?.length || 0 }}</span>
              </button>
              <div class="action-btn view-count">
                <span class="action-icon">👁️</span>
                <span>{{ selectedPost.view_count || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 评论区域 -->
        <div class="comments-card">
          <h2 class="comments-title">评论 ({{ comments.items?.length || 0 }})</h2>
          
          <!-- 发表评论 -->
          <div class="comment-form">
            <textarea
              v-model="commentContent"
              placeholder="写下你的评论..."
              rows="3"
              class="comment-textarea"
            ></textarea>
            <div class="comment-form-actions">
              <button
                @click="createComment"
                :disabled="!commentContent.trim()"
                :class="['btn', 'btn-submit-comment', !commentContent.trim() && 'disabled']"
              >
                发表评论
              </button>
            </div>
          </div>
          
          <!-- 评论列表 -->
          <div v-if="comments.items && comments.items.length > 0" class="comments-list">
            <div v-for="comment in comments.items" :key="comment.comment_id" class="comment-item">
              <div class="comment-main">
                <div class="comment-avatar">
                  <span class="avatar-icon">👤</span>
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <div>
                      <span class="comment-author"> {{ comment.name }}</span>
                      <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                    </div>
                    <button
                      v-if="comment.user_id === currentUserId"
                      @click="deleteComment(comment.comment_id)"
                      class="btn-delete-comment"
                    >
                      ✕
                    </button>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <button
                      @click="replyTo = replyTo === comment.comment_id ? null : comment.comment_id"
                      class="btn-reply"
                    >
                      回复
                    </button>
                  </div>
                  
                  <!-- 回复输入框 -->
                  <div v-if="replyTo === comment.comment_id" class="reply-form">
                    <textarea
                      v-model="replyContent"
                      placeholder="写下回复..."
                      rows="2"
                      class="reply-textarea"
                    ></textarea>
                    <div class="reply-actions">
                      <button
                        @click="replyTo = null; replyContent = ''"
                        class="btn btn-cancel"
                      >
                        取消
                      </button>
                      <button
                        @click="createReply(comment.comment_id)"
                        :disabled="!replyContent.trim()"
                        :class="['btn', 'btn-submit-reply', !replyContent.trim() && 'disabled']"
                      >
                        回复
                      </button>
                    </div>
                  </div>
                  
                  <!-- 回复列表 -->
                  <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                    <div v-for="reply in comment.replies" :key="reply.comment_id" class="reply-item">
                      <div class="reply-content">
                        <div class="reply-header">
                          <div>
                            <span class="reply-author">{{ reply.name }}</span>
                            <span class="reply-time">{{ formatDate(reply.created_at) }}</span>
                          </div>
                          <button
                            v-if="reply.user_id === currentUserId"
                            @click="deleteComment(reply.comment_id)"
                            class="btn-delete-reply"
                          >
                            ✕
                          </button>
                        </div>
                        <p class="reply-text">{{ reply.content }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="comments-empty">
            暂无评论，快来抢沙发吧~
          </div>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div v-else class="forum-content">
        <!-- 左侧边栏 -->
        <div class="sidebar">
          <!-- 分类筛选 -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">分类</h3>
            <div class="category-list">
              <button
                v-for="cat in categories"
                :key="cat.value"
                @click="selectCategory(cat.value)"
                :class="['category-btn', currentCategory === cat.value && 'active']"
              >
                <span class="category-icon">{{ cat.icon }}</span>
                {{ cat.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 帖子列表主区域 -->
        <div class="posts-container">
          <!-- 列表头部 -->
          <div class="posts-header">
            <div class="view-toggle">
              <button
                @click="currentView = 'list'"
                :class="['view-btn', currentView === 'list' && 'active']"
              >
                ≡
              </button>
              <button
                @click="currentView = 'grid'"
                :class="['view-btn', currentView === 'grid' && 'active']"
              >
                ▣
              </button>
            </div>
            
            <div class="sort-controls">
              <select
                v-model="sortBy"
                @change="loadPosts"
                class="sort-select"
              >
                <option value="created_at">最新发布</option>
                <option value="like_count">最多点赞</option>
                <option value="view_count">最多浏览</option>
              </select>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-skeleton">
            <div v-for="i in 5" :key="i" class="skeleton-item">
              <div class="skeleton-category"></div>
              <div class="skeleton-title"></div>
              <div class="skeleton-content"></div>
              <div class="skeleton-meta">
                <div class="skeleton-meta-item"></div>
                <div class="skeleton-meta-item"></div>
              </div>
            </div>
          </div>

          <!-- 帖子列表 -->
          <div v-else>
            <!-- 列表视图 -->
            <div v-if="currentView === 'list'" class="posts-list">
              <div
                v-for="post in posts"
                :key="post.post_id"
                @click="loadPostDetail(post.post_id)"
                class="post-card"
              >
                <div class="post-card-header">
                  <div class="post-card-meta">
                    <span :class="['post-card-category', 'category-' + post.category.toLowerCase()]">
                      {{ post.category }}
                    </span>
                    <span class="post-card-time">{{ formatDate(post.created_at) }}</span>
                  </div>
                  <button
                    @click.stop="toggleLike(post.post_id)"
                    :class="['like-btn', post.is_liked && 'liked']"
                  >
                    <span class="like-icon">❤️</span>
                  </button>
                </div>
                
                <h3 class="post-card-title">
                  {{ post.title }}
                </h3>
                
                <p class="post-card-content">{{ post.content_preview }}</p>
                
                <div class="post-card-footer">
                  <div class="post-stats">
                    <span class="post-stat">
                      <span class="stat-icon">👤</span>
                      {{ post.author?.name }}
                    </span>
                    <span class="post-stat">
                      <span class="stat-icon">❤️</span>
                      {{ post.like_count }}
                    </span>
                    <span class="post-stat">
                      <span class="stat-icon">💬</span>
                      {{ post.comment_count }}
                    </span>
                    <span class="post-stat">
                      <span class="stat-icon">👁️</span>
                      {{ post.view_count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 网格视图 -->
            <div v-else class="posts-grid">
              <div
                v-for="post in posts"
                :key="post.post_id"
                @click="loadPostDetail(post.post_id)"
                class="post-grid-card"
              >
                <div class="post-grid-header">
                  <span :class="['post-grid-category', 'category-' + post.category.toLowerCase()]">
                    {{ post.category }}
                  </span>
                  <button
                    @click.stop="toggleLike(post.post_id)"
                    :class="['like-btn-small', post.is_liked && 'liked']"
                  >
                    <span class="like-icon">❤️</span>
                  </button>
                </div>
                
                <h3 class="post-grid-title">
                  {{ post.title }}
                </h3>
                
                <p class="post-grid-content">{{ post.content_preview }}</p>
                
                <div class="post-grid-footer">
                  <span class="post-grid-time">{{ formatDate(post.created_at) }}</span>
                  <div class="post-grid-stats">
                    <span class="post-grid-stat">
                      <span class="stat-icon">❤️</span>
                      {{ post.like_count }}
                    </span>
                    <span class="post-grid-stat">
                      <span class="stat-icon">💬</span>
                      {{ post.comment_count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="posts.length === 0" class="empty-state">
              <div class="empty-state-icon">📝</div>
              <h3 class="empty-state-title">暂无帖子</h3>
              <p class="empty-state-description">快来发布第一条帖子吧~</p>
              <button
                @click="showCreatePost = true"
                class="btn btn-new-post-empty"
              >
                立即发帖
              </button>
            </div>

            <!-- 分页 -->
            <div v-if="pagination.totalPages > 1" class="pagination">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                :class="['pagination-btn', pagination.page <= 1 && 'disabled']"
              >
                上一页
              </button>
              
              <div class="pagination-numbers">
                <button
                  v-for="pageNum in visiblePages"
                  :key="pageNum"
                  @click="changePage(pageNum)"
                  :class="['pagination-number', pageNum === pagination.page && 'active']"
                >
                  {{ pageNum }}
                </button>
              </div>
              
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                :class="['pagination-btn', pagination.page >= pagination.totalPages && 'disabled']"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 移动端底部导航 -->
    <div class="mobile-nav">
      <div class="mobile-nav-items">
        <button
          @click="selectedPost = null"
          :class="['mobile-nav-item', !selectedPost && 'active']"
        >
          <span class="mobile-nav-icon">🏠</span>
          <span class="mobile-nav-text">首页</span>
        </button>
        <button
          @click="showCreatePost = true"
          class="mobile-nav-item"
        >
          <span class="mobile-nav-icon">📝</span>
          <span class="mobile-nav-text">发帖</span>
        </button>
        <button
          @click="showNotifications = true"
          class="mobile-nav-item"
        >
          <span class="mobile-nav-icon">🔔</span>
          <span class="mobile-nav-text">通知</span>
          <span v-if="unreadCount > 0" class="mobile-nav-badge">
            {{ unreadCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- 发帖模态框 -->
    <div v-if="showCreatePost" class="modal-overlay">
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">发布新帖子</h2>
            <button
              @click="showCreatePost = false"
              class="modal-close"
            >
              ✕
            </button>
          </div>
          
          <form @submit.prevent="createPost" class="modal-form">
            <div class="form-group">
              <label class="form-label">标题</label>
              <input
                v-model="newPost.title"
                type="text"
                placeholder="请输入帖子标题..."
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">分类</label>
              <div class="category-selection">
                <button
                  v-for="cat in categories.filter(c => c.value)"
                  :key="cat.value"
                  type="button"
                  @click="newPost.category = cat.value"
                  :class="['category-option', newPost.category === cat.value && 'selected']"
                >
                  <span class="category-option-icon">{{ cat.icon }}</span>
                  <span class="category-option-label">{{ cat.label }}</span>
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">内容</label>
              <div class="editor-wrapper">
                <div class="editor-toolbar">
                  <button type="button" class="editor-btn">B</button>
                  <button type="button" class="editor-btn">
                    <i>I</i>
                  </button>
                  <button type="button" class="editor-btn">U</button>
                </div>
                <textarea
                  v-model="newPost.content"
                  placeholder="请输入帖子内容..."
                  rows="10"
                  required
                  class="editor-textarea"
                ></textarea>
              </div>
            </div>
            
            <div class="form-actions">
              <button
                type="button"
                @click="showCreatePost = false"
                class="btn btn-cancel"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="!newPost.title.trim() || !newPost.content.trim()"
                :class="['btn', 'btn-submit', (!newPost.title.trim() || !newPost.content.trim()) && 'disabled']"
              >
                发布
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api/config'

// 创建图标组件（使用文本图标代替）
const createIcon = (icon) => ({
  template: `<span>${icon}</span>`
})

// 状态变量
const posts = ref([])
const selectedPost = ref(null)
const comments = ref({ items: [], pagination: {} })
const notifications = ref([])
const loading = ref(false)
const currentCategory = ref(null)
const sortBy = ref('created_at')
const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
const showCreatePost = ref(false)
const showNotifications = ref(false)
const commentContent = ref('')
const replyContent = ref('')
const replyTo = ref(null)
const currentView = ref('list')
const currentUserId = ref(1) // 应该从登录状态获取

// 发帖表单
const newPost = ref({
  title: '',
  category: '教务',
  content: ''
})

const categories = ref([
  { value: null, label: '全部', icon: '≡' },
  { value: '教务', label: '教务', icon: '🎓' },
  { value: '生活', label: '生活', icon: '🏠' },
  { value: '工具', label: '工具', icon: '🔧' },
  { value: '健康', label: '健康', icon: '❤️' },
  { value: '娱乐', label: '娱乐', icon: '🎮' }
])

const unreadCount = computed(() => (notifications.value ?? []).filter(n => !n.is_read).length)

// 修复的 API 调用方法
const loadPosts = async () => {
  loading.value = true
  try {
    const resp = await api.get('/posts', {
      params: {
        category: currentCategory.value,
        sort_by: sortBy.value,
        page: pagination.value.page,
        page_size: pagination.value.pageSize
      }
    })

    const data = resp.data.data
    posts.value = data.items ?? []

    pagination.value = {
      page: data.pagination?.page ?? 1,
      pageSize: data.pagination?.page_size ?? pagination.value.pageSize,
      total: data.pagination?.total ?? 0,
      totalPages: data.pagination?.total_pages ?? 0
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
    console.log('加载帖子失败，请重试')
  } finally {
    loading.value = false
  }
}

const loadPostDetail = async (postId) => {
  try {
    const { data } = await api.get(`/posts/${postId}`)
    selectedPost.value = data.data?.post
    if (selectedPost.value) {
      loadComments(postId)
    }
  } catch (error) {
    console.error('Failed to load post detail:', error)
    console.log('加载帖子详情失败')
  }
}

const loadComments = async (postId) => {
  try {
    // 根据后端代码，评论是包含在帖子详情接口中的
    const { data } = await api.get(`/posts/${postId}`, {
      params: {
        page: 1,
        pageSize: 20
      }
    })
    
    if (data.code === 200 && data.data) {
      comments.value = {
        items: data.data.comments?.items ?? [],
        pagination: data.data.comments?.pagination ?? {}
      }
    } else {
      comments.value = { items: [], pagination: {} }
    }
  } catch (error) {
    console.error('Failed to load comments:', error)
    comments.value = { items: [], pagination: {} }
  }
}

const loadNotifications = async () => {
  try {
    const { data } = await api.get('/notifications/', {
      params: {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize
      }
    })

    const res = data.data
    notifications.value = res.items ?? []

    pagination.value = {
      page: res.pagination?.page ?? 1,
      pageSize: res.pagination?.pageSize ?? 20,
      total: res.pagination?.total ?? 0,
      totalPages: res.pagination?.totalPages ?? 0
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
}

// 关键修复：创建帖子方法
const createPost = async () => {
  if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
    console('请填写完整的帖子信息')
    return
  }

  try {
    // 使用 FormData 格式发送数据
    const formData = new FormData()
    formData.append('title', newPost.value.title)
    formData.append('content', newPost.value.content)
    if (newPost.value.category) {
      formData.append('category', newPost.value.category)
    }

    // 确保使用正确的路径（没有结尾的斜杠）
    const response = await api.post('/posts', formData, {})
    
    if (response.data.code === 200) {
      showCreatePost.value = false
      newPost.value = { title: '', category: '教务', content: '' }
      loadPosts()
      console.log('发布成功！')
    } else {
      console.log('发布失败:', response.data.message)
    }
  } catch (error) {
    console.error('Failed to create post:', error)
    if (error.response) {
      console.log('错误详情:', error.response.data)
    }
    console.log('发布失败，请重试')
  }
}

const createComment = async () => {
  if (!commentContent.value.trim() || !selectedPost.value) return

  try {
    const formData = new FormData()
    formData.append('content', commentContent.value)
    
    // 正确的接口路径应该是：/posts/{post_id}/comments
    const response = await api.post(`/posts/${selectedPost.value.post_id}/comments`, formData, {})
    
    if (response.data.code === 200) {
      commentContent.value = ''
      // 重新加载评论
      await loadComments(selectedPost.value.post_id)
      console.log('评论发表成功！')
    } else {
      console.log('评论失败:', response.data.message)
    }
  } catch (error) {
    console.error('Failed to create comment:', error)
    if (error.response) {
      console.log('错误详情:', error.response.data)
    }
    console.log('评论失败，请重试')
  }
}

const createReply = async (parentId) => {
  if (!replyContent.value.trim() || !selectedPost.value) return

  try {
    const formData = new FormData()
    formData.append('content', replyContent.value)
    formData.append('parent_id', parentId.toString()) // 添加 parent_id 表示这是回复

    const response = await api.post(`/posts/${selectedPost.value.post_id}/comments`, formData, {})
    
    if (response.data.code === 200) {
      replyContent.value = ''
      replyTo.value = null
      // 刷新帖子详情（包含评论）
      await loadPostDetail(selectedPost.value.post_id)
      console.log('回复成功！')
    } else {
      console.log('回复失败:', response.data.message)
    }
  } catch (error) {
    console.error('Failed to create reply:', error)
    if (error.response) {
      console.log('错误详情:', error.response.data)
    }
    console.log('回复失败，请重试')
  }
}

const toggleLike = async (postId) => {
  try {
    const { data } = await api.post(`/posts/${postId}/like`)
    
    if (data.code === 200 && data.data) {
      const likeData = data.data
      
      // 更新选中帖子的点赞状态
      if (selectedPost.value && selectedPost.value.post_id === postId) {
        selectedPost.value.is_liked = likeData.is_liked
        selectedPost.value.like_count = likeData.like_count
      }
      
      // 更新帖子列表中的点赞状态
      const post = posts.value.find(p => p.post_id === postId)
      if (post) {
        post.is_liked = likeData.is_liked
        post.like_count = likeData.like_count
      }
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    console.log('操作失败，请重试')
  }
}

const markRead = async (notificationId) => {
  try {
    const { data } = await api.put(`/notifications/${notificationId}/read`)
    
    if (data.code === 200) {
      const notification = notifications.value.find(n => n.notification_id === notificationId)
      if (notification) {
        notification.is_read = true
      }
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const markAllRead = async () => {
  try {
    const { data } = await api.put('/notifications/read-all')
    
    if (data.code === 200) {
      notifications.value.forEach(n => n.is_read = true)
      showNotifications.value = false
    }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    console.log('操作失败，请重试')
  }
}

const selectCategory = (category) => {
  currentCategory.value = category
  pagination.value.page = 1
  loadPosts()
}

const changePage = (page) => {
  pagination.value.page = page
  loadPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateString) => {
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

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(current - 1)
      pages.push(current)
      pages.push(current + 1)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages.filter(page => page !== '...')
})

const deleteComment = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const { data } = await api.delete(`/comments/${commentId}`)
    
    if (data.code === 200 && selectedPost.value) {
      await loadPostDetail(selectedPost.value.post_id)
    } else {
      console.log('删除失败:', data.message)
    }
  } catch (error) {
    console.error('Failed to delete comment:', error)
    console.log('删除失败，请重试')
  }
}

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

onMounted(() => {
  loadPosts()
  loadNotifications()
})
</script>

<style scoped>
/* 基础样式 */
.forum-container {
  min-height: 100vh;
  background-color: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
}

/* 导航栏样式 */
.forum-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 20px;
  color: #1e40af;
}

.logo-icon {
  font-size: 24px;
}

.search-box {
  position: relative;
  display: none;
}

@media (min-width: 768px) {
  .search-box {
    display: block;
    flex: 1;
    max-width: 400px;
  }
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-new-post {
  background-color: #2563eb;
  color: white;
}

.btn-new-post:hover {
  background-color: #1d4ed8;
}

.btn-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  position: relative;
}

.btn-icon-btn:hover {
  background-color: #f3f4f6;
}

/* 通知样式 */
.notification-wrapper {
  position: relative;
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.notification-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.btn-mark-all {
  color: #2563eb;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-mark-all:hover {
  color: #1d4ed8;
}

.notification-empty {
  padding: 32px;
  text-align: center;
  color: #6b7280;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-unread {
  background-color: #eff6ff;
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-item-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.notification-time {
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
}

.notification-content {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
}

.notification-dot {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
}

.notification-icon {
  font-size: 20px;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主内容区域 */
.forum-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 24px;
  font-size: 14px;
}

.btn-back:hover {
  color: #374151;
}

.back-icon {
  font-size: 16px;
}

/* 帖子详情卡片 */
.post-detail-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.post-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.post-category {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.post-time {
  font-size: 14px;
  color: #6b7280;
}

.post-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.4;
}

.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: #374151;
  margin-bottom: 24px;
}

.post-content :deep(*) {
  margin-bottom: 1em;
}

.post-content :deep(*:last-child) {
  margin-bottom: 0;
}

.post-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.action-btn.liked {
  color: #ef4444;
}

.action-icon {
  font-size: 16px;
}

.view-count {
  cursor: default;
}

.view-count:hover {
  background: none;
}

/* 评论卡片 */
.comments-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.comments-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
}

.comment-form {
  margin-bottom: 32px;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.btn-submit-comment {
  background-color: #2563eb;
  color: white;
}

.btn-submit-comment:hover:not(.disabled) {
  background-color: #1d4ed8;
}

.btn-submit-comment.disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 24px;
}

.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-main {
  display: flex;
  gap: 16px;
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #dbeafe;
  border-radius: 50%;
  font-size: 20px;
  color: #1e40af;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.comment-time {
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
}

.btn-delete-comment {
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  line-height: 1;
}

.btn-delete-comment:hover {
  color: #ef4444;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}

.comment-actions {
  margin-top: 8px;
}

.btn-reply {
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
}

.btn-reply:hover {
  color: #374151;
}

/* 回复表单 */
.reply-form {
  margin-top: 16px;
  padding-left: 24px;
  border-left: 2px solid #e5e7eb;
}

.reply-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 8px;
}

.reply-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel {
  color: #6b7280;
  background-color: #f3f4f6;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-submit-reply {
  background-color: #2563eb;
  color: white;
}

.btn-submit-reply:hover:not(.disabled) {
  background-color: #1d4ed8;
}

.btn-submit-reply.disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* 回复列表 */
.replies-list {
  margin-top: 16px;
  padding-left: 24px;
  border-left: 2px solid #e5e7eb;
}

.reply-item {
  margin-bottom: 16px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.reply-time {
  font-size: 11px;
  color: #6b7280;
  margin-left: 6px;
}

.btn-delete-reply {
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  font-size: 14px;
  line-height: 1;
}

.btn-delete-reply:hover {
  color: #ef4444;
}

.reply-text {
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
  margin: 0;
}

.comments-empty {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

/* 论坛内容区域 */
.forum-content {
  display: flex;
  gap: 24px;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  display: none;
}

@media (min-width: 1024px) {
  .sidebar {
    display: block;
  }
}

.sidebar-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 16px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.category-btn:hover {
  background-color: #f9fafb;
  color: #374151;
}

.category-btn.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.category-icon {
  font-size: 16px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  padding: 6px 12px;
  background-color: #f3f4f6;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  background-color: #e5e7eb;
  color: #111827;
}

/* 帖子容器 */
.posts-container {
  flex: 1;
  min-width: 0;
}

.posts-header {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-toggle {
  display: flex;
  gap: 4px;
}

.view-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.view-btn:hover {
  background-color: #f9fafb;
}

.view-btn.active {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* 加载骨架屏 */
.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.skeleton-category {
  width: 60px;
  height: 24px;
  background-color: #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
}

.skeleton-title {
  width: 70%;
  height: 28px;
  background-color: #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.skeleton-content {
  width: 100%;
  height: 60px;
  background-color: #e5e7eb;
  border-radius: 6px;
  margin-bottom: 16px;
}

.skeleton-meta {
  display: flex;
  gap: 24px;
}

.skeleton-meta-item {
  width: 80px;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 4px;
}

/* 帖子列表样式 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.post-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-card-category {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.post-card-time {
  font-size: 14px;
  color: #6b7280;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  font-size: 16px;
  border-radius: 6px;
}

.like-btn:hover {
  background-color: #f3f4f6;
}

.like-btn.liked {
  color: #ef4444;
}

.like-icon {
  font-size: 16px;
}

.post-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.post-card-content {
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
  margin: 0 0 16px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.post-card-footer {
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
}

.post-stats {
  display: flex;
  gap: 24px;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.stat-icon {
  font-size: 14px;
}

/* 网格视图 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.post-grid-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.post-grid-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.post-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.post-grid-category {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: white;
}

.like-btn-small {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: #9ca3af;
  font-size: 14px;
  border-radius: 4px;
}

.like-btn-small:hover {
  background-color: #f3f4f6;
}

.like-btn-small.liked {
  color: #ef4444;
}

.post-grid-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.post-grid-content {
  font-size: 13px;
  line-height: 1.5;
  color: #6b7280;
  margin: 0 0 12px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
}

.post-grid-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
}

.post-grid-time {
  font-size: 12px;
  color: #9ca3af;
}

.post-grid-stats {
  display: flex;
  gap: 12px;
}

.post-grid-stat {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #6b7280;
}

/* 空状态 */
.empty-state {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 48px 24px;
  text-align: center;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.btn-new-post-empty {
  background-color: #2563eb;
  color: white;
  font-size: 16px;
  padding: 12px 24px;
}

.btn-new-post-empty:hover {
  background-color: #1d4ed8;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(.disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn.disabled {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
}

.pagination-number {
  width: 40px;
  height: 40px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-number:hover:not(.active) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.pagination-number.active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: white;
}

/* 分类颜色 */
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

/* 移动端导航 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -1px 3px 0 rgba(0, 0, 0, 0.1);
  display: block;
}

@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}

.mobile-nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 8px;
  position: relative;
  flex: 1;
}

.mobile-nav-item:hover {
  color: #374151;
}

.mobile-nav-item.active {
  color: #2563eb;
}

.mobile-nav-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.mobile-nav-text {
  font-size: 11px;
}

.mobile-nav-badge {
  position: absolute;
  top: 2px;
  right: calc(50% - 20px);
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background-color: white;
  border-radius: 12px;
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #6b7280;
  padding: 4px;
  border-radius: 6px;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

/* 表单样式 */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .category-selection {
    grid-template-columns: repeat(5, 1fr);
  }
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: none;
  cursor: pointer;
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
  font-size: 20px;
  margin-bottom: 8px;
}

.category-option-label {
  font-size: 12px;
  font-weight: 500;
}

.editor-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.editor-btn {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.editor-btn:hover {
  background-color: #f3f4f6;
}

.editor-textarea {
  width: 100%;
  padding: 12px;
  border: none;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
}

.editor-textarea:focus {
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-submit {
  background-color: #2563eb;
  color: white;
}

.btn-submit:hover:not(.disabled) {
  background-color: #1d4ed8;
}

.btn-submit.disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal {
  animation: fadeIn 0.2s ease-out;
}

.notification-dropdown {
  animation: fadeIn 0.15s ease-out;
}
</style>
