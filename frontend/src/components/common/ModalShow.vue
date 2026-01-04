<template>
  <!-- 小程序详情弹窗 -->
  <el-dialog
    v-model="internalVisible"
    :title="localData?.name"
    width="500px"
    destroy-on-close
    center
    align-center
    append-to-body
    @closed="handleClosed"
  >
    <div v-if="localData" class="modal-body">
      <div class="program-detail">
        <div class="program-icon-large" :style="{ backgroundColor: getCategoryColor(localData.category) }">
          <el-icon :size="40" color="#fff">
            <component :is="getProgramIcon(localData.name)" />
          </el-icon>
        </div>
        <div class="program-info">
          <div class="info-row">
            <span class="label">分类：</span>
            <span class="value">{{ localData.category }}</span>
          </div>
          <div class="info-row">
            <span class="label">描述：</span>
            <span class="value">{{ localData.description }}</span>
          </div>
          <div class="info-row">
            <span class="label">更新时间：</span>
            <span class="value">{{ formatDate(localData.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="modal-actions">
        <el-button @click="internalVisible = false">关闭</el-button>
        <el-button type="primary" @click="launchProgram(localData)">
          <el-icon class="el-icon--left"><TopRight /></el-icon>立即使用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Menu, CreditCard, Reading, Calendar, 
  Lightning, TrendCharts, House, TopRight, Search
} from '@element-plus/icons-vue'

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const internalVisible = ref(false)
const localData = ref(null)

watch(() => props.modelValue, (val) => {
  if (val) {
    localData.value = val
    internalVisible.value = true
  } else {
    internalVisible.value = false
  }
})

const handleClosed = () => {
  emit('update:modelValue', null)
}

// 方法
const getCategoryColor = (category) => {
  const colors = {
    '教务': '#409EFF',
    '生活': '#67C23A',
    '工具': '#909399',
    '其他': '#E6A23C'
  }
  return colors[category] || colors['其他']
}

const getProgramIcon = (name) => {
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
  return icons[name] || Menu
}

const launchProgram = (program) => {
  const url = program && program.url
  if (!url) {
    ElMessage.error('未配置链接')
    return
  }
  try {
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (e) {
    location.href = url
  }
  internalVisible.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.program-detail {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 10px;
}

.program-icon-large {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.program-info {
  flex: 1;
}

.info-row {
  margin-bottom: 12px;
  display: flex;
  line-height: 1.5;
}

.info-row .label {
  font-weight: 500;
  color: #606266;
  min-width: 70px;
}

.info-row .value {
  color: #303133;
  flex: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .program-detail {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .info-row {
    flex-direction: column;
    text-align: center;
  }
}
</style>
