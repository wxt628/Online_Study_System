<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Header -->
    <header class="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <School class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">校园论坛</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <button @click="showCreatePost = true" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <PenSquare class="w-4 h-4" />
              <span class="hidden sm:inline">发帖</span>
            </button>
            
            <button @click="showNotifications = !showNotifications" class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell class="w-5 h-5 text-gray-600" />
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <aside class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h3 class="font-semibold text-gray-900 mb-4">分类</h3>
            <div class="space-y-2">
              <button
                v-for="cat in categories"
                :key="cat.value"
                @click="selectCategory(cat.value)"
                :class="[
                  'w-full text-left px-4 py-2 rounded-lg transition-colors',
                  currentCategory === cat.value
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                ]"
              >
                <component :is="cat.icon" class="w-4 h-4 inline mr-2" />
                {{ cat.label }}
              </button>
            </div>

            <div class="mt-6 pt-6 border-t">
              <h3 class="font-semibold text-gray-900 mb-4">排序</h3>
              <select
                v-model="sortBy"
                @change="loadPosts"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="created_at">最新发布</option>
                <option value="like_count">最多点赞</option>
                <option value="view_count">最多浏览</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="lg:col-span-3">
          <!-- Post Detail View -->
          <div v-if="selectedPost" class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div class="p-6">
              <button @click="selectedPost = null" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft class="w-4 h-4" />
                返回列表
              </button>
              
              <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ selectedPost.title }}</h1>
              
              <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span class="flex items-center gap-1">
                  <User class="w-4 h-4" />
                  用户 {{ selectedPost.user_id }}
                </span>
                <span class="flex items-center gap-1">
                  <Calendar class="w-4 h-4" />
                  {{ formatDate(selectedPost.created_at) }}
                </span>
                <span class="flex items-center gap-1">
                  <Eye class="w-4 h-4" />
                  {{ selectedPost.view_count }}
                </span>
              </div>

              <div class="prose max-w-none mb-6 text-gray-700 leading-relaxed">
                {{ selectedPost.content }}
              </div>

              <div class="flex items-center gap-4 pt-6 border-t">
                <button
                  @click="toggleLike(selectedPost.post_id)"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    selectedPost.is_liked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  <Heart :class="selectedPost.is_liked ? 'fill-current' : ''" class="w-5 h-5" />
                  {{ selectedPost.like_count }}
                </button>
                
                <span class="flex items-center gap-2 text-gray-600">
                  <MessageSquare class="w-5 h-5" />
                  {{ comments.items.length }} 评论
                </span>
              </div>
            </div>

            <!-- Comments Section -->
            <div class="border-t bg-gray-50 p-6">
              <h3 class="font-semibold text-gray-900 mb-4">评论</h3>
              
              <!-- Comment Form -->
              <div class="mb-6">
                <textarea
                  v-model="commentContent"
                  placeholder="写下你的评论..."
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows="3"
                ></textarea>
                <button
                  @click="createComment"
                  :disabled="!commentContent.trim()"
                  class="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  发表评论
                </button>
              </div>

              <!-- Comments List -->
              <div class="space-y-4">
                <div v-for="comment in comments.items" :key="comment.comment_id" class="bg-white rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-gray-900">用户 {{ comment.user_id }}</span>
                        <span class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</span>
                      </div>
                      <p class="text-gray-700 mb-2">{{ comment.content }}</p>
                      
                      <button
                        @click="replyTo = replyTo === comment.comment_id ? null : comment.comment_id"
                        class="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        回复
                      </button>

                      <!-- Reply Form -->
                      <div v-if="replyTo === comment.comment_id" class="mt-3">
                        <textarea
                          v-model="replyContent"
                          placeholder="回复..."
                          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                          rows="2"
                        ></textarea>
                        <div class="mt-2 flex gap-2">
                          <button
                            @click="createReply(comment.comment_id)"
                            class="px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                          >
                            发送
                          </button>
                          <button
                            @click="replyTo = null; replyContent = ''"
                            class="px-4 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            取消
                          </button>
                        </div>
                      </div>

                      <!-- Replies -->
                      <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
                        <div v-for="reply in comment.replies" :key="reply.comment_id" class="text-sm">
                          <span class="font-medium text-gray-900">用户 {{ reply.user_id }}</span>
                          <span class="text-gray-500 mx-2">·</span>
                          <span class="text-gray-700">{{ reply.content }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="comments.items.length === 0" class="text-center py-8 text-gray-500">
                  暂无评论，快来发表第一条评论吧！
                </div>
              </div>
            </div>
          </div>

          <!-- Posts List -->
          <div v-else class="space-y-4">
            <div
              v-for="post in posts"
              :key="post.post_id"
              @click="loadPostDetail(post.post_id)"
              class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors flex-1">
                    {{ post.title }}
                  </h3>
                  <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full flex-shrink-0 ml-3">
                    {{ post.category }}
                  </span>
                </div>
                
                <p class="text-gray-600 mb-4 line-clamp-2">{{ post.content_preview }}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1">
                      <User class="w-4 h-4" />
                      用户 {{ post.author.user_id }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Calendar class="w-4 h-4" />
                      {{ formatDate(post.created_at) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1">
                      <Heart class="w-4 h-4" />
                      {{ post.like_count }}
                    </span>
                    <span class="flex items-center gap-1">
                      <MessageSquare class="w-4 h-4" />
                      {{ post.comment_count }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Eye class="w-4 h-4" />
                      {{ post.view_count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2 mt-6">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span class="px-4 py-2 text-gray-700">
                第 {{ pagination.page }} / {{ pagination.totalPages }} 页
              </span>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page === pagination.totalPages"
                class="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>

            <div v-if="loading" class="text-center py-8 text-gray-500">
              加载中...
            </div>

            <div v-if="!loading && posts.length === 0" class="text-center py-12 text-gray-500">
              暂无帖子
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePost" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">发布新帖</h2>
          <button @click="showCreatePost = false" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              v-model="newPost.title"
              type="text"
              placeholder="输入帖子标题"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              v-model="newPost.category"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="校园">校园</option>
              <option value="学习">学习</option>
              <option value="生活">生活</option>
              <option value="活动">活动</option>
              <option value="交流">交流</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
            <textarea
              v-model="newPost.content"
              placeholder="分享你的想法..."
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows="8"
            ></textarea>
          </div>
        </div>
        
        <div class="p-6 border-t flex justify-end gap-3">
          <button
            @click="showCreatePost = false"
            class="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="createPost"
            :disabled="!newPost.title.trim() || !newPost.content.trim()"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发布
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications Panel -->
    <div v-if="showNotifications" class="fixed top-16 right-4 w-96 bg-white rounded-xl shadow-xl border max-h-[600px] overflow-hidden z-50">
      <div class="p-4 border-b flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">通知</h3>
        <button @click="markAllRead" class="text-sm text-indigo-600 hover:text-indigo-700">
          全部已读
        </button>
      </div>
      
      <div class="overflow-y-auto max-h-[500px]">
        <div
          v-for="notification in notifications"
          :key="notification.notification_id"
          :class="[
            'p-4 border-b hover:bg-gray-50 cursor-pointer',
            !notification.is_read && 'bg-blue-50'
          ]"
          @click="markRead(notification.notification_id)"
        >
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0" v-if="!notification.is_read"></div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 text-sm">{{ notification.title }}</p>
              <p class="text-gray-600 text-sm mt-1">{{ notification.content }}</p>
              <p class="text-gray-500 text-xs mt-1">{{ formatDate(notification.created_at) }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          暂无通知
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  School,
  PenSquare,
  Bell,
  Heart,
  MessageSquare,
  Eye,
  User,
  Calendar,
  ArrowLeft,
  X,
  Bookmark,
  TrendingUp,
  Users,
  Sparkles,
  Hash,
  Home,
  Grid3x3,
  List,
  MessageCircle,
  ChevronDown,
  Search,
  Star,
  Inbox,
  GraduationCap,
  Home as HomeIcon,
  Wrench,
  Heart as HeartIcon,
  Gamepad2
} from 'lucide-vue-next'
import api from '../api/config'

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
const searchQuery = ref('')

const newPost = ref({
  title: '',
  category: '教务',
  content: ''
})

const hotTags = ref(['一卡通', '图书馆', '课表', '成绩', '校园网', '失物招领'])

const categories = ref([
  { value: null, label: '全部', icon: List },
  { value: '教务', label: '教务', icon: GraduationCap },
  { value: '生活', label: '生活', icon: HomeIcon },
  { value: '工具', label: '工具', icon: Wrench },
  { value: '健康', label: '健康', icon: HeartIcon },
  { value: '娱乐', label: '娱乐', icon: Gamepad2 }
])

const unreadCount = computed(() => (notifications.value ?? []).filter(n => !n.is_read).length)

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
    selectedPost.value = data
    loadComments(postId)
  } catch (error) {
    console.error('Failed to load post detail:', error)
    console.log('加载帖子详情失败')
  }
}

const loadComments = async (postId) => {
  try {
    const { data } = await api.get(`/posts/${postId}/comments/`)
    comments.value = {
      items: data.items ?? [],
      pagination: data.pagination ?? {}
    }
  } catch (error) {
    console.error('Failed to load comments:', error)
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


const createPost = async () => {
  if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
    console.log('请填写完整的帖子信息')
    return
  }

  try {
    await api.post('/posts/', {
      title: newPost.value.title,
      category: newPost.value.category,
      content: newPost.value.content
    })
    
    showCreatePost.value = false
    newPost.value = { title: '', category: '教务', content: '' }
    loadPosts()
    console.log('发布成功！')
  } catch (error) {
    console.error('Failed to create post:', error)
    console.log('发布失败，请重试')
  }
}

const createComment = async () => {
  if (!commentContent.value.trim()) return

  try {
    await api.post(`/posts/${selectedPost.value.post_id}/comments/`, {
      content: commentContent.value
    })
    
    commentContent.value = ''
    loadComments(selectedPost.value.post_id)
  } catch (error) {
    console.error('Failed to create comment:', error)
    console.log('评论失败，请重试')
  }
}

const createReply = async (parentId) => {
  if (!replyContent.value.trim()) return

  try {
    await api.post(`/posts/${selectedPost.value.post_id}/comments/`, {
      content: replyContent.value,
      parent_id: parentId
    })
    
    replyContent.value = ''
    replyTo.value = null
    loadComments(selectedPost.value.post_id)
  } catch (error) {
    console.error('Failed to create reply:', error)
    console.log('回复失败，请重试')
  }
}

const toggleLike = async (postId) => {
  try {
    const { data } = await api.post(`/posts/${postId}/like`)
    
    if (selectedPost.value && selectedPost.value.post_id === postId) {
      selectedPost.value.is_liked = data.is_liked
      selectedPost.value.like_count = data.like_count
    }
    
    const post = posts.value.find(p => p.post_id === postId)
    if (post) {
      post.is_liked = data.is_liked
      post.like_count = data.like_count
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    console.log('操作失败，请重试')
  }
}

const markRead = async (notificationId) => {
  try {
    await api.post(`/notifications/${notificationId}/read`)
    
    const notification = notifications.value.find(n => n.notification_id === notificationId)
    if (notification) {
      notification.is_read = true
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const markAllRead = async () => {
  try {
    await api.post('/notifications/read-all')
    
    notifications.value.forEach(n => n.is_read = true)
    showNotifications.value = false
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
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const getCategoryColor = (category) => {
  const colors = {
    '教务': 'bg-cyan-500',
    '生活': 'bg-amber-500',
    '工具': 'bg-emerald-500',
    '健康': 'bg-rose-500',
    '娱乐': 'bg-purple-500'
  }
  return colors[category] || 'bg-gray-500'
}

const getCategoryIcon = (category) => {
  const icons = {
    '教务': GraduationCap,
    '生活': HomeIcon,
    '工具': Wrench,
    '健康': HeartIcon,
    '娱乐': Gamepad2
  }
  return icons[category] || List
}

onMounted(() => {
  loadPosts()
  loadNotifications()
})
</script>

<style scoped>
	body{background: black;}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
* {
  transition-property: background-color, border-color, color, box-shadow, transform, opacity;
  transition-duration: 150ms;
  transition-timing-function: ease;
}

/* ===== 卡片 hover 细节 ===== */
.group:hover {
  transform: translateY(-2px);
}

.group:hover h3 {
  text-decoration: underline;
}

/* ===== 帖子卡片阴影强化 ===== */
.group {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.group:hover {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
}

/* ===== 弹窗动画 ===== */
@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.fixed.inset-0 > div {
  animation: modal-in 0.25s ease-out;
}

/* ===== 通知面板动画 ===== */
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.fixed.top-16 {
  animation: slide-down 0.2s ease-out;
}

/* ===== 评论区层级 ===== */
.comment {
  position: relative;
}

.comment::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 16px;
  width: 6px;
  height: 6px;
  background-color: #6366f1;
  border-radius: 50%;
}

/* ===== 回复缩进优化 ===== */
.reply {
  padding-left: 12px;
  border-left: 2px dashed #e5e7eb;
}

/* ===== 点赞按钮动画 ===== */
button:active svg {
  transform: scale(1.15);
}

/* ===== 输入框聚焦效果 ===== */
input:focus,
textarea:focus,
select:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

/* ===== 滚动条美化（Chrome / Edge） ===== */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}

/* ===== 小按钮 hover 微动画 ===== */
button:hover svg {
  transform: translateY(-1px);
}

/* ===== 空状态图标动画 ===== */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}

.text-center .w-24 {
  animation: float 3s ease-in-out infinite;
}

/* ===== 行数裁剪兜底 ===== */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* 添加标准属性 */
}
</style>
