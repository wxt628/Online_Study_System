<!-- FavoriteMiniPrograms.vue -->
<template>
  <section class="my-mini-section">
    <div class="section-header">
      <h2><i class="fas fa-star"></i> 我的小程序</h2>
      <button class="btn-edit" @click="openEditModal">
        <i class="fas fa-edit"></i> 编辑
      </button>
    </div>
    <div class="my-mini-grid">
      <div 
        v-for="program in favoritePrograms" 
        :key="program.program_id" 
        class="mini-card"
        @click="openMiniProgram(program)"
      >
        <div class="mini-icon" :style="{ backgroundColor: getIconColor(program.program_id) }">
          <i :class="program.icon_fa || 'fa-th-large'"></i>
        </div>
        <div class="mini-name">{{ program.name }}</div>
        <div class="mini-category">{{ program.category }}</div>
        <button 
          class="mini-favorite-btn favorite"
          @click.stop="toggleFavorite(program.program_id)"
        >
          <i class="fas fa-star"></i>
        </button>
      </div>
      
      <!-- 空状态 -->
      <div v-if="favoritePrograms.length === 0" class="empty-my-mini">
        <i class="fas fa-plus-circle"></i>
        <p>您还没有添加常用小程序</p>
        <p>点击下方小程序右上角的 <i class="fas fa-star"></i> 可以添加到我的小程序</p>
      </div>
    </div>
    
    <!-- 编辑模态框 -->
    <div v-if="showEditModal" class="modal show" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>编辑我的小程序</h2>
          <button class="modal-close" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="edit-mini-content">
            <p>长按拖动调整顺序，点击 <i class="fas fa-times"></i> 移除</p>
            <div class="edit-mini-list" ref="editList">
              <div 
                v-for="program in favoritePrograms" 
                :key="program.program_id" 
                class="edit-mini-item"
                :data-program-id="program.program_id"
              >
                <div class="edit-mini-icon" :style="{ backgroundColor: getIconColor(program.program_id) }">
                  <i :class="program.icon_fa || 'fa-th-large'"></i>
                </div>
                <div class="edit-mini-info">
                  <div class="edit-mini-name">{{ program.name }}</div>
                  <div class="edit-mini-category">{{ program.category }}</div>
                </div>
                <button class="edit-mini-remove" @click="removeFromFavorites(program.program_id)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="edit-mini-buttons">
              <button class="btn btn-primary" @click="saveEdit">保存</button>
              <button class="btn btn-secondary" @click="closeEditModal">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useMiniAppsStore } from '../../stores/miniApps'

const authStore = useAuthStore()
const miniAppsStore = useMiniAppsStore()
const showEditModal = ref(false)
const editListRef = ref(null)
let sortableInstance = null

// 组件属性
const props = defineProps({
  favoritePrograms: {
    type: Array,
    default: () => []
  }
})

// 方法
const getIconColor = (programId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
    '#118AB2', '#073B4C', '#EF476F', '#7209B7'
  ]
  return colors[programId % colors.length]
}

const openMiniProgram = (program) => {
  // 记录最近使用
  miniAppsStore.addRecentUse(program.program_id)
  emit('open-program', program)
}

const toggleFavorite = (programId) => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  // 调用store中的方法
  miniAppsStore.toggleFavorite(programId)
  
  emit('favorite-changed', programId)
}

const openEditModal = () => {
  if (!authStore.isAuthenticated) {
    emit('needLogin')
    return
  }
  
  showEditModal.value = true
  
  // 初始化拖拽排序
  nextTick(() => {
    if (editListRef.value && window.Sortable) {
      if (sortableInstance) {
        sortableInstance.destroy()
      }
      
      sortableInstance = new window.Sortable(editListRef.value, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: (evt) => {
          // 更新收藏顺序
          const newOrder = []
          const items = editListRef.value.querySelectorAll('.edit-mini-item')
          items.forEach(item => {
            newOrder.push(parseInt(item.dataset.programId))
          })
          
          miniAppsStore.userFavorites = newOrder
        }
      })
    }
  })
}

const closeEditModal = () => {
  showEditModal.value = false
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

const removeFromFavorites = (programId) => {
  miniAppsStore.toggleFavorite(programId)
}

const saveEdit = () => {
  // 保存到服务器（模拟）
  console.log('保存收藏列表:', miniAppsStore.userFavorites)
  
  closeEditModal()
  emit('save-favorites', miniAppsStore.userFavorites)
}

// 事件发射
const emit = defineEmits(['needLogin', 'open-program', 'favorite-changed', 'save-favorites'])
</script>

<style scoped>
.my-mini-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h2 i {
  color: #FFD700;
}

.btn-edit {
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-edit:hover {
  background-color: #eef5ff;
  border-color: #cce5ff;
}

.my-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 20px;
  background-color: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  min-height: 180px;
}

.mini-card {
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
  text-align: center;
  border: 1px solid #FFD700;
}

.mini-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.mini-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  color: white;
  font-size: 1.3rem;
}

.mini-name {
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.3;
}

.mini-category {
  font-size: 0.75rem;
  color: #888;
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.mini-favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #FFD700;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 10;
}

.empty-my-mini {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px;
  color: #aaa;
}

.empty-my-mini i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #ddd;
}

.empty-my-mini p {
  margin-bottom: 10px;
  font-size: 0.95rem;
}

/* 模态框样式 */
.modal {
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

.modal.show {
  display: flex;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #888;
  line-height: 1;
}

.modal-body {
  padding: 25px;
  overflow-y: auto;
}

.edit-mini-content {
  padding: 10px 0;
}

.edit-mini-list {
  margin: 20px 0;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.edit-mini-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: move;
  user-select: none;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.edit-mini-item:hover {
  border-color: #cce5ff;
  background-color: #f8faff;
}

.edit-mini-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.edit-mini-info {
  flex: 1;
}

.edit-mini-name {
  font-weight: 600;
  margin-bottom: 3px;
  color: #2c3e50;
}

.edit-mini-category {
  font-size: 0.8rem;
  color: #888;
}

.edit-mini-remove {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-mini-remove:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.edit-mini-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #43a047;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

@media (max-width: 768px) {
  .my-mini-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
  }
  
  .modal-content {
    max-width: 95%;
  }
}
</style>