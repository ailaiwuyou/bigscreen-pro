<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <el-icon :size="80"><Warning /></el-icon>
      </div>
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-desc">
        抱歉，您访问的页面可能已被移除、删除或暂时不可用
      </p>
      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome">
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Warning } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
}

.error-content {
  text-align: center;
  padding: 40px;
}

.error-icon {
  color: var(--color-warning);
  margin-bottom: 24px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin: 0 0 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light-1) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.error-desc {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 22px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>