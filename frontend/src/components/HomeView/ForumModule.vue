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
    
    <!-- 快速发帖区域 -->
    <div class="quick-post" v-if="showQuickPost && authStore.isAuthenticated">
      <div class="post-input">
        <img :src="userAvatar" alt="用户头像" class="user-avatar-sm" />
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="quickPostContent" 
            placeholder="有什么想和大家分享的？"
            @click="goToFullEditor"
          />
        </div>
      </div>
      <div class="post-actions">
        <button class="btn-post" @click="goToFullEditor">
          <i class="fas fa-edit"></i> 发帖
        </button>
      </div>
    </div>
    
    <!-- 筛选和排序 -->
    <div class="forum-controls" v-if="showControls">
      <div class="sort-options">
        <button 
          v-for="option in sortOptions" 
          :key="option.value"
          :class="{ active: sortBy === option.value }"
          @click="changeSort(option.value)"
        >
          <i :class="option.icon"></i> {{ option.label }}
        </button>
      </div>
      <div class="filter-categories">
        <button 
          v-for="category in forumCategories" 
          :key="category.value"
          :class="{ active: activeCategory === category.value }"
          @click="filterByCategory(category.value)"
        >
          {{ category.label }}
        </button>
        <button 
          :class="{ active: activeCategory === 'all' }"
          @click="filterByCategory('all')"
        >
          全部
        </button>
      </div>
    </div>
    
    <!-- 帖子列表 -->
    <div class="posts-list">
      <div 
        v-for="post in posts" 
        :key="post.post_id" 
        class="post-item"
        @click="viewPost(post)"
      >
        <div class="post-content">
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
              <span class="stat-item" @click.stop="togglePostLike(post)">
                <i :class="post.is_liked ? 'fas fa-heart' : 'far fa-heart'" 
                   :style="{ color: post.is_liked ? '#e74c3c' : '' }"></i>
                {{ post.like_count }}
              </span>
              <span class="stat-item">
                <i class="far fa-comment"></i>
                {{ post.comment_count }}
              </span>
              <span class="stat-item">
                <i class="far fa-eye"></i>
                {{ post.view_count }}
              </span>
              <span class="post-time">{{ post.timeAgo }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="skeleton-item" v-for="n in 3" :key="n"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && posts.length === 0" class="empty-state">
        <i class="fas fa-comments"></i>
        <p>暂无帖子</p>
        <button class="btn-post-first" v-if="authStore.isAuthenticated" @click="goToFullEditor">
          <i class="fas fa-plus"></i> 发布第一个帖子
        </button>
      </div>
    </div>
    
    <!-- 帖子详情弹窗 -->
    <div v-if="selectedPost" class="post-modal" @click.self="closePostModal">
      <div class="post-modal-content">
        <div class="modal-header">
          <h3>{{ selectedPost.title }}</h3>
          <button class="modal-close" @click="closePostModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 帖子内容 -->
          <div class="post-detail">
            <div class="post-author-info">
              <img :src="selectedPost.author.avatar_url" :alt="selectedPost.author.name" class="author-avatar-lg">
              <div class="author-details">
                <div class="author-name">{{ selectedPost.author.name }}</div>
                <div class="post-time">{{ formatDateTime(selectedPost.created_at) }}</div>
              </div>
              <div class="post-category-badge">{{ selectedPost.category }}</div>
            </div>
            <div class="post-full-content">
              {{ selectedPost.content }}
            </div>
            <div class="post-actions-bar">
              <button class="btn-like" @click="togglePostLike(selectedPost)">
                <i :class="selectedPost.is_liked ? 'fas fa-heart' : 'far fa-heart'" 
                   :style="{ color: selectedPost.is_liked ? '#e74c3c' : '' }"></i>
                <span>{{ selectedPost.like_count }}</span>
              </button>
              <button class="btn-comment" @click="focusCommentInput">
                <i class="far fa-comment"></i>
                <span>评论</span>
              </button>
              <button class="btn-share">
                <i class="fas fa-share"></i>
                <span>分享</span>
              </button>
            </div>
          </div>
          
          <!-- 评论区域 -->
          <div class="comments-section">
            <h4><i class="fas fa-comments"></i> 评论（{{ selectedPost.comment_count }}）</h4>
            
            <!-- 发表评论 -->
            <div class="comment-input" v-if="authStore.isAuthenticated">
              <img :src="userAvatar" alt="用户头像" class="user-avatar-sm" />
              <div class="input-wrapper">
                <textarea 
                  ref="commentInput"
                  v-model="newComment" 
                  placeholder="写下你的评论..."
                  rows="2"
                  @keydown.ctrl.enter="submitComment"
                ></textarea>
                <div class="comment-actions">
                  <button class="btn-cancel" @click="clearComment">取消</button>
                  <button class="btn-submit-comment" @click="submitComment" :disabled="!newComment.trim()">
                    评论
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="login-prompt">
              <p>登录后即可发表评论</p>
              <button class="btn-login" @click="emit('needLogin')">
                <i class="fas fa-sign-in-alt"></i> 立即登录
              </button>
            </div>
            
            <!-- 评论列表 -->
            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.comment_id" class="comment-item">
                <div class="comment-header">
                  <img :src="comment.author.avatar_url" :alt="comment.author.name" class="comment-author-avatar">
                  <div class="comment-author-info">
                    <div class="comment-author-name">{{ comment.author.name }}</div>
                    <div class="comment-time">{{ formatTimeAgo(comment.created_at) }}</div>
                  </div>
                </div>
                <div class="comment-content">
                  {{ comment.content }}
                </div>
                <div class="comment-actions">
                  <button class="btn-reply" @click="replyToComment(comment)">
                    <i class="far fa-comment-dots"></i> 回复
                  </button>
                  <button class="btn-like-comment" @click="toggleCommentLike(comment)">
                    <i :class="comment.is_liked ? 'fas fa-heart' : 'far fa-heart'"></i>
                    {{ comment.like_count }}
                  </button>
                </div>
                
                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                  <div v-for="reply in comment.replies" :key="reply.comment_id" class="reply-item">
                    <div class="reply-header">
                      <img :src="reply.author.avatar_url" :alt="reply.author.name" class="reply-author-avatar">
                      <div class="reply-author-info">
                        <div class="reply-author-name">{{ reply.author.name }}</div>
                        <div class="reply-time">{{ formatTimeAgo(reply.created_at) }}</div>
                      </div>
                    </div>
                    <div class="reply-content">
                      {{ reply.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 加载更多评论 -->
            <div v-if="hasMoreComments" class="load-more-comments">
              <button class="btn-load-more" @click="loadMoreComments">
                <i class="fas fa-arrow-down"></i> 加载更多评论
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 组件属性
const props = defineProps({
  showQuickPost: {
    type: Boolean,
    default: true
  },
  showControls: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: null
  }
})

// 响应式数据
const posts = ref([])
const comments = ref([])
const loading = ref(false)
const sortBy = ref('created_at')
const activeCategory = ref('all')
const selectedPost = ref(null)
const showPostModal = ref(false)
const newComment = ref('')
const replyingTo = ref(null)
const loadingComments = ref(false)
const currentCommentPage = ref(1)
const hasMoreComments = ref(true)
const quickPostContent = ref('')
const error = ref(null)

// 模拟数据（后期替换为API调用）
const mockData = {
  posts: [
    { 
      post_id: 1, 
      title: "寻找一起学习的小伙伴", 
      content: "有没有同学想一起准备期末考试？我们可以组织学习小组，互相督促，共同进步。主要复习数据结构和高数两门课程。",
      content_preview: "有没有同学想一起准备期末考试？我们可以组织学习小组，互相督促，共同进步。主要复习数据结构和高数两门课程。",
      author: { 
        user_id: 2, 
        name: "李四", 
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=李四" 
      }, 
      category: "学习交流", 
      like_count: 15, 
      view_count: 120, 
      comment_count: 8, 
      created_at: "2024-03-10T14:30:00Z",
      updated_at: "2024-03-10T14:30:00Z",
      is_liked: false
    },
    { 
      post_id: 2, 
      title: "转让二手教材", 
      content: "计算机组成原理教材，九成新，原价65元，现在30元转让。教材保存完好，无笔记。",
      content_preview: "计算机组成原理教材，九成新，原价65元，现在30元转让。教材保存完好，无笔记。",
      author: { 
        user_id: 3, 
        name: "王五", 
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=王五" 
      }, 
      category: "闲置交易", 
      like_count: 5, 
      view_count: 80, 
      comment_count: 3, 
      created_at: "2024-03-09T10:15:00Z",
      updated_at: "2024-03-09T10:15:00Z",
      is_liked: true
    },
    { 
      post_id: 3, 
      title: "校园篮球赛招募队员", 
      content: "本周五下午校园篮球赛，现招募队员3名。要求有一定篮球基础，有团队合作精神。",
      content_preview: "本周五下午校园篮球赛，现招募队员3名。要求有一定篮球基础，有团队合作精神。",
      author: { 
        user_id: 4, 
        name: "赵六", 
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=赵六" 
      }, 
      category: "校园活动", 
      like_count: 12, 
      view_count: 95, 
      comment_count: 5, 
      created_at: "2024-03-11T09:30:00Z",
      updated_at: "2024-03-11T09:30:00Z",
      is_liked: false
    }
  ],
  comments: [
    {
      comment_id: 1,
      content: "我也有这个想法，一起学习效率更高",
      author: { 
        user_id: 3, 
        name: "王五", 
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=王五" 
      },
      parent_id: null,
      like_count: 3,
      is_liked: false,
      created_at: "2024-03-10T15:00:00Z",
      replies: [
        {
          comment_id: 2,
          content: "我们可以定个时间地点",
          author: { 
            user_id: 2, 
            name: "李四", 
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=李四" 
          },
          parent_id: 1,
          like_count: 1,
          is_liked: false,
          created_at: "2024-03-10T15:10:00Z"
        }
      ]
    }
  ]
}

// 排序选项
const sortOptions = ref([
  { label: '最新发布', value: 'created_at', icon: 'fas fa-clock' },
  { label: '最多点赞', value: 'like_count', icon: 'fas fa-heart' },
  { label: '最多评论', value: 'comment_count', icon: 'fas fa-comment' }
])

// 论坛分类
const forumCategories = ref([
  { label: '学习交流', value: '学习交流' },
  { label: '校园活动', value: '校园活动' },
  { label: '闲置交易', value: '闲置交易' },
  { label: '问题求助', value: '问题求助' }
])

// 计算属性
const userAvatar = computed(() => {
  return authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
})

const filteredPosts = computed(() => {
  let filtered = [...posts.value]
  
  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(post => post.category === activeCategory.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    if (sortBy.value === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy.value === 'like_count') {
      return b.like_count - a.like_count
    } else if (sortBy.value === 'comment_count') {
      return b.comment_count - a.comment_count
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
  error.value = null
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const params = {
      sort_by: sortBy.value,
      order: 'desc',
      category: activeCategory.value === 'all' ? null : activeCategory.value,
      pageSize: props.limit || 20
    }
    
    const response = await fetchPostsAPI(params)
    
    if (response.success) {
      posts.value = response.data.posts.map(post => ({
        ...post,
        timeAgo: formatTimeAgo(post.created_at)
      }))
    } else {
      error.value = response.error
      // 加载失败时使用模拟数据
      posts.value = mockData.posts.map(post => ({
        ...post,
        timeAgo: formatTimeAgo(post.created_at)
      }))
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟加载延迟
    setTimeout(() => {
      posts.value = mockData.posts.map(post => ({
        ...post,
        timeAgo: formatTimeAgo(post.created_at),
        content_preview: truncateText(post.content, 100)
      }))
      loading.value = false
    }, 500)
    
  } catch (err) {
    console.error('加载帖子失败:', err)
    error.value = '加载失败，请稍后重试'
    posts.value = mockData.posts.map(post => ({
      ...post,
      timeAgo: formatTimeAgo(post.created_at)
    }))
    loading.value = false
  }
}

const loadComments = async (postId) => {
  loadingComments.value = true
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const params = {
      page: currentCommentPage.value,
      pageSize: 10
    }
    
    const response = await fetchCommentsAPI(postId, params)
    
    if (response.success) {
      comments.value = response.data.comments.map(comment => ({
        ...comment,
        timeAgo: formatTimeAgo(comment.created_at)
      }))
      hasMoreComments.value = response.data.pagination?.totalPages > currentCommentPage.value
    } else {
      error.value = response.error
      // 加载失败时使用模拟数据
      comments.value = mockData.comments.map(comment => ({
        ...comment,
        timeAgo: formatTimeAgo(comment.created_at)
      }))
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟加载
    setTimeout(() => {
      comments.value = mockData.comments.map(comment => ({
        ...comment,
        timeAgo: formatTimeAgo(comment.created_at)
      }))
      loadingComments.value = false
    }, 300)
    
  } catch (err) {
    console.error('加载评论失败:', err)
    comments.value = []
    loadingComments.value = false
  }
}

const viewPost = (post) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  selectedPost.value = post
  showPostModal.value = true
  currentCommentPage.value = 1
  loadComments(post.post_id)
  
  // 模拟增加浏览数
  post.view_count++
}

const closePostModal = () => {
  showPostModal.value = false
  selectedPost.value = null
  comments.value = []
  newComment.value = ''
  replyingTo.value = null
}

const changeSort = (sortValue) => {
  sortBy.value = sortValue
  loadPosts()
}

const filterByCategory = (category) => {
  activeCategory.value = category
  loadPosts()
}

const togglePostLike = async (post) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  const originalLiked = post.is_liked
  const originalCount = post.like_count
  
  // 立即更新UI
  post.is_liked = !post.is_liked
  post.like_count += post.is_liked ? 1 : -1
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const response = await togglePostLikeAPI(post.post_id)
    
    if (!response.success) {
      // 恢复原始状态
      post.is_liked = originalLiked
      post.like_count = originalCount
      alert('操作失败，请稍后重试')
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟API调用
    setTimeout(() => {
      // 操作成功，无需处理
    }, 300)
    
  } catch (err) {
    console.error('点赞操作失败:', err)
    // 恢复原始状态
    post.is_liked = originalLiked
    post.like_count = originalCount
    alert('操作失败，请稍后重试')
  }
}

const toggleCommentLike = (comment) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  comment.is_liked = !comment.is_liked
  comment.like_count += comment.is_liked ? 1 : -1
  
  // ========== API调用区域开始 ==========
  /*
  // 实际应该调用API
  toggleCommentLikeAPI(comment.comment_id)
  */
  // ========== API调用区域结束 ==========
}

const submitComment = async () => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  const content = newComment.value.trim()
  if (!content) return
  
  const commentData = {
    content,
    parent_id: replyingTo.value?.comment_id || null
  }
  
  // 立即在UI中添加评论
  const newCommentObj = {
    comment_id: Date.now(), // 临时ID
    content,
    author: {
      user_id: authStore.user?.user_id,
      name: authStore.user?.name || '当前用户',
      avatar_url: userAvatar.value
    },
    parent_id: replyingTo.value?.comment_id || null,
    like_count: 0,
    is_liked: false,
    created_at: new Date().toISOString(),
    timeAgo: '刚刚',
    replies: []
  }
  
  if (replyingTo.value) {
    // 如果是回复，添加到对应评论的回复中
    const parentComment = comments.value.find(c => c.comment_id === replyingTo.value.comment_id)
    if (parentComment) {
      if (!parentComment.replies) parentComment.replies = []
      parentComment.replies.push(newCommentObj)
    }
  } else {
    // 如果是新评论，添加到评论列表
    comments.value.unshift(newCommentObj)
  }
  
  // 更新帖子评论数
  if (selectedPost.value) {
    selectedPost.value.comment_count++
  }
  
  try {
    // ========== API调用区域开始 ==========
    /*
    // 实际API调用代码（注释状态）
    const response = await createCommentAPI(
      selectedPost.value.post_id,
      commentData
    )
    
    if (response.success) {
      // 用真实数据替换临时评论
      const realCommentIndex = comments.value.findIndex(c => c.comment_id === newCommentObj.comment_id)
      if (realCommentIndex !== -1) {
        comments.value[realCommentIndex] = {
          ...response.data,
          timeAgo: '刚刚'
        }
      }
    } else {
      // 移除临时评论
      const tempCommentIndex = comments.value.findIndex(c => c.comment_id === newCommentObj.comment_id)
      if (tempCommentIndex !== -1) {
        comments.value.splice(tempCommentIndex, 1)
      }
      if (selectedPost.value) {
        selectedPost.value.comment_count--
      }
      alert('评论失败，请稍后重试')
    }
    */
    // ========== API调用区域结束 ==========
    
    // 模拟API调用成功
    setTimeout(() => {
      // 成功，无需处理
    }, 300)
    
  } catch (err) {
    console.error('发表评论失败:', err)
    // 移除临时评论
    const tempCommentIndex = comments.value.findIndex(c => c.comment_id === newCommentObj.comment_id)
    if (tempCommentIndex !== -1) {
      comments.value.splice(tempCommentIndex, 1)
    }
    if (selectedPost.value) {
      selectedPost.value.comment_count--
    }
    alert('评论失败，请稍后重试')
  }
  
  clearComment()
}

const replyToComment = (comment) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  replyingTo.value = comment
  newComment.value = `@${comment.author.name} `
  focusCommentInput()
}

