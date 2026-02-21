<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性面板</h3>
    </div>
    <div class="panel-content">
      <div v-if="selectedComponent" class="component-props">
        <el-form label-width="80px" size="small">
          <el-form-item label="类型">
            <span>{{ selectedComponent.type }}</span>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="selectedComponent.props.name" />
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="no-selection">
        <p>请选择一个组件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ComponentProps {
  type: string
  props: Record<string, any>
}

const props = defineProps<{
  selectedComponent: ComponentProps | null
}>()
</script>

<style scoped lang="scss">
.property-panel {
  width: 280px;
  background: #fff;
  border-left: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.no-selection {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
