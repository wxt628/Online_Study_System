<template>
  <div class="forum-container">
    <!-- 导航栏 -->
    <el-header class="forum-header" height="64px">
      <div class="header-container">
        <div class="header-left">
          <div class="logo">
            <el-icon :size="28" color="#409EFF"><School /></el-icon>
            <span class="logo-text">校园论坛</span>
          </div>
        </div>

        <div class="header-right">
          <el-button type="primary" icon="EditPen" round @click="showCreatePost = true">
            发帖
          </el-button>
          
          <el-popover
            placement="bottom"
            :width="320"
            trigger="click"
            popper-class="notification-popper"
          >
            <template #reference>
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
                <el-button circle icon="Bell" />
              </el-badge>
            </template>
            
            <div class="notification-dropdown">
              <div class="notification-header">
                <h3>通知</h3>
                <el-button
                  v-if="unreadCount > 0"
                  type="primary"
                  link
                  size="small"
                  @click="markAllRead"
                >
                  全部已读
                </el-button>
              </div>
              
              <el-empty v-if="notifications.length === 0" description="暂无通知" :image-size="60" />
              
              <div v-else class="notification-list-scroll">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.notification_id"
                  class="notification-item"
                  :class="{ 'notification-unread': !notification.is_read }"
                  @click="markRead(notification.notification_id)"
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
          </el-popover>
        </div>
      </div>
    </el-header>

    <el-container class="forum-body">
      <!-- Desktop Sidebar -->
      <el-aside width="240px" class="hidden-xs-only sidebar-container">
        <el-card class="category-card" shadow="never">
           <div class="category-title">板块分类</div>
           <div class="category-list">
              <div 
                 v-for="cat in categories" 
                 :key="cat.value" 
                 class="category-item"
                 :class="{ active: currentCategory === cat.value }"
                 @click="selectCategory(cat.value)"
              >
                 <el-icon class="cat-icon" :size="18"><component :is="cat.icon" /></el-icon>
                 <span>{{ cat.label }}</span>
              </div>
           </div>
        </el-card>
      </el-aside>

      <el-main class="forum-main">
         <!-- Post Detail View -->
         <div v-if="selectedPost" class="post-detail-wrapper">
            <el-page-header @back="selectedPost = null" title="返回列表" class="detail-page-header">
               <template #content>
                  <span class="text-large font-600 mr-3"> 帖子详情 </span>
               </template>
            </el-page-header>
            
            <el-card class="post-detail-card">
               <div class="post-detail-header">
                  <div class="post-tags">
                     <el-tag :class="getCategoryClass(selectedPost.category)" effect="dark" round>
                        {{ selectedPost.category }}
                     </el-tag>
                  </div>
                  <h1 class="post-title">{{ selectedPost.title }}</h1>
                  <div class="post-meta-info">
                     <span class="meta-item"><el-icon><UserFilled /></el-icon> {{ selectedPost.author?.name || '匿名' }}</span>
                     <span class="meta-item"><el-icon><Clock /></el-icon> {{ formatDate(selectedPost.created_at) }}</span>
                     <span class="meta-item"><el-icon><View /></el-icon> {{ selectedPost.view_count || 0 }}</span>
                  </div>
               </div>
               
               <div class="post-content" v-html="selectedPost.content"></div>
               
               <div class="post-actions">
                  <el-button 
                     :type="selectedPost.is_liked ? 'danger' : 'default'" 
                     :icon="selectedPost.is_liked ? 'StarFilled' : 'Star'"
                     circle
                     size="large"
                     @click="toggleLike(selectedPost.post_id)"
                  />
                  <span class="like-count-large">{{ selectedPost.like_count || 0 }}</span>
               </div>
            </el-card>
            
            <!-- Comments -->
            <el-card class="comments-section">
               <template #header>
                  <div class="comments-header">
                     <h3>全部评论 ({{ comments.items?.length || 0 }})</h3>
                  </div>
               </template>
               
               <div class="comment-input-box">
                  <el-input
                     v-model="commentContent"
                     type="textarea"
                     :rows="3"
                     placeholder="友善的评论是交流的起点..."
                     resize="none"
                  />
                  <div class="comment-submit-row">
                     <el-button type="primary" @click="createComment" :disabled="!commentContent.trim()">发表评论</el-button>
                  </div>
               </div>
               
               <div class="comments-list">
                  <div v-if="comments.items && comments.items.length > 0">
                     <div v-for="comment in comments.items" :key="comment.comment_id" class="comment-item">
                        <div class="comment-left">
                           <el-avatar icon="UserFilled" :size="40" class="comment-avatar-img" />
                        </div>
                        <div class="comment-right">
                           <div class="comment-user-info">
                              <span class="comment-username">{{ comment.name }}</span>
                              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                              <el-button 
                                 v-if="comment.user_id === currentUserId" 
                                 link 
                                 type="danger" 
                                 icon="Delete" 
                                 size="small"
                                 @click="deleteComment(comment.comment_id)"
                              />
                           </div>
                           <div class="comment-text">{{ comment.content }}</div>
                           <div class="comment-action-bar">
                              <el-button link type="primary" size="small" icon="ChatDotRound" @click="replyTo = replyTo === comment.comment_id ? null : comment.comment_id">回复</el-button>
                           </div>
                           
                           <!-- Reply Input -->
                           <div v-if="replyTo === comment.comment_id" class="reply-input-box">
                              <el-input v-model="replyContent" placeholder="回复..." size="small">
                                 <template #append>
                                    <el-button @click="createReply(comment.comment_id)">发送</el-button>
                                 </template>
                              </el-input>
                           </div>
                           
                           <!-- Replies -->
                           <div v-if="comment.replies && comment.replies.length" class="replies-container">
                              <div v-for="reply in comment.replies" :key="reply.comment_id" class="reply-item">
                                 <span class="reply-user">{{ reply.name }}</span>
                                 <span class="reply-content">：{{ reply.content }}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <el-empty v-else description="暂无评论" :image-size="80" />
               </div>
            </el-card>
         </div>

         <!-- Post List View -->
         <div v-else class="post-list-wrapper">
            <div class="list-toolbar">
               <div class="view-switcher">
                  <el-radio-group v-model="currentView" size="small">
                     <el-radio-button label="list"><el-icon><List /></el-icon></el-radio-button>
                     <el-radio-button label="grid"><el-icon><Grid /></el-icon></el-radio-button>
                  </el-radio-group>
               </div>
               <div class="sort-selector">
                  <el-select v-model="sortBy" placeholder="排序方式" size="small" style="width: 120px" @change="loadPosts">
                     <el-option label="最新发布" value="created_at" />
                     <el-option label="最多点赞" value="like_count" />
                     <el-option label="最多浏览" value="view_count" />
                  </el-select>
               </div>
            </div>

            <div v-if="loading" class="skeleton-list">
               <el-skeleton :rows="3" animated count="3" />
            </div>
            
            <div v-else>
               <div v-if="posts.length === 0">
                  <el-empty description="暂无帖子">
                     <el-button type="primary" @click="showCreatePost = true">去发帖</el-button>
                  </el-empty>
               </div>
               
               <div v-else :class="['posts-display-area', currentView]">
                  <div 
                     v-for="post in posts" 
                     :key="post.post_id" 
                     class="post-card-modern"
                     @click="loadPostDetail(post.post_id)"
                  >
                     <div class="card-bg-decoration"></div>
                     <div class="post-card-body">
                        <div class="post-card-top">
                           <div class="post-category-tag" :class="getCategoryClass(post.category)">
                              {{ post.category }}
                           </div>
                           <div class="post-time-ago">{{ formatDate(post.created_at) }}</div>
                        </div>
                        
                        <h3 class="post-card-title">{{ post.title }}</h3>
                        <p class="post-card-desc">{{ post.content_preview || post.content.replace(/<[^>]+>/g, '').substring(0, 80) }}...</p>
                        
                        <div class="post-card-bottom">
                           <div class="post-author-small">
                              <el-icon><UserFilled /></el-icon> {{ post.author?.name || '匿名' }}
                           </div>
                           <div class="post-stats-row">
                              <span class="stat-item">
                                 <el-icon><View /></el-icon> {{ post.view_count || 0 }}
                              </span>
                              <span class="stat-item">
                                 <el-icon><ChatDotRound /></el-icon> {{ post.comment_count || 0 }}
                              </span>
                              <span class="stat-item like-item" @click.stop="toggleLike(post.post_id)">
                                 <el-icon :color="post.is_liked ? '#F56C6C' : ''"><component :is="post.is_liked ? 'StarFilled' : 'Star'" /></el-icon> {{ post.like_count || 0 }}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div class="pagination-wrapper" v-if="pagination.totalPages > 1">
                  <el-pagination
                     background
                     layout="prev, pager, next"
                     :total="pagination.total"
                     :page-size="pagination.pageSize"
                     v-model:current-page="pagination.page"
                     @current-change="changePage"
                  />
               </div>
            </div>
         </div>
      </el-main>
    </el-container>

    <!-- 发帖对话框 -->
    <el-dialog
      v-model="showCreatePost"
      title="发布新帖子"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="newPost" label-position="top">
        <el-form-item label="标题" required>
          <el-input v-model="newPost.title" placeholder="请输入帖子标题..." />
        </el-form-item>
        
        <el-form-item label="分类" required>
          <el-radio-group v-model="newPost.category">
            <el-radio-button 
              v-for="cat in categories.filter(c => c.value)" 
              :key="cat.value" 
              :label="cat.value"
            >
              <el-icon class="mr-1"><component :is="cat.icon" /></el-icon> {{ cat.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="内容" required>
          <el-input
            v-model="newPost.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子内容..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreatePost = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="createPost"
            :disabled="!newPost.title.trim() || !newPost.content.trim()"
          >
            发布
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  EditPen, Bell, View, ChatDotRound, 
  Delete, Grid, List, UserFilled,
  School, House, Tools, FirstAidKit, VideoPlay, StarFilled, Clock, Star
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '../api/config'

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
  { value: null, label: '全部', icon: 'List' },
  { value: '教务', label: '教务', icon: 'School' },
  { value: '生活', label: '生活', icon: 'House' },
  { value: '工具', label: '工具', icon: 'Tools' },
  { value: '健康', label: '健康', icon: 'FirstAidKit' },
  { value: '娱乐', label: '娱乐', icon: 'VideoPlay' }
])

