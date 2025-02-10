<template>
  <div class="ranking-view">
    <a-row :gutter="[16, 16]">
      <!-- 排名概览卡片 -->
      <a-col :span="24">
        <a-card>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic
                title="学校排名"
                :value="rankingData.schoolRanking?.currentRank"
                :suffix="`/ ${rankingData.schoolRanking?.totalStudents || 0}`"
              >
                <template #prefix>
                  <crown-outlined />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic
                title="专业排名"
                :value="rankingData.majorRanking?.currentRank"
                :suffix="`/ ${rankingData.majorRanking?.totalStudents || 0}`"
              >
                <template #prefix>
                  <trophy-outlined />
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 成绩分布分析 -->
      <a-col :span="24">
        <a-card title="成绩分布分析">
          <div ref="scoreDistChartRef" class="chart"></div>
        </a-card>
      </a-col>

      <!-- 排名趋势图 -->
      <a-col :span="24">
        <a-card title="排名趋势">
          <div ref="rankTrendChartRef" class="chart"></div>
        </a-card>
      </a-col>

      <!-- 各科目排名分析 -->
      <a-col :span="24">
        <a-card title="各科目排名">
          <div ref="subjectRankChartRef" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { studentApi } from '@/api'
import * as echarts from 'echarts'
import { CrownOutlined, TrophyOutlined } from '@ant-design/icons-vue'

interface RankingData {
  schoolRanking: {
    currentRank: number;
    totalStudents: number;
  } | null;
  majorRanking: {
    currentRank: number;
    totalStudents: number;
  } | null;
  scoreAnalysis: {
    averageScores: {
      chinese: number;
      math: number;
      english: number;
      physics: number;
      chemistry: number;
      biology: number;
    };
    subjectRanks: {
      chinese: number;
      math: number;
      english: number;
      physics: number;
      chemistry: number;
      biology: number;
    };
  } | null;
  distribution: {
    province: Record<string, number>;
    major: Record<string, number>;
  } | null;
}

const rankingData = ref<RankingData>({
  schoolRanking: null,
  majorRanking: null,
  scoreAnalysis: null,
  distribution: null,
})

const loading = ref(false)

// 图表实例
let rankTrendChart: echarts.ECharts | null = null
let subjectRankChart: echarts.ECharts | null = null
let scoreDistChart: echarts.ECharts | null = null

// 图表DOM引用
const rankTrendChartRef = ref<HTMLElement | null>(null)
const subjectRankChartRef = ref<HTMLElement | null>(null)
const scoreDistChartRef = ref<HTMLElement | null>(null)

