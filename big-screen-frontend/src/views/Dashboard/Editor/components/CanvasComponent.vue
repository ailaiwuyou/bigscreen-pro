<template>
  <div class="canvas-component">
    <component :is="componentType" v-bind="componentProps" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  component: {
    type: string
    props: Record<string, any>
  }
}>()

const componentType = computed(() => {
  return props.component?.type || 'div'
})

const componentProps = computed(() => {
  return props.component?.props || {}
})
</script>

<style scoped>
.canvas-component {
  width: 100%;
  height: 100%;
}
</style>
