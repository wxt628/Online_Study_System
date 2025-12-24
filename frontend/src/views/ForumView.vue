<template>
  <div class="forum-page">
    <div class="forum-header">
      <h1>校园论坛</h1>
      <button @click="showCreate = true">发帖</button>
    </div>

    <div class="post-list">
      <div
        class="post-card"
        v-for="post in posts"
        :key="post.id"
        @click="openPost(post)"
      >
        <h3>{{ post.title }}</h3>
        <p class="content">{{ post.content }}</p>
        <div class="meta">
          <span>{{ post.author }}</span>
          <span>👍 {{ post.likes }}</span>
        </div>
      </div>
    </div>

    <!-- 详情 -->
    <div class="mask" v-if="activePost" @click.self="activePost = null">
      <div class="dialog">
        <h2>{{ activePost.title }}</h2>
        <p>{{ activePost.content }}</p>

        <div class="meta">
          <span>{{ activePost.author }}</span>
          <button @click="activePost.likes++">
            👍 {{ activePost.likes }}
          </button>
        </div>

        <div class="comments">
          <div class="comment" v-for="c in activePost.comments" :key="c.id">
            {{ c.text }} —— {{ c.author }}
          </div>
        </div>

        <div class="add-comment">
          <input v-model="newComment" placeholder="写评论…" />
          <button @click="addComment">发送</button>
        </div>
      </div>
    </div>

    <!-- 发帖 -->
    <div class="mask" v-if="showCreate" @click.self="showCreate = false">
      <div class="dialog">
        <h2>发布新帖</h2>
        <input v-model="newPost.title" placeholder="标题" />
        <textarea v-model="newPost.content" placeholder="内容"></textarea>
        <div class="actions">
          <button @click="showCreate = false">取消</button>
          <button @click="createPost">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const posts = ref([
  {
    id: 1,
    title: '期末复习经验',
    content: '一起讨论怎么复习。',
    author: 'Alice',
    likes: 3,
    comments: []
  }
])

const activePost = ref(null)
const showCreate = ref(false)
const newComment = ref('')
const newPost = ref({ title: '', content: '' })

const openPost = p => {
  activePost.value = p
  newComment.value = ''
}

const addComment = () => {
  if (!newComment.value) return
  activePost.value.comments.push({
    id: Date.now(),
    text: newComment.value,
    author: '我'
  })
  newComment.value = ''
}

const createPost = () => {
  if (!newPost.value.title || !newPost.value.content) return
  posts.value.unshift({
    id: Date.now(),
    title: newPost.value.title,
    content: newPost.value.content,
    author: '我',
    likes: 0,
    comments: []
  })
  showCreate.value = false
  newPost.value = { title: '', content: '' }
}
</script>

<style scoped>
.forum-page {
  background: #f1f5f9;
  min-height: 100vh;
  padding: 20px;
}

.forum-header {
  max-width: 800px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-list {
  max-width: 800px;
  margin: 20px auto;
}

.post-card {
  background: #fff;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
}

.post-card:hover {
  transform: translateY(-2px);
}

.meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  background: #fff;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  border-radius: 10px;
}

input, textarea {
  width: 100%;
  margin: 8px 0;
  padding: 8px;
}

.comment {
  background: #f8fafc;
  padding: 6px;
  border-radius: 6px;
  margin-top: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
