<template>
  <div class="scores-container">
    <a-row :gutter="[16, 16]">
      <!-- 总分和排名卡片 -->
      <a-col :span="24">
        <a-card :loading="loading">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-statistic
                title="总分"
                :value="scoreData.total_score"
                :precision="1"
              >
                <template #suffix>分</template>
              </a-statistic>
            </a-col>
            <a-col :span="8">
              <a-statistic
                title="省排名"
                :value="scoreData.province_rank"
                :suffix="`/ ${totalStudents}`"
              />
            </a-col>
            <a-col :span="8">
              <a-statistic
                title="专业排名"
                :value="scoreData.major_rank"
                :suffix="`/ ${majorStudents}`"
              />
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 各科成绩卡片 -->
      <a-col :span="24">
        <a-card title="各科成绩" :loading="loading">
          <a-row :gutter="[16, 16]">
            <a-col :span="8" v-for="subject in subjects" :key="subject.key">
              <a-card class="subject-card" :bordered="false">
                <template #title>
                  <span class="subject-title">{{ subject.label }}</span>
                </template>
                <div class="score-value">{{ scoreData[subject.key as keyof StudentScore] }}</div>
              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 成绩分布图 -->
      <a-col :span="24">
        <a-card title="成绩分布" :loading="loading">
          <div ref="distributionChart" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { studentApi } from '@/api/student'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import type { StudentScore } from '@/types/api'

const loading = ref(true)
const scoreData = ref<StudentScore>({
  total_score: 0,
  chinese: 0,
  math: 0,
  english: 0,
  physics: 0,
  chemistry: 0,
  biology: 0,
  province_rank: 0,
  major_rank: 0
})

const totalStudents = ref(0)
const majorStudents = ref(0)
const distributionChart = ref<HTMLElement | null>(null)

const subjects = [
  { key: 'chinese' as keyof StudentScore, label: '语文' },
  { key: 'math' as keyof StudentScore, label: '数学' },
  { key: 'english' as keyof StudentScore, label: '英语' },
  { key: 'physics' as keyof StudentScore, label: '物理' },
  { key: 'chemistry' as keyof StudentScore, label: '化学' },
  { key: 'biology' as keyof StudentScore, label: '生物' }
]

// 获取成绩数据
const fetchScoreData = async () => {
  try {
    loading.value = true
    const response = await studentApi.getScores()
    if (response.success) {
      scoreData.value = response.data
    }
  } catch (error) {
    message.error('获取成绩数据失败')
    console.error('Fetch score data error:', error)
  } finally {
    loading.value = false
  }
}

// 初始化分布图表
const initDistributionChart = () => {
  if (distributionChart.value) {
    const chart = echarts.init(distributionChart.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['分数分布']
      },
      xAxis: {
        type: 'category',
        data: ['0-300', '300-400', '400-500', '500-600', '600-700', '700+']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '分数分布',
          type: 'bar',
          data: [10, 52, 200, 334, 390, 330]
        }
      ]
    }
    chart.setOption(option)
  }
}

onMounted(() => {
  fetchScoreData()
  initDistributionChart()
})
</script>

<style scoped lang="less">
.scores-container {
  padding: 24px;

  .subject-card {
    background: #fafafa;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }

    .subject-title {
      font-size: 16px;
      font-weight: 500;
    }

    .score-value {
      font-size: 24px;
      font-weight: bold;
      color: #1890ff;
      text-align: center;
      padding: 16px 0;
    }
  }
}
</style>
