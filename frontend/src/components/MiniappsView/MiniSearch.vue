<!-- MiniSearch.vue -->
<template>
  <div class="mini-search-section">
    <div class="search-container">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索小程序..."
          @input="handleSearchInput"
        />
        <button 
          v-if="searchKeyword" 
          class="clear-search-btn show"
          @click="clearSearch"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="filter-container">
      <div class="category-filter">
        <button 
          v-for="category in categories" 
          :key="category.value"
          class="category-btn"
          :class="{ active: activeCategory === category.value }"
          @click="filterByCategory(category.value)"
        >
          <i :class="category.icon"></i> {{ category.label }}
        </button>
        <button 
          class="category-btn"
          :class="{ active: activeCategory === 'all' }"
          @click="filterByCategory('all')"
        >
          <i class="fas fa-list"></i> 全部
        </button>
      </div>
      
      <div class="sort-filter">
        <select v-model="activeSort" @change="handleSortChange">
          <option value="display_order">默认排序</option>
          <option value="name">名称排序</option>
          <option value="recent">最近使用</option>
          <option value="popular">最受欢迎</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

// 响应式数据
const searchKeyword = ref('')
const activeCategory = ref('all')
const activeSort = ref('display_order')

// 分类选项
const categories = ref([
  { label: '教务', value: '教务', icon: 'fas fa-graduation-cap' },
  { label: '生活', value: '生活', icon: 'fas fa-home' },
  { label: '工具', value: '工具', icon: 'fas fa-tools' },
  { label: '健康', value: '健康', icon: 'fas fa-heartbeat' },
  { label: '娱乐', value: '娱乐', icon: 'fas fa-gamepad' }
])

// 事件发射
const emit = defineEmits(['search', 'filter-category', 'sort-change'])

// 搜索防抖计时器
let searchTimer = null

// 方法
const handleSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('search', searchKeyword.value)
  }, 300)
}

const clearSearch = () => {
  searchKeyword.value = ''
  emit('search', '')
}

const filterByCategory = (category) => {
  activeCategory.value = category
  emit('filter-category', category)
}

const handleSortChange = () => {
  emit('sort-change', activeSort.value)
}
</script>

<style scoped>
.mini-search-section {
  background-color: #f5f7fa;
  padding: 25px 0;
  border-bottom: 1px solid #eee;
}

.search-container {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 15px;
}

.search-box i {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 1.1rem;
}

.search-box input {
  width: 100%;
  padding: 15px 20px 15px 50px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
  display: none;
}

.clear-search-btn.show {
  display: block;
}

.clear-search-btn:hover {
  color: #666;
  background-color: #f0f0f0;
}

.search-tips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.9rem;
}

.search-tips span {
  color: #666;
}

.search-tag {
  padding: 5px 12px;
  background-color: #f0f2f5;
  color: #555;
  border-radius: 15px;
  text-decoration: none;
  transition: all 0.3s;
}

.search-tag:hover {
  background-color: #e0e7ff;
  color: #3498db;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.category-btn:hover {
  background-color: #eef5ff;
  border-color: #cce5ff;
}

.category-btn.active {
  background-color: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.sort-filter select {
  padding: 8px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: white;
  min-width: 120px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .category-filter {
    justify-content: center;
  }
}
</style>