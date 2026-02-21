<template>
  <div class="simple-test">
    <h1>图表组件简单测试</h1>
    
    <div class="test-section">
      <h2>1. 基础组件测试</h2>
      <div class="chart-container">
        <BaseChart 
          :option="baseOption" 
          width="100%" 
          height="200px"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>2. 柱状图测试</h2>
      <div class="chart-container">
        <BarChart 
          :data="barData" 
          title="月度销售"
          height="250px"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>3. 折线图测试</h2>
      <div class="chart-container">
        <LineChart 
          :data="lineData" 
          title="趋势分析"
          smooth
          area
          height="250px"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>4. 饼图测试</h2>
      <div class="chart-container">
        <PieChart 
          :data="pieData" 
          title="占比分析"
          donut
          height="250px"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>5. 指标卡测试</h2>
      <div class="metric-container">
        <MetricCard 
          title="总收入"
          :value="125800"
          unit="元"
          trend="12.5"
          icon="TrendCharts"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  BaseChart, 
  BarChart, 
  LineChart, 
  PieChart,
  MetricCard
} from '@/components/Charts'

// 测试数据
const baseOption = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [120, 200, 150, 80, 70, 110, 130],
    type: 'bar'
  }]
}

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
</script>

<style scoped lang="scss">
.simple-test {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  h1 {
    margin: 0 0 24px;
    font-size: 24px;
    color: #303133;
  }

  .test-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    h2 {
      margin: 0 0 16px;
      font-size: 16px;
      color: #606266;
    }

    .chart-container {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
    }

    .metric-container {
      max-width: 300px;
    }
  }
}
</style>
