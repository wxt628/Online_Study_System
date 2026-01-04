<template>
  <div class="mini-search-card">
    <div class="search-container">
      <el-input
        v-model="localSearchKeyword"
        placeholder="搜索小程序..."
        prefix-icon="Search"
        clearable
        @input="handleSearchInput"
        @clear="clearSearch"
        size="large"
        class="search-input"
      />
    </div>
    
    <div class="filter-container">
      <div class="category-filter">
        <el-radio-group v-model="localActiveCategory" @change="handleCategoryChange">
          <el-radio-button label="all">
            <el-icon><List /></el-icon> 全部
          </el-radio-button>
          <el-radio-button 
            v-for="category in categories" 
            :key="category.value" 
            :label="category.value"
          >
            <el-icon><component :is="category.iconComponent" /></el-icon> {{ category.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="sort-filter">
        <el-select v-model="localActiveSort" @change="handleSortChange" placeholder="排序方式" style="width: 140px">
          <el-option label="默认排序" value="display_order" />
          <el-option label="名称排序" value="name" />
          <el-option label="最近使用" value="recent" />
          <el-option label="最受欢迎" value="popular" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  List
} from '@element-plus/icons-vue'

// 定义 props
const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  activeCategory: {
    type: String,
    default: 'all'
  },
  activeSort: {
    type: String,
    default: 'display_order'
  }
})

// 响应式数据 - 使用本地副本，以便在组件内修改
const localSearchKeyword = ref(props.searchKeyword)
const localActiveCategory = ref(props.activeCategory)
const localActiveSort = ref(props.activeSort)

// 分类选项
const categories = ref([
  { label: '教务', value: '教务', iconComponent: 'School' },
  { label: '生活', value: '生活', iconComponent: 'House' },
  { label: '工具', value: '工具', iconComponent: 'Tools' },
  { label: '健康', value: '健康', iconComponent: 'FirstAidKit' },
  { label: '娱乐', value: '娱乐', iconComponent: 'VideoPlay' }
])

// 事件发射
const emit = defineEmits(['search', 'filter-category', 'sort-change'])

// 搜索防抖计时器
let searchTimer = null

// 方法
const handleSearchInput = (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('search', value)
  }, 300)
}

const clearSearch = () => {
  localSearchKeyword.value = ''
  emit('search', '')
}

const handleCategoryChange = (value) => {
  emit('filter-category', value)
}

const handleSortChange = (value) => {
  emit('sort-change', value)
}

// 监听 props 变化
watch(() => props.searchKeyword, (newVal) => {
  localSearchKeyword.value = newVal
})
watch(() => props.activeCategory, (newVal) => {
  localActiveCategory.value = newVal
})
watch(() => props.activeSort, (newVal) => {
  localActiveSort.value = newVal
})
</script>

<style scoped>
.mini-search-card {
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.search-container {
  margin-bottom: 24px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #e0e0e0;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.category-filter {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 5px; /* For scrollbar */
  -webkit-overflow-scrolling: touch;
}

.category-filter::-webkit-scrollbar {
  height: 4px;
}

.category-filter::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.category-filter :deep(.el-radio-group) {
  flex-wrap: nowrap;
  display: flex;
}

.sort-filter {
  min-width: 140px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .sort-filter {
    width: 100%;
  }
}
</style>
