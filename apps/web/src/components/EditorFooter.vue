<template>
  <footer class="editor-footer">
    <div class="footer-left">
      <span class="zoom-label">缩放: {{ zoom }}%</span>
    </div>
    <div class="footer-center">
      <span class="status">{{ status }}</span>
    </div>
    <div class="footer-right">
      <span class="component-count">组件数: {{ componentCount }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  zoom: number;
  status: string;
  componentCount: number;
}>();
</script>

<style scoped>
.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  background-color: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  font-size: 12px;
}
</style>
