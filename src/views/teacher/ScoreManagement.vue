<template>
  <div class="score-management">
    <div class="header">
      <a-space>
        <a-button type="primary" @click="showImportModal">
          批量导入成绩
        </a-button>
        <a-button @click="handleRefresh">
          刷新
        </a-button>
      </a-space>
    </div>

    <a-card title="学生成绩管理">
      <template #extra>
        <a-space>
          <import-users />
        </a-space>
      </template>

      <!-- 成绩统计卡片 -->
      <a-row :gutter="16" class="statistics-cards">
        <a-col :span="6">
          <a-card>
            <statistic
              title="平均分"
              :value="statistics.averageScore"
              :precision="1"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <statistic
              title="最高分"
              :value="statistics.highestScore"
              :precision="1"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <statistic
              title="最低分"
              :value="statistics.lowestScore"
              :precision="1"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <statistic
              title="学生总数"
              :value="statistics.totalStudents"
            />
          </a-card>
        </a-col>
      </a-row>

      <!-- 成绩分布图表 -->
      <div class="charts-container">
        <a-row :gutter="16">
          <a-col :span="12">
            <div ref="scoreDistributionChart" class="chart"></div>
          </a-col>
          <a-col :span="12">
            <div ref="subjectAverageChart" class="chart"></div>
          </a-col>
        </a-row>
      </div>

      <!-- 成绩列表 -->
      <a-table
        :columns="columns"
        :data-source="scoreList"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定删除该成绩记录吗？"
                @confirm="handleDelete(record)"
              >
                <a class="danger">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 成绩详情对话框 -->
    <a-modal
      v-model:visible="detailsModalVisible"
      title="成绩详情"
      :footer="null"
      width="800px"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="学号">
          {{ selectedScore?.studentNumber }}
        </a-descriptions-item>
        <a-descriptions-item label="姓名">
          {{ selectedScore?.studentName }}
        </a-descriptions-item>
        <a-descriptions-item label="年份">
          {{ selectedScore?.year }}
        </a-descriptions-item>
        <a-descriptions-item label="总分">
          {{ selectedScore?.totalScore }}
        </a-descriptions-item>
        <a-descriptions-item label="省排名">
          {{ selectedScore?.provinceRank }}
        </a-descriptions-item>
        <a-descriptions-item label="专业排名">
          {{ selectedScore?.majorRank }}
        </a-descriptions-item>
        <a-descriptions-item label="语文">
          {{ selectedScore?.chinese }}
        </a-descriptions-item>
        <a-descriptions-item label="数学">
          {{ selectedScore?.math }}
        </a-descriptions-item>
        <a-descriptions-item label="英语">
          {{ selectedScore?.english }}
        </a-descriptions-item>
        <a-descriptions-item label="物理">
          {{ selectedScore?.physics }}
        </a-descriptions-item>
        <a-descriptions-item label="化学">
          {{ selectedScore?.chemistry }}
        </a-descriptions-item>
        <a-descriptions-item label="生物">
          {{ selectedScore?.biology }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 个人成绩雷达图 -->
      <div ref="radarChart" class="radar-chart"></div>
    </a-modal>

    <!-- 导入成绩弹窗 -->
    <import-scores
      v-model:visible="importVisible"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import type { Score } from '@/types/api'
import { teacherApi } from '@/api'
import * as echarts from 'echarts'

import ImportScores from '@/components/ImportScores.vue'

const columns = [
  {
    title: '学号',
    dataIndex: ['studentNumber'],
    key: 'studentNumber'
  },
  {
    title: '姓名',
    dataIndex: ['studentName'],
    key: 'studentName'
  },
  {
    title: '年份',
    dataIndex: 'year',
    key: 'year'
  },
  {
    title: '总分',
    dataIndex: 'totalScore',
    key: 'totalScore'
  },
  {
    title: '语文',
    dataIndex: 'chinese',
    key: 'chinese'
  },
  {
    title: '数学',
    dataIndex: 'math',
    key: 'math'
  },
  {
    title: '英语',
    dataIndex: 'english',
    key: 'english'
  },
  {
    title: '物理',
    dataIndex: 'physics',
    key: 'physics'
  },
  {
    title: '化学',
    dataIndex: 'chemistry',
    key: 'chemistry'
  },
  {
    title: '生物',
    dataIndex: 'biology',
    key: 'biology'
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

const loading = ref(false)
const scoreList = ref<Score[]>([])
const importVisible = ref(false)
const detailsModalVisible = ref(false)
const selectedScore = ref<Score | null>(null)

// 图表实例
let scoreDistributionChart: echarts.ECharts | null = null
let subjectAverageChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

// 统计数据计算
const statistics = computed(() => {
  if (!scoreList.value.length) {
    return {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalStudents: 0
    }
  }

  const totalScores = scoreList.value.map(s => s.totalScore)
  return {
    averageScore: Number((totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1)),
    highestScore: Math.max(...totalScores),
    lowestScore: Math.min(...totalScores),
    totalStudents: scoreList.value.length
  }
})

// 初始化成绩分布图表
const initScoreDistributionChart = () => {
  const chartDom = document.querySelector('.score-management .chart') as HTMLElement
  if (!chartDom) return

  scoreDistributionChart = echarts.init(chartDom)
  const option = {
    title: {
      text: '成绩分布'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['<500', '500-550', '550-600', '600-650', '650-700', '≥700']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: calculateScoreDistribution(),
        type: 'bar'
      }
    ]
  }
  scoreDistributionChart.setOption(option)
}

// 初始化学科平均分图表
const initSubjectAverageChart = () => {
  const chartDom = document.querySelectorAll('.score-management .chart')[1] as HTMLElement
  if (!chartDom) return

  subjectAverageChart = echarts.init(chartDom)
  const option = {
    title: {
      text: '各科平均分'
    },
    tooltip: {
      trigger: 'axis'
    },
    radar: {
      indicator: [
        { name: '语文', max: 150 },
        { name: '数学', max: 150 },
        { name: '英语', max: 150 },
        { name: '物理', max: 100 },
        { name: '化学', max: 100 },
        { name: '生物', max: 100 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: calculateSubjectAverages(),
            name: '平均分'
          }
        ]
      }
    ]
  }
  subjectAverageChart.setOption(option)
}

// 计算成绩分布
const calculateScoreDistribution = () => {
  const distribution = [0, 0, 0, 0, 0, 0]
  scoreList.value.forEach(score => {
    if (score.totalScore < 500) distribution[0]++
    else if (score.totalScore < 550) distribution[1]++
    else if (score.totalScore < 600) distribution[2]++
    else if (score.totalScore < 650) distribution[3]++
    else if (score.totalScore < 700) distribution[4]++
    else distribution[5]++
  })
  return distribution
}

// 计算各科平均分
const calculateSubjectAverages = () => {
  if (!scoreList.value.length) return [0, 0, 0, 0, 0, 0]

  const sum = {
    chinese: 0,
    math: 0,
    english: 0,
    physics: 0,
    chemistry: 0,
    biology: 0
  }

  scoreList.value.forEach(score => {
    sum.chinese += score.chinese || 0
    sum.math += score.math || 0
    sum.english += score.english || 0
    sum.physics += score.physics || 0
    sum.chemistry += score.chemistry || 0
    sum.biology += score.biology || 0
  })

  const len = scoreList.value.length
  return [
    Number((sum.chinese / len).toFixed(1)),
    Number((sum.math / len).toFixed(1)),
    Number((sum.english / len).toFixed(1)),
    Number((sum.physics / len).toFixed(1)),
    Number((sum.chemistry / len).toFixed(1)),
    Number((sum.biology / len).toFixed(1))
  ]
}

// 获取成绩列表
const fetchScores = async () => {
  try {
    loading.value = true
    const res = await teacherApi.getScores()
    console.log(res)
    if (res.success) {
      scoreList.value = res.data
      initScoreDistributionChart()
      initSubjectAverageChart()
    }
  } catch (error: any) {
    message.error(error.message || '获取成绩列表失败')
  } finally {
    loading.value = false
  }
}

// 显示导入弹窗
const showImportModal = () => {
  importVisible.value = true
}

// 导入成功回调
const handleImportSuccess = () => {
  fetchScores()
}

// 刷新列表
const handleRefresh = () => {
  fetchScores()
}

// 编辑成绩
const handleEdit = (record: Score) => {
  // TODO: 实现编辑功能
  console.log('编辑成绩', record)
}

// 删除成绩
const handleDelete = async (record: Score) => {
  // TODO: 实现删除功能
  console.log('删除成绩', record)
}

// 显示成绩详情
const showScoreDetails = (score: Score) => {
  selectedScore.value = score
  detailsModalVisible.value = true
  nextTick(() => {
    initRadarChart(score)
  })
}

// 初始化个人成绩雷达图
const initRadarChart = (score: Score) => {
  const chartDom = document.querySelector('.radar-chart') as HTMLElement
  if (!chartDom) return

  radarChart = echarts.init(chartDom)
  const option = {
    title: {
      text: '各科成绩分析'
    },
    radar: {
      indicator: [
        { name: '语文', max: 150 },
        { name: '数学', max: 150 },
        { name: '英语', max: 150 },
        { name: '物理', max: 100 },
        { name: '化学', max: 100 },
        { name: '生物', max: 100 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              score.chinese || 0,
              score.math || 0,
              score.english || 0,
              score.physics || 0,
              score.chemistry || 0,
              score.biology || 0
            ],
            name: '个人成绩'
          }
        ]
      }
    ]
  }
  radarChart.setOption(option)
}

onMounted(() => {
  fetchScores()
})

// 窗口大小变化时重绘图表
window.addEventListener('resize', () => {
  scoreDistributionChart?.resize()
  subjectAverageChart?.resize()
  radarChart?.resize()
})
</script>

<style scoped lang="less">
.score-management {
  padding: 24px;

  .header {
    margin-bottom: 16px;
  }

  .danger {
    color: #ff4d4f;
  }

  .statistics-cards {
    margin-bottom: 24px;
  }

  .charts-container {
    margin: 24px 0;

    .chart {
      height: 400px;
      margin-bottom: 24px;
    }
  }

  .radar-chart {
    height: 400px;
    margin-top: 24px;
  }
}
</style>