// 修改初始化排名趋势图函数
const initRankTrendChart = () => {
  if (!rankTrendChartRef.value || !rankingData.value.distribution) return

  if (rankTrendChart) {
    rankTrendChart.dispose()
  }

  rankTrendChart = echarts.init(rankTrendChartRef.value)

  // 定义分数段和对应的颜色
  const scoreRanges = ['750-700', '699-650', '649-600', '599-550', '549-500', '<500']
  const colors = {
    '750-700': '#52c41a',
    '699-650': '#1890ff',
    '649-600': '#36cfc9',
    '599-550': '#faad14',
    '549-500': '#ff7a45',
    '<500': '#ff4d4f'
  }

  const option = {
    title: {
      text: '分数段分布'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: scoreRanges,
      axisLabel: {
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      minInterval: 1
    },
    series: [
      {
        name: '省排名人数',
        type: 'bar',
        data: scoreRanges.map(range => ({
          value: rankingData.value.distribution?.province[range] || 0,
          itemStyle: {
            color: colors[range as keyof typeof colors]
          }
        })),
        label: {
          show: true,
          position: 'top'
        }
      },
      {
        name: '专业排名人数',
        type: 'bar',
        data: scoreRanges.map(range => ({
          value: rankingData.value.distribution?.major[range] || 0,
          itemStyle: {
            color: colors[range as keyof typeof colors]
          }
        })),
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }
  rankTrendChart.setOption(option)
}

// 初始化科目排名图
const initSubjectRankChart = () => {
  if (!subjectRankChartRef.value || !rankingData.value.scoreAnalysis) return

  if (subjectRankChart) {
    subjectRankChart.dispose()
  }

  subjectRankChart = echarts.init(subjectRankChartRef.value)
  const subjects = ['语文', '数学', '英语', '物理', '化学', '生物']
  const ranks = [
    rankingData.value.scoreAnalysis.subjectRanks.chinese,
    rankingData.value.scoreAnalysis.subjectRanks.math,
    rankingData.value.scoreAnalysis.subjectRanks.english,
    rankingData.value.scoreAnalysis.subjectRanks.physics,
    rankingData.value.scoreAnalysis.subjectRanks.chemistry,
    rankingData.value.scoreAnalysis.subjectRanks.biology
  ]

  // 定义排名区间对应的颜色
  const getColorByRank = (rank: number) => {
  if (rank <= 50) return '#FFCDB2';    // 前50名（米白色）
    if (rank <= 100) return '#FFB4A2' // 前51-100名（浅粉色）
    if (rank <= 200) return '#E5989B' // 前101-200名（淡粉色）
    if (rank <= 300) return '#B5828C' // 前201-300名（深粉色）
    if (rank <= 400) return '#B5828C' // 前301-400名保持一致
    return '#ff4d4f' // 低于400名（红色）
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const rank = params[0].value
        let level = ''
        if (rank <= 50) level = '优秀'
        else if (rank <= 100) level = '良好'
        else if (rank <= 200) level = '中等'
        else if (rank <= 300) level = '及格'
        else level = '需要努力'
        return `${params[0].name}<br/>排名：第${rank}名<br/>水平：${level}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: subjects,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      inverse: true,
      name: '排名',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        type: 'bar',
        data: ranks.map(rank => ({
          value: rank,
          itemStyle: {
            color: getColorByRank(rank)
          }
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}名'
        }
      }
    ]
  }
  subjectRankChart.setOption(option)
}

// 修改初始化成绩分布图
const initScoreDistChart = () => {
  if (!rankingData.value.distribution) return
  if (scoreDistChart) {
    scoreDistChart.dispose()
  }
  scoreDistChart = echarts.init(scoreDistChartRef.value)
  const option = {
    title: {
      text: '成绩分布分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['750-700分', '699-650分', '649-600分', '599-550分', '549-500分', '500分以下']
    },
    series: [
      {
        name: '成绩分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}人\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: [
          {
            value: rankingData.value.distribution.major['750-700'] || 0,
            name: '750-700分',
            itemStyle: { color: '#52c41a' }
          },
          {
            value: rankingData.value.distribution.major['699-650'] || 0,
            name: '699-650分',
            itemStyle: { color: '#1890ff' }
          },
          {
            value: rankingData.value.distribution.major['649-600'] || 0,
            name: '649-600分',
            itemStyle: { color: '#1890ff' }
          },
          {
            value: rankingData.value.distribution.major['599-550'] || 0,
            name: '599-550分',
            itemStyle: { color: '#faad14' }
          },
          {
            value: rankingData.value.distribution.major['549-500'] || 0,
            name: '549-500分',
            itemStyle: { color: '#ff7a45' }
          },
          {
            value: rankingData.value.distribution.major['<500'] || 0,
            name: '500分以下',
            itemStyle: { color: '#ff4d4f' }
          }
        ]
      }
    ]
  }

  scoreDistChart.setOption(option)
}

// 修改获取排名数据的回调
const fetchRankingData = async () => {
  try {
    loading.value = true
    const [schoolRes, majorRes, analysisRes, distributionRes] = await Promise.all([
      studentApi.getSchoolRanking(),
      studentApi.getMajorRanking(),
      studentApi.getScoreAnalysis(),
      studentApi.getScoreDistribution()
    ])

    if (schoolRes.success && majorRes.success && analysisRes.success && distributionRes.success) {
      rankingData.value = {
        schoolRanking: schoolRes.data,
        majorRanking: majorRes.data,
        scoreAnalysis: analysisRes.data,
        distribution: distributionRes.data
      }
      initScoreDistChart()
      initSubjectRankChart()
      initRankTrendChart()
    }
  } catch (error: any) {
    message.error(error.message || '获取排名数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRankingData()
})

// 窗口大小变化时重绘图表
window.addEventListener('resize', () => {
  rankTrendChart?.resize()
  subjectRankChart?.resize()
  scoreDistChart?.resize()
})

// 修改组件卸载时的清理逻辑
onUnmounted(() => {
  if (rankTrendChart) {
    rankTrendChart.dispose()
  }
  if (subjectRankChart) {
    subjectRankChart.dispose()
  }
  if (scoreDistChart) {
    scoreDistChart.dispose()
  }
})
</script>

<style scoped lang="less">
.ranking-view {
  padding: 24px;

  .chart {
    height: 400px;
    margin: 24px 0;
  }

  :deep(.ant-card) {
    margin-bottom: 16px;
  }

  :deep(.ant-statistic) {
    .ant-statistic-title {
      font-size: 16px;
      margin-bottom: 8px;
    }
    .ant-statistic-content {
      font-size: 24px;
      .anticon {
        margin-right: 8px;
        color: #1890ff;
      }
    }
  }
}
</style>
