<template>
  <div class="score-view">
    <a-card title="我的成绩">
      <!-- 成绩总览 -->
      <a-descriptions bordered>
        <a-descriptions-item label="总分">
          {{ score?.totalScore }}
        </a-descriptions-item>
        <a-descriptions-item label="学校排名">
          {{ score?.provinceRank }}
        </a-descriptions-item>
        <a-descriptions-item label="专业排名">
          {{ score?.majorRank }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 各科成绩雷达图 -->
      <div ref="radarChart" class="radar-chart"></div>

      <!-- 详细成绩表格 -->
      <a-table
        :columns="columns"
        :data-source="subjectScores"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'score'">
            <a-progress
              :percent="calculatePercent(record.score, record.fullScore)"
              :status="getScoreStatus(record.score, record.fullScore)"
            />
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { Score } from '@/types/api'
import { studentApi } from '@/api'
import * as echarts from 'echarts'

const score = ref<Score | null>(null)
const loading = ref(false)

// 图表实例
let radarChart: echarts.ECharts | null = null
let rankChart: echarts.ECharts | null = null

// 表格列定义
const columns = [
  { title: '科目', dataIndex: 'subject', key: 'subject' },
  { title: '分数', dataIndex: 'score', key: 'score', width: 300 },
  { title: '满分', dataIndex: 'fullScore', key: 'fullScore' }
]

// 计算各科成绩数据
const subjectScores = computed(() => {
  if (!score.value) return []
  return [
    { subject: '语文', score: score.value.chinese, fullScore: 150 },
    { subject: '数学', score: score.value.math, fullScore: 150 },
    { subject: '英语', score: score.value.english, fullScore: 150 },
    { subject: '物理', score: score.value.physics, fullScore: 100 },
    { subject: '化学', score: score.value.chemistry, fullScore: 100 },
    { subject: '生物', score: score.value.biology, fullScore: 100 }
  ]
})

// 计算得分率
const calculatePercent = (score: number, fullScore: number) => {
  return Math.round((score / fullScore) * 100)
}

// 获取得分状态
const getScoreStatus = (score: number, fullScore: number) => {
  const percent = calculatePercent(score, fullScore)
  if (percent >= 90) return 'success'
  if (percent >= 60) return 'normal'
  return 'exception'
}

// 初始化雷达图
const initRadarChart = () => {
  const chartDom = document.querySelector('.radar-chart') as HTMLElement
  if (!chartDom || !score.value) return

  radarChart = echarts.init(chartDom)
  const option = {
    title: {
      text: '各科成绩分析'
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: [
        { name: '语文', max: 150 },
        { name: '数学', max: 150 },
        { name: '英语', max: 150 },
        { name: '物理', max: 100 },
        { name: '化学', max: 100 },
        { name: '生物', max: 100 }
      ],
      splitNumber: 5,
      axisName: {
        color: '#333',
        fontSize: 14
      },
      splitLine: {
        lineStyle: {
          color: [
            'rgba(238, 197, 102, 0.1)',
            'rgba(238, 197, 102, 0.2)',
            'rgba(238, 197, 102, 0.4)',
            'rgba(238, 197, 102, 0.6)',
            'rgba(238, 197, 102, 0.8)',
            'rgba(238, 197, 102, 1)'
          ].reverse()
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,255,255,0.3)', 'rgba(200,200,200,0.1)']
        }
      }
    },
    series: [
      {
        type: 'radar',
        lineStyle: {
          width: 4
        },
        emphasis: {
          lineStyle: {
            width: 4
          }
        },
        data: [
          {
            value: [
              score.value.chinese || 0,
              score.value.math || 0,
              score.value.english || 0,
              score.value.physics || 0,
              score.value.chemistry || 0,
              score.value.biology || 0
            ],
            symbolSize: 6,
            itemStyle: {
              color: '#1890ff'
            },
            areaStyle: {
              color: 'rgba(24,144,255,0.2)'
            },
            label: {
              show: true,
              formatter: (params: any) => {
                return params.value
              },
              fontSize: 14,
              color: '#333'
            }
          }
        ]
      }
    ]
  }
  radarChart.setOption(option)
}


// 获取成绩数据
const fetchScore = async () => {
  try {
    loading.value = true
    const res = await studentApi.getScore()
    if (res.success) {
      score.value = res.data
      initRadarChart()
    }
  } catch (error: any) {
    message.error(error.message || '获取成绩失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchScore()
})

// 窗口大小变化时重绘图表
window.addEventListener('resize', () => {
  radarChart?.resize()
})
</script>

<style scoped lang="less">
.score-view {
  padding: 24px;

  .radar-chart,
  .rank-chart {
    height: 400px;
    margin: 24px 0;
  }
}
</style>
