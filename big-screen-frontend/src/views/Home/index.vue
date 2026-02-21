<template>
  <div class="home-page">
    <h1>BigScreen Pro</h1>
    <p>企业级大屏可视化构建工具</p>
    <el-button type="primary" @click="goToDashboard">开始使用</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 40px;
  text-align: center;
}
h1 {
  font-size: 48px;
  margin-bottom: 20px;
}
</style>
