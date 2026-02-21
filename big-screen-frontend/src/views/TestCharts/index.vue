<template>
  <div class="test-charts-page">
    <h1>图表组件测试</h1>
    
    <div class="charts-grid">
      <!-- 柱状图 -->
      <div class="chart-card">
        <h3>柱状图</h3>
        <BarChart :data="barData" title="月度销售" height="250px" />
      </div>

      <!-- 折线图 -->
      <div class="chart-card">
        <h3>折线图（平滑）</h3>
        <LineChart :data="lineData" title="趋势分析" smooth area height="250px" />
      </div>

      <!-- 饼图 -->
      <div class="chart-card">
        <h3>环形图</h3>
        <PieChart :data="pieData" title="占比分析" donut height="250px" />
      </div>

      <!-- 散点图 -->
      <div class="chart-card">
        <h3>散点图（带回归线）</h3>
        <ScatterChart :data="scatterData" title="相关性分析" showRegression height="250px" />
      </div>

      <!-- 雷达图 -->
      <div class="chart-card">
        <h3>雷达图</h3>
        <RadarChart :data="radarData" :indicators="radarIndicators" title="多维分析" height="250px" />
      </div>

      <!-- 仪表盘 -->
      <div class="chart-card">
        <h3>仪表盘</h3>
        <GaugeChart :value="78" title="完成率" unit="%" height="250px" />
      </div>

      <!-- 漏斗图 -->
      <div class="chart-card">
        <h3>漏斗图</h3>
        <FunnelChart :data="funnelData" title="转化漏斗" height="250px" />
      </div>

      <!-- 热力图 -->
      <div class="chart-card">
        <h3>热力图</h3>
        <HeatmapChart :data="heatmapData" :xValues="days" :yValues="hours" title="访问热力" height="250px" />
      </div>

      <!-- 树图 -->
      <div class="chart-card">
        <h3>树图</h3>
        <TreeChart :data="treeData" title="组织架构" height="250px" />
      </div>

      <!-- 矩形树图 -->
      <div class="chart-card">
        <h3>矩形树图</h3>
        <TreemapChart :data="treemapData" title="占比分布" height="250px" />
      </div>

      <!-- 旭日图 -->
      <div class="chart-card">
        <h3>旭日图</h3>
        <SunburstChart :data="sunburstData" title="层级占比" height="250px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  HeatmapChart,
  TreeChart,
  TreemapChart,
  SunburstChart
} from '@/components/Charts'

// 测试数据
const barData = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 280 },
  { name: '5月', value: 320 },
  { name: '6月', value: 380 }
]

const lineData = [
  { name: '周一', value: 820 },
  { name: '周二', value: 932 },
  { name: '周三', value: 901 },
  { name: '周四', value: 934 },
  { name: '周五', value: 1290 },
  { name: '周六', value: 1330 },
  { name: '周日', value: 1320 }
]

const pieData = [
  { name: '直接访问', value: 335 },
  { name: '邮件营销', value: 310 },
  { name: '联盟广告', value: 234 },
  { name: '视频广告', value: 135 },
  { name: '搜索引擎', value: 1548 }
]

const scatterData = Array.from({ length: 50 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100 + Math.random() * 50
}))

const radarData = [
  { name: '预算分配', value: [4300, 10000, 28000, 35000, 50000] },
  { name: '实际开销', value: [5000, 14000, 28000, 31000, 42000] }
]

const radarIndicators = [
  { name: '销售', max: 6500 },
  { name: '管理', max: 16000 },
  { name: '信息技术', max: 30000 },
  { name: '客服', max: 38000 },
  { name: '研发', max: 52000 }
]

const funnelData = [
  { name: '访问', value: 100 },
  { name: '咨询', value: 80 },
  { name: '订单', value: 60 },
  { name: '点击', value: 40 },
  { name: '展现', value: 20 }
]

const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
  '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p']
const days = ['周六', '周五', '周四', '周三', '周二', '周一', '周日']

const heatmapData = []
for (let i = 0; i < 7; i++) {
  for (let j = 0; j < 24; j++) {
    heatmapData.push({
      x: hours[j],
      y: days[i],
      value: Math.floor(Math.random() * 100)
    })
  }
}

const treeData = {
  name: 'root',
  children: [
    {
      name: 'child1',
      children: [
        { name: 'child1-1' },
        { name: 'child1-2' }
      ]
    },
    {
      name: 'child2',
      children: [
        { name: 'child2-1' },
        { name: 'child2-2' }
      ]
    }
  ]
}

const treemapData = [
  {
    name: 'A类',
    value: 100,
    children: [
      { name: 'A1', value: 40 },
      { name: 'A2', value: 30 },
      { name: 'A3', value: 30 }
    ]
  },
  {
    name: 'B类',
    value: 80,
    children: [
      { name: 'B1', value: 50 },
      { name: 'B2', value: 30 }
    ]
  }
]

const sunburstData = [
  {
    name: 'A',
    children: [
      {
        name: 'A1',
        children: [
          { name: 'A11', value: 10 },
          { name: 'A12', value: 15 }
        ]
      },
      { name: 'A2', value: 20 }
    ]
  },
  {
    name: 'B',
    children: [
      { name: 'B1', value: 25 },
      { name: 'B2', value: 30 }
    ]
  }
]
</script>

<style scoped lang="scss">
.test-charts-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  h1 {
    margin: 0 0 24px;
    font-size: 24px;
    color: #303133;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
}
</style>
