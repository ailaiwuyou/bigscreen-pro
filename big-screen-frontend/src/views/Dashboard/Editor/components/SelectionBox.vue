<template>
  <div class="selection-box" :style="boxStyle">
    <div class="resize-handle nw"></div>
    <div class="resize-handle n"></div>
    <div class="resize-handle ne"></div>
    <div class="resize-handle w"></div>
    <div class="resize-handle e"></div>
    <div class="resize-handle sw"></div>
    <div class="resize-handle s"></div>
    <div class="resize-handle se"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  x: number
  y: number
  width: number
  height: number
}>()

const boxStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.width}px`,
  height: `${props.height}px`
}))
</script>

<style scoped lang="scss">
.selection-box {
  position: absolute;
  border: 2px solid #409eff;
  pointer-events: auto;
  z-index: 100;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 1px solid #409eff;
  border-radius: 2px;
  
  &.nw { top: -4px; left: -4px; cursor: nw-resize; }
  &.n { top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
  &.ne { top: -4px; right: -4px; cursor: ne-resize; }
  &.w { top: 50%; left: -4px; transform: translateY(-50%); cursor: w-resize; }
  &.e { top: 50%; right: -4px; transform: translateY(-50%); cursor: e-resize; }
  &.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
  &.s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
  &.se { bottom: -4px; right: -4px; cursor: se-resize; }
}
</style>
