<template>
  <div class="preview-page">
    <div class="preview-header">
      <h1>{{ dashboardData?.name || '预览' }}</h1>
      <div class="preview-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="success" @click="enterFullscreen">
          <el-icon><FullScreen /></el-icon>
          全屏
        </el-button>
      </div>
    </div>
    
    <div class="preview-content" ref="previewContent">
      <!-- 这里将来会渲染实际的仪表盘内容 -->
      <div class="placeholder-content">
        <el-empty description="仪表盘预览功能开发中">
          <template #description>
            <div class="placeholder-text">
              <p>仪表盘 ID: {{ route.params.id }}</p>
              <p>预览功能正在开发中...</p>
            </div>
          </template>
        </el-empty>
      </div>
    </div>
    
    <div class="preview-footer">
      <div class="status-info">
        <span class="status-label">状态:</span>
        <el-tag :type="loading ? 'warning' : 'success'">
          {{ loading ? '加载中' : '已就绪' }}
        </el-tag>
      </div>
      <div class="last-updated" v-if="lastUpdated">
        最后更新: {{ formatTime(lastUpdated) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh, FullScreen } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const lastUpdated = ref<Date | null>(null)
const previewContent = ref<HTMLElement>()

// 模拟数据
const dashboardData = ref<any>(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    // 这里将来会调用 API 获取仪表盘数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    lastUpdated.value = new Date()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 全屏显示
const enterFullscreen = () => {
  const elem = previewContent.value
  if (!elem) return
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen()
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen()
  }
}

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 初始化
onMounted(() => {
  const id = route.params.id
  console.log('预览仪表盘 ID:', id)
  refreshData()
})
</script>

<style scoped lang="scss">
.preview-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.preview-header {
  background: #fff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }

  .preview-actions {
    display: flex;
    gap: 12px;
  }
}

.preview-content {
  flex: 1;
  padding: 24px;
  overflow: auto;

  .placeholder-content {
    background: #fff;
    border-radius: 12px;
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;

    .placeholder-text {
      text-align: center;
      color: #909399;
      
      p {
        margin: 8px 0;
      }
    }
  }
}

.preview-footer {
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e4e7ed;

  .status-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-label {
      color: #606266;
      font-size: 14px;
    }
  }

  .last-updated {
    color: #909399;
    font-size: 13px;
  }
}

// Fullscreen styles
:fullscreen .preview-content {
  background: #fff;
  padding: 40px;
}
</style>
