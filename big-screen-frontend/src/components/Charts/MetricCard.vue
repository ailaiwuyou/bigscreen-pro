<template>
  <div class="metric-card" :style="cardStyle">
    <div class="metric-icon" v-if="icon">
      <el-icon :size="iconSize">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="metric-content">
      <div class="metric-title">{{ title }}</div>
      <div class="metric-value" :style="valueStyle">
        {{ formattedValue }}
        <span class="metric-unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="metric-trend" v-if="trend !== undefined">
        <span :class="['trend-value', trend >= 0 ? 'up' : 'down']">
          <el-icon>
            <CaretTop v-if="trend >= 0" />
            <CaretBottom v-else />
          </el-icon>
          {{ Math.abs(trend).toFixed(2) }}%
        </span>
        <span class="trend-label">{{ trendLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: number | string
  unit?: string
  icon?: any
  iconSize?: number
  iconColor?: string
  iconBgColor?: string
  precision?: number
  trend?: number
  trendLabel?: string
  valueColor?: string
  valueSize?: number
  bgColor?: string
  borderRadius?: number
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 32,
  precision: 0,
  trendLabel: '较上期',
  valueSize: 28,
  borderRadius: 12,
  shadow: true
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(props.precision)
  }
  return props.value
})

const cardStyle = computed(() => ({
  backgroundColor: props.bgColor || '#fff',
  borderRadius: `${props.borderRadius}px`,
  boxShadow: props.shadow ? '0 4px 20px rgba(0, 0, 0, 0.08)' : 'none'
}))

const valueStyle = computed(() => ({
  color: props.valueColor || '#303133',
  fontSize: `${props.valueSize}px`
}))
</script>

<style scoped lang="scss">
.metric-card {
  display: flex;
  align-items: center;
  padding: 20px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;

  :deep(.el-icon) {
    color: v-bind('props.iconColor || "#409EFF"');
  }
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-value {
  font-weight: 600;
  line-height: 1.2;

  .metric-unit {
    font-size: 14px;
    font-weight: 400;
    margin-left: 4px;
    color: #909399;
  }
}

.metric-trend {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;

  .trend-value {
    display: flex;
    align-items: center;
    font-weight: 500;

    &.up {
      color: #67c23a;
    }

    &.down {
      color: #f56c6c;
    }

    .el-icon {
      margin-right: 2px;
      font-size: 12px;
    }
  }

  .trend-label {
    color: #909399;
    margin-left: 8px;
  }
}
</style>
