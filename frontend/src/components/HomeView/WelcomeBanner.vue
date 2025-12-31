<script setup>
import { computed, ref, onMounted } from 'vue'
import api from '../../api/config'
import { getMiniProgram, getCourses, getCourseAssignments, getAssignmentSubmissions } from '../../api/interface'
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

const stats = ref({ ...props.stats })

const welcomeText = computed(() => {
  if (user.value) {
    return `欢迎回来，${user.value.name}同学`
  }
  return '欢迎使用校园综合平台'
})

// 获取小程序数量
const fetchMiniProgramsCount = async () => {
  try {
    const res = await getMiniProgram({})
    return Array.isArray(res.data) ? res.data.length : props.stats.miniPrograms
  } catch (e) {
    console.error('Failed to fetch mini programs count', e)
    return props.stats.miniPrograms
  }
}

// 获取帖子总数
const fetchPostsCount = async () => {
  try {
    const res = await api.post('/posts/search', { pageSize: 1 })
    return res.data?.data?.pagination?.total ?? props.stats.posts
  } catch (e) {
    console.error('Failed to fetch posts count', e)
    return props.stats.posts
  }
}

// 获取未提交且未过期的作业数量
const fetchAssignmentsCount = async () => {
  try {
    // 1. 获取所有课程
    const coursesRes = await getCourses()
    const courses = Array.isArray(coursesRes.data) ? coursesRes.data : []
    
    if (courses.length === 0) return 0

    // 2. 获取所有课程的作业
    const assignmentsRes = await Promise.all(
      courses.map(c => getCourseAssignments(c.course_id).catch(() => ({ data: [] })))
    )
    
    const allAssignments = assignmentsRes.flatMap(r => Array.isArray(r.data) ? r.data : [])
    
    if (allAssignments.length === 0) return 0

    // 3. 获取作业提交状态
    const submissionPromises = allAssignments.map(a => 
      getAssignmentSubmissions(a.assignment_id).catch(() => ({ data: [] }))
    )
    const submissionsRes = await Promise.all(submissionPromises)
    
    let count = 0
    const now = new Date()
    
    allAssignments.forEach((assignment, idx) => {
      const submissions = Array.isArray(submissionsRes[idx].data) ? submissionsRes[idx].data : []
      const isSubmitted = submissions.length > 0
      const deadline = new Date(assignment.deadline)
      
      // 未提交且截止日期在当前时间之后
      if (!isSubmitted && deadline > now) {
        count++
      }
    })
    
    return count
  } catch (e) {
    console.error('Failed to fetch assignments count', e)
    return props.stats.assignments
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) return

  const [miniProgramsCount, postsCount, assignmentsCount] = await Promise.all([
    fetchMiniProgramsCount(),
    fetchPostsCount(),
    fetchAssignmentsCount()
  ])

  stats.value = {
    miniPrograms: miniProgramsCount,
    assignments: assignmentsCount,
    posts: postsCount
  }
})
</script>

<template>
  <div class="welcome-banner">
    <div class="welcome-content">
      <h1>{{ welcomeText }}</h1>
      <p>{{ welcomeDescription }}</p>
      
      <div class="welcome-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.miniPrograms }}</span>
          <span class="stat-label">小程序</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.assignments }}</span>
          <span class="stat-label">待办作业</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.posts }}</span>
          <span class="stat-label">社区动态</span>
        </div>
      </div>
    </div>
    
    <div class="welcome-image">
      <img src="../../assets/welcome-illustration.svg" alt="Welcome" />
    </div>
  </div>
</template>

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
  flex-direction: column;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.welcome-image img {
  max-width: 300px;
  height: auto;
}

@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-stats {
    justify-content: center;
  }
  
  .welcome-image {
    margin-top: 20px;
  }
}
</style>
