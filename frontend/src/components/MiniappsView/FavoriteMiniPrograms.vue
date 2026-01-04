<template>
  <section class="my-mini-section">
    <div class="section-header">
      <h2><el-icon><StarFilled /></el-icon> 我的小程序</h2>
      <el-button v-if="favoritePrograms.length > 0" type="primary" link @click="openEditModal">
        <el-icon><Edit /></el-icon> 编辑
      </el-button>
    </div>
    
    <el-row :gutter="20">
      <el-col 
        v-for="program in favoritePrograms" 
        :key="program.program_id" 
        :xs="12" :sm="8" :md="6" :lg="4"
        class="mb-20"
      >
        <div 
          class="mini-card-small" 
          @click="openMiniProgram(program)"
        >
          <div class="card-bg-decoration"></div>
          <div class="mini-content-small">
            <div class="mini-icon-small" :class="getCategoryClass(program.category)">
              <el-icon :size="24" color="#fff">
                <component :is="getProgramIcon(program.name)" />
              </el-icon>
            </div>
            <div class="mini-name-small">{{ program.name }}</div>
          </div>
        </div>
      </el-col>
      
      <!-- 空状态 -->
      <el-col :span="24" v-if="favoritePrograms.length === 0">
        <el-empty description="您还没有添加常用小程序">
          <template #extra>
            <p>点击下方小程序右上角的 <el-icon><Star /></el-icon> 可以添加到我的小程序</p>
          </template>
        </el-empty>
      </el-col>
    </el-row>
    
    <!-- 编辑模态框 -->
    <el-dialog
      v-model="showEditModal"
      title="编辑我的小程序"
      width="500px"
      destroy-on-close
    >
      <div class="edit-mini-content">
        <el-alert
          title="长按拖动调整顺序，点击 x 移除"
          type="info"
          show-icon
          :closable="false"
          class="mb-20"
        />
        <div class="edit-mini-list" ref="editListRef">
          <div 
            v-for="program in favoritePrograms" 
            :key="program.program_id" 
            class="edit-mini-item"
            :data-program-id="program.program_id"
          >
            <div class="edit-mini-icon" :class="getCategoryClass(program.category)">
              <el-icon :size="20" color="#fff">
                <component :is="getProgramIcon(program.name)" />
              </el-icon>
            </div>
            <div class="edit-mini-info">
              <div class="edit-mini-name">{{ program.name }}</div>
              <div class="edit-mini-category">{{ program.category }}</div>
            </div>
            <el-button 
              type="danger" 
              circle 
              size="small" 
              @click="removeFromFavorites(program.program_id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEditModal">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <ModalShow v-model="currentProgram" />
  </section>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { 
  StarFilled, Star, Edit, Close,
  Calendar, TrendCharts, Reading, CreditCard, 
  Flag, Search, Van, Tools, FirstAidKit, 
  Message, MapLocation, Timer, Grid,
  House, Lightning
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { useMiniAppsStore } from '../../stores/miniApps'
import ModalShow from '../common/ModalShow.vue'
import Sortable from 'sortablejs'

const authStore = useAuthStore()
const miniAppsStore = useMiniAppsStore()
const showEditModal = ref(false)
const editListRef = ref(null)
let sortableInstance = null
const currentProgram = ref(null)

// 组件属性
const props = defineProps({
  favoritePrograms: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['need-login', 'open-program', 'save-favorites'])

// 方法
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

const getProgramIcon = (name) => {
  if (name.includes('课表')) return Calendar
  if (name.includes('成绩')) return TrendCharts
  if (name.includes('图书')) return Reading
  if (name.includes('一卡通')) return CreditCard
  if (name.includes('失物')) return Search
  if (name.includes('教室')) return House
  
  const icons = {
    '校园一卡通': CreditCard,
    '图书馆查询': Reading,
    '课表查询': Calendar,
    '电费缴纳': Lightning,
    '成绩查询': TrendCharts,
    '失物招领': Search,
    '校园网充值': CreditCard,
    '教室预约': House
  }
  return icons[name] || Grid
}

const openMiniProgram = (program) => {
  currentProgram.value = program
  emit('open-program', program)
}

const openEditModal = async () => {
  showEditModal.value = true
  await nextTick()
  initSortable()
}

const closeEditModal = () => {
  showEditModal.value = false
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

const initSortable = () => {
  if (!editListRef.value) return
  
  sortableInstance = new Sortable(editListRef.value, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: (evt) => {
      // 拖拽结束后的处理，这里不需要立即更新数据，等待保存按钮
    }
  })
}

const removeFromFavorites = (programId) => {
  // 在模态框中移除，实际上是移除store中的收藏
  miniAppsStore.toggleFavorite(programId)
}

const saveEdit = () => {
  // 获取排序后的ID列表
  if (!editListRef.value) return
  
  const items = editListRef.value.querySelectorAll('.edit-mini-item')
  const newOrder = Array.from(items).map(item => parseInt(item.dataset.programId))
  
  // 更新store中的顺序（如果有这个功能的话，或者只是保存）
  // 这里假设我们只是保存当前的收藏列表
  emit('save-favorites', newOrder)
  closeEditModal()
}
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
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.mb-20 {
  margin-bottom: 20px;
}

.mini-card-small {
  position: relative;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.mini-card-small:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  border-color: rgba(118, 75, 162, 0.1);
}

.card-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(180deg, rgba(245, 247, 250, 0.8) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 0;
}

.mini-content-small {
  position: relative;
  z-index: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mini-icon-small {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.mini-card-small:hover .mini-icon-small {
  transform: scale(1.1) rotate(-5deg);
}

.mini-name-small {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 颜色分类系统 */
.cat-edu { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 6px 15px rgba(79, 172, 254, 0.25); }
.cat-life { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); box-shadow: 0 6px 15px rgba(67, 233, 123, 0.25); }
.cat-tool { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 6px 15px rgba(118, 75, 162, 0.25); }
.cat-health { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); box-shadow: 0 6px 15px rgba(255, 154, 158, 0.25); }
.cat-ent { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); box-shadow: 0 6px 15px rgba(252, 182, 159, 0.25); }
.cat-other { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); box-shadow: 0 6px 15px rgba(161, 140, 209, 0.25); }

/* Edit List Styles */
.edit-mini-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding: 5px;
}

.edit-mini-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.2s;
}

.edit-mini-item:active {
  cursor: grabbing;
}

.edit-mini-item:hover {
  background-color: #f9f9f9;
  border-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.edit-mini-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.edit-mini-info {
  flex: 1;
}

.edit-mini-name {
  font-weight: 600;
  color: #333;
}

.edit-mini-category {
  font-size: 0.8rem;
  color: #888;
}

.sortable-ghost {
  opacity: 0.5;
  background-color: #e0e7ff;
}
</style>