const getCategoryClass = (category) => {
  const map = {
    '教务': 'cat-edu',
    '生活': 'cat-life',
    '工具': 'cat-tool',
    '健康': 'cat-health',
    '娱乐': 'cat-ent'
  }
  return map[category] || 'cat-other'
}

const unreadCount = computed(() => (notifications.value ?? []).filter(n => !n.is_read).length)

const selectCategory = (val) => {
  currentCategory.value = val
  pagination.value.page = 1
  loadPosts()
}



// 修复的 API 调用方法
const loadPosts = async () => {
  loading.value = true
  try {
    const resp = await api.post('/posts/search', {
      category: currentCategory.value,
      sort_by: sortBy.value,
      order: 'desc',
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })

    const data = resp.data.data
    posts.value = data.items ?? []

    pagination.value = {
      page: data.pagination?.page ?? 1,
      pageSize: data.pagination?.pageSize ?? pagination.value.pageSize,
      total: data.pagination?.total ?? 0,
      totalPages: data.pagination?.totalPages ?? 0
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
    const { data } = await api.post(`/posts/${postId}/detail`, { page: 1, pageSize: 20 })
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
    const { data } = await api.post(`/posts/${postId}/detail`, { page: 1, pageSize: 20 })
    
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
    const { data } = await api.post('/notifications/query', {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
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
    ElMessage.warning('请填写完整的帖子信息')
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
      ElMessage.success('发布成功！')
    } else {
      ElMessage.error('发布失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('Failed to create post:', error)
    if (error.response) {
      console.log('错误详情:', error.response.data)
    }
    ElMessage.error('发布失败，请重试')
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
      ElMessage.success('评论发表成功！')
    } else {
      ElMessage.error('评论失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('Failed to create comment:', error)
    if (error.response) {
      console.log('错误详情:', error.response.data)
    }
    ElMessage.error('评论失败，请重试')
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
      ElMessage.success('回复成功！')
    } else {
      ElMessage.error('回复失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('Failed to create reply:', error)
    if (error.response) {
      console.log('错误详情:', error.response.data)
    }
    ElMessage.error('回复失败，请重试')
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
/* Global Layout */
.forum-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 64px);
  gap: 20px;
}

.sidebar-container {
  position: sticky;
  top: 84px;
  height: fit-content;
  overflow: visible;
}

.forum-main {
  padding: 0;
  overflow: visible;
}

/* Header Tweaks */
.forum-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #ebeef5;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Category Sidebar */
.category-card {
  border-radius: 12px;
  border: none;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

.category-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid #409EFF;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
  font-weight: 500;
}

.category-item:hover {
  background-color: #ecf5ff;
  color: #409EFF;
  transform: translateX(4px);
}

.category-item.active {
  background: linear-gradient(90deg, #409EFF 0%, #79bbff 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.cat-icon {
  margin-right: 12px;
}

/* Post List Styling */
.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.post-card-modern {
  background: white;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.post-card-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #c6e2ff;
}

.card-bg-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at top right, #f0f9eb 0%, transparent 70%);
  opacity: 0.6;
}

.post-card-body {
  padding: 20px;
  position: relative;
  z-index: 1;
}

.post-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-category-tag {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
}

.post-time-ago {
  font-size: 12px;
  color: #909399;
}

.post-card-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.post-card-desc {
  font-size: 14px;
  color: #606266;
  margin: 0 0 16px;
  line-height: 1.6;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f2f6fc;
  padding-top: 12px;
}

.post-author-small {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.post-stats-row {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.like-item {
  cursor: pointer;
  transition: color 0.2s;
}

.like-item:hover {
  color: #f56c6c;
}

/* Grid View Overrides */
.posts-display-area.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.posts-display-area.grid .post-card-modern {
  margin-bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.posts-display-area.grid .post-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.posts-display-area.grid .post-card-bottom {
  margin-top: auto;
}

/* Detail View */
.detail-page-header {
  margin-bottom: 20px;
}

.post-detail-card {
  border-radius: 12px;
  margin-bottom: 24px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.post-detail-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
}

.post-tags {
  margin-bottom: 16px;
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 16px;
}

.post-meta-info {
  display: flex;
  gap: 24px;
  color: #909399;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  min-height: 200px;
}

.post-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  gap: 8px;
}

.like-count-large {
  font-size: 14px;
  color: #606266;
}

/* Comments Section */
.comments-section {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.comment-input-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.comment-submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-right {
  flex: 1;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-username {
  font-weight: 600;
  color: #303133;
}

.comment-date {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.replies-container {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.reply-item {
  font-size: 13px;
  margin-bottom: 6px;
}

.reply-user {
  color: #409EFF;
  font-weight: 500;
}

.reply-content {
  color: #606266;
}

/* Category Colors */
.cat-edu { background-color: #409EFF; border-color: #409EFF; }
.cat-life { background-color: #67C23A; border-color: #67C23A; }
.cat-tool { background-color: #909399; border-color: #909399; }
.cat-health { background-color: #F56C6C; border-color: #F56C6C; }
.cat-ent { background-color: #E6A23C; border-color: #E6A23C; }
.cat-other { background-color: #909399; border-color: #909399; }

/* Notification Popover */
.notification-list-scroll {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f5f7fa;
}

.notification-unread {
  background: #ecf5ff;
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.notification-item-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-content {
  margin: 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .forum-body {
    padding: 10px;
  }
  
  .post-detail-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .post-meta-info {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>

