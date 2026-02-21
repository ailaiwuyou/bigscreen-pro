# 图表组件测试页面

## 访问地址
http://localhost:3000/test-charts

## 包含的图表组件

### 基础图表
1. **柱状图 (BarChart)** - 月度销售数据
2. **折线图 (LineChart)** - 平滑曲线 + 面积图
3. **饼图 (PieChart)** - 环形图展示占比
4. **散点图 (ScatterChart)** - 带回归线

### 高级图表
5. **雷达图 (RadarChart)** - 多维数据对比
6. **仪表盘 (GaugeChart)** - KPI 完成率
7. **漏斗图 (FunnelChart)** - 转化漏斗
8. **热力图 (HeatmapChart)** - 时间分布
9. **树图 (TreeChart)** - 层级结构
10. **矩形树图 (TreemapChart)** - 占比分布
11. **旭日图 (SunburstChart)** - 多层占比

## 使用方式

```vue
<template>
  <BarChart 
    :data="chartData" 
    title="图表标题"
    height="300px"
  />
</template>

<script setup>
import { BarChart } from '@/components/Charts'

const chartData = [
  { name: '一月', value: 100 },
  { name: '二月', value: 200 },
  { name: '三月', value: 150 }
]
</script>
```

## 浏览器控制台检查

打开浏览器开发者工具 (F12)，检查：
1. Console 是否有错误
2. Network 标签确认 ECharts 已加载
3. Elements 标签查看图表 DOM 结构

## 常见问题

1. **图表空白** - 检查容器是否有高度
2. **不响应式** - 确保父容器有明确尺寸
3. **TypeScript 错误** - 检查数据类型匹配
