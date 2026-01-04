<template>
  <el-container class="homework-container">
    <el-main>
      <div class="page-header mb-20">
        <h1 class="page-title">
          <el-icon class="mr-2"><List /></el-icon> 
          作业平台
        </h1>
        <p class="page-subtitle">查看课程作业、提交作业、下载附件</p>
      </div>
      
      <HomeworkModule :showControls="true" :showAll="true" />
    </el-main>
  </el-container>
</template>

<script setup>
import HomeworkModule from '../components/HomeView/HomeworkModule.vue'
import { List } from '@element-plus/icons-vue'
</script>

<style scoped>
.homework-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
}

.page-header {
  padding: 0 10px;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 24px;
  margin: 0 0 6px 0;
  color: #303133;
}

.page-subtitle {
  color: #909399;
  margin-bottom: 16px;
  font-size: 14px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
