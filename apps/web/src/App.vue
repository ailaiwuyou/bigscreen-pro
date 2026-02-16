<template>
  <div id="designer-app" class="designer-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
/**
 * BigScreen Pro Designer - 设计器根组件
 */
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
})
</script>

<style lang="scss">
.designer-app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}
</style>