const clearComment = () => {
  newComment.value = ''
  replyingTo.value = null
}

const loadMoreComments = () => {
  if (!hasMoreComments.value || !selectedPost.value) return
  
  currentCommentPage.value++
  loadComments(selectedPost.value.post_id)
}

const goToFullEditor = () => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  

}

const focusCommentInput = () => {
  commentInput.value?.focus()
}

// 辅助函数
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

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

// 引用
const commentInput = ref(null)

// 事件发射
const emit = defineEmits(['needLogin'])
</script>

<style scoped>
/* 基本样式（与前两个模块相似，以下为主要差异样式） */

/* 快速发帖区域 */
.quick-post {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.post-input {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.user-avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.input-wrapper {
  flex: 1;
}

.post-input input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s;
  background-color: #f8f9fa;
}

.post-input input:focus {
  outline: none;
  border-color: #3498db;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.post-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-post {
  padding: 8px 20px;
  background-color: #FF9800;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.btn-post:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
}

/* 论坛控制区域 */
.forum-controls {
  margin-bottom: 20px;
}

.sort-options {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.sort-options button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.sort-options button:hover {
  border-color: #3498db;
  color: #3498db;
}

.sort-options button.active {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
}

.filter-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-categories button {
  padding: 5px 10px;
  border: 1px solid #eee;
  border-radius: 15px;
  background-color: #f8f9fa;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-categories button:hover {
  background-color: #e9ecef;
}

.filter-categories button.active {
  background-color: #FF9800;
  border-color: #FF9800;
  color: white;
}

/* 帖子列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.post-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #FF9800;
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
  font-size: 1.05rem;
}

.post-category {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 10px;
  background-color: #fff3e0;
  color: #ef6c00;
  font-weight: 500;
}

.post-preview {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 15px;
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
  align-items: center;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.3s;
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-item:hover {
  background-color: #f5f5f5;
}

.stat-item .fa-heart:hover {
  color: #e74c3c !important;
}

.post-time {
  color: #888;
  font-size: 0.8rem;
}

/* 帖子详情弹窗 */
.post-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.post-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #888;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 25px;
}

/* 帖子详情内容 */
.post-detail {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.post-author-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.author-avatar-lg {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  flex: 1;
}

.author-details .author-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.author-details .post-time {
  color: #888;
  font-size: 0.85rem;
}

.post-category-badge {
  padding: 4px 10px;
  background-color: #fff3e0;
  color: #ef6c00;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.post-full-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.post-actions-bar {
  display: flex;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.btn-like, .btn-comment, .btn-share {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}

.btn-like:hover, .btn-comment:hover, .btn-share:hover {
  background-color: #f5f5f5;
}

.btn-like.active {
  color: #e74c3c;
}

/* 评论区域 */
.comments-section h4 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-input {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
}

.comment-input .input-wrapper {
  flex: 1;
}

.comment-input textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-cancel, .btn-submit-comment {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-submit-comment {
  background-color: #3498db;
  color: white;
}

.btn-submit-comment:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-submit-comment:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 25px;
}

.login-prompt p {
  color: #666;
  margin-bottom: 15px;
}

.btn-login {
  padding: 8px 20px;
  background-color: #FF9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-login:hover {
  background-color: #f57c00;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-author-info {
  flex: 1;
}

.comment-author-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.comment-time {
  color: #888;
  font-size: 0.8rem;
}

.comment-content {
  color: #333;
  line-height: 1.5;
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.btn-reply, .btn-like-comment {
  background: none;
  border: none;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-reply:hover, .btn-like-comment:hover {
  background-color: #e9ecef;
}

/* 回复列表 */
.replies-list {
  margin-left: 42px; /* 32px头像 + 10px间距 */
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.reply-item {
  margin-bottom: 15px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.reply-author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.reply-author-info {
  flex: 1;
}

.reply-author-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.reply-time {
  color: #888;
  font-size: 0.75rem;
}

.reply-content {
  color: #333;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-left: 34px; /* 24px头像 + 10px间距 */
}

/* 加载更多评论 */
.load-more-comments {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-load-more {
  padding: 8px 20px;
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.btn-load-more:hover {
  background-color: #e9ecef;
  border-color: #3498db;
  color: #3498db;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 50px 20px;
}

.empty-state i {
  font-size: 3rem;
  color: #FF9800;
  margin-bottom: 15px;
  opacity: 0.7;
}

.empty-state p {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.btn-post-first {
  padding: 10px 20px;
  background-color: #FF9800;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-post-first:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 15px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .post-modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .post-author-info {
    flex-wrap: wrap;
  }
  
  .post-category-badge {
    order: 3;
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }
  
  .replies-list {
    margin-left: 20px;
  }
  
  .reply-content {
    margin-left: 0;
  }
}

@media (max-width: 576px) {
  .module-card {
    padding: 20px;
  }
  
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .module-more {
    align-self: flex-end;
  }
  
  .forum-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .sort-options, .filter-categories {
    justify-content: center;
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
  
  .comment-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .comment-input .user-avatar-sm {
    align-self: flex-start;
  }
}
</style>