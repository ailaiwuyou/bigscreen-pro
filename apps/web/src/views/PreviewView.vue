<template>
  <div class="preview-view">
    <h1>Preview</h1>
    <p>Dashboard ID: {{ id }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
}>();
</script>

<style scoped>
.preview-view {
  padding: 20px;
}
</style>
