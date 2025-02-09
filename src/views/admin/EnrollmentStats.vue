<template>
  <div class="enrollment-stats">
    <!-- 统计卡片 -->
    <a-row :gutter="24" class="stat-cards">
      <a-col :span="6">
        <a-card>
          <statistic
            title="新生总数"
            :value="stats.totalCount"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <team-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <statistic
            title="已报到"
            :value="stats.reportedCount"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <check-circle-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <statistic
            title="未报到"
            :value="stats.unreportedCount"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <warning-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <statistic
            title="报到率"
            :value="(stats.reportRate * 100).toFixed(2)"
            suffix="%"
            :value-style="{ color: '#722ed1' }"
          >
          </statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="24" class="chart-row">
      <!-- 专业报到情况 -->
      <a-col :span="12">
        <a-card title="各专业报到情况">
          <div ref="majorChartRef" class="chart"></div>
        </a-card>
      </a-col>
      <!-- 生源地分布 -->
      <a-col :span="12">
        <a-card title="生源地分布">
          <div ref="provinceChartRef" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 报到趋势 -->
    <a-row class="chart-row">
      <a-col :span="24">
        <a-card title="报到趋势">
          <template #extra>
            <a-range-picker
              v-model:value="dateRange"
              @change="handleDateRangeChange"
            />
          </template>
          <div ref="trendChartRef" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Statistic } from 'ant-design-vue'
import {
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PercentageOutlined
} from '@ant-design/icons-vue'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import dayjs from 'dayjs'
import { getProvinceLabel } from '@/utils/province'
import type { EnrollmentStats } from '@/types/api'
// 统计数据
const stats = ref<EnrollmentStats>({
  totalCount: 0,
  reportedCount: 0,
  unreportedCount: 0,
  reportRate: 0,
  byMajor: [],
  byProvince: []
})
// 图表实例
let majorChart: echarts.ECharts | null = null
let provinceChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// DOM引用
const majorChartRef = ref<HTMLElement>()
const provinceChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

// 日期范围
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().subtract(7, 'day'),
  dayjs()
])

// 初始化专业报到图表
const initMajorChart = () => {
  if (majorChartRef.value) {
    majorChart = echarts.init(majorChartRef.value)
    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['总人数', '已报到']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: stats.value.byMajor.map(item => item.major)
      },
      series: [
        {
          name: '总人数',
          type: 'bar',
          data: stats.value.byMajor.map(item => item.total)
        },
        {
          name: '已报到',
          type: 'bar',
          data: stats.value.byMajor.map(item => item.reported)
        }
      ]
    }
    majorChart.setOption(option)
  }
}

// 初始化省份分布图表
const initProvinceChart = () => {
  if (provinceChartRef.value) {
    provinceChart = echarts.init(provinceChartRef.value)
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: stats.value.byProvince.map(item => ({
            name: getProvinceLabel(item.province),
            value: item.count
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    provinceChart.setOption(option)
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await adminApi.getEnrollmentStats()
    console.log(res)
    if (res.success) {
      stats.value = res.data
      initMajorChart()
      initProvinceChart()
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 处理日期范围变化
const handleDateRangeChange = async () => {
  if (dateRange.value) {
    try {
      const res = await adminApi.getEnrollmentTrend({
        startDate: dateRange.value[0].format('YYYY-MM-DD'),
        endDate: dateRange.value[1].format('YYYY-MM-DD')
      })
      if (res.success && trendChart) {
        const option: EChartsOption = {
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: res.data.map(item => item.date)
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '报到人数',
              type: 'line',
              data: res.data.map(item => item.count),
              areaStyle: {}
            },
            {
              name: '累计人数',
              type: 'line',
              data: res.data.map(item => item.accumulative)
            }
          ]
        }
        trendChart.setOption(option)
      }
    } catch (error) {
      console.error('获取趋势数据失败:', error)
    }
  }
}

// 初始化趋势图表
const initTrendChart = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    handleDateRangeChange()
  }
}

// 监听窗口大小变化
const handleResize = () => {
  majorChart?.resize()
  provinceChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  fetchStats()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  majorChart?.dispose()
  provinceChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped lang="less">
.enrollment-stats {
  padding: 24px;

  .stat-cards {
    margin-bottom: 24px;
  }

  .chart-row {
    margin-bottom: 24px;
  }

  .chart {
    height: 400px;
  }

  :deep(.ant-card) {
    height: 100%;
  }
}
</style>
