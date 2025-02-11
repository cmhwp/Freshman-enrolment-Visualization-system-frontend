<template>
  <div class="score-analysis">
    <!-- 班级选择器 -->
    <div class="header">
      <a-space>
        <a-select
          v-model:value="selectedClassId"
          style="width: 200px"
          placeholder="请选择班级"
          @change="handleClassChange"
        >
          <a-select-option
            v-for="cls in classList"
            :key="cls.id"
            :value="cls.id"
          >
            {{ cls.class_name }}
          </a-select-option>
        </a-select>
        <a-button
          type="primary"
          @click="generateAIAnalysis"
          :loading="aiLoading"
          :disabled="!selectedClassId"
        >
          生成AI分析报告
        </a-button>
      </a-space>
    </div>

    <a-spin :spinning="loading">
      <!-- 成绩概览卡片 -->
      <a-row :gutter="16" class="statistics-cards">
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="班级平均分"
              :value="statistics.averageScore"
              :precision="1"
            >
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="优秀率"
              :value="statistics.excellentRate"
              :precision="1"
              suffix="%"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="及格率"
              :value="statistics.passRate"
              :precision="1"
              suffix="%"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="标准差"
              :value="statistics.standardDeviation"
              :precision="1"
            />
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <!-- 成绩分布图 -->
        <a-col :span="12">
          <a-card title="成绩分布">
            <div id="scoreDistributionChart" class="chart"></div>
          </a-card>
        </a-col>
        <!-- 各科目得分率 -->
        <a-col :span="12">
          <a-card title="各科目得分率">
            <div id="subjectScoreChart" class="chart"></div>
          </a-card>
        </a-col>
      </a-row>

      <!-- AI分析报告 -->
      <a-row :gutter="16" class="mt-16">
        <a-col :span="24">
          <a-card
            title="AI分析报告"
            :loading="aiLoading"
          >
            <template #extra>
              <a-space>
                <a-tag v-if="aiLoading" color="processing">
                  <sync-outlined spin />
                  AI分析生成中，预计需要1分钟...
                </a-tag>
                <a-tag v-else-if="parsedAnalysis" color="success">
                  <CheckCircleOutlined />
                  {{ new Date(reportUpdatedAt).toLocaleString() }}
                </a-tag>
              </a-space>
            </template>

            <template v-if="parsedAnalysis">
              <div class="markdown-content" v-html="formatContent(parsedAnalysis)"></div>
            </template>
            <template v-else>
              <a-empty description="暂无分析报告，请点击生成" />
            </template>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import { teacherApi } from '@/api'
import type { ClassInfo, Score } from '@/types/api'
import { SyncOutlined, BulbOutlined, CheckCircleOutlined, BarChartOutlined, BookOutlined, PieChartOutlined, WarningOutlined, SolutionOutlined } from '@ant-design/icons-vue'
import MarkdownIt from 'markdown-it'
import 'highlight.js/styles/github.css'

// 响应式变量
const loading = ref(false)
const aiLoading = ref(false)
const selectedClassId = ref<number>()
const classList = ref<ClassInfo[]>([])
const scoreData = ref<Score[]>([])
const aiAnalysis = ref<string | null>(null)
const reportUpdatedAt = ref<string>('')

// 统计数据
const statistics = ref({
  averageScore: 0,
  excellentRate: 0,
  passRate: 0,
  standardDeviation: 0
})

// 图表实例
let scoreDistributionChart: echarts.ECharts | null = null
let subjectScoreChart: echarts.ECharts | null = null

// AI分析结果
const parsedAnalysis = computed(() => {
  if (!aiAnalysis.value) return null
  return aiAnalysis.value
})

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})


// 修改格式化内容的方法
const formatContent = (content: string) => {
  return md.render(content)
}

// 初始化图表
const initCharts = () => {
  if (!scoreData.value.length) return

  // 成绩分布图
  const distDom = document.querySelector('#scoreDistributionChart') as HTMLElement
  if (distDom && !scoreDistributionChart) {
    scoreDistributionChart = echarts.init(distDom)
  }

  const scoreRanges = ['<300', '300-400', '400-500', '500-600', '600-700', '≥700']
  const distribution = scoreRanges.map(range => {
    const scores = scoreData.value.filter(score => {
      const total = score.totalScore
      switch(range) {
        case '<300': return total < 300
        case '300-400': return total >= 300 && total < 400
        case '400-500': return total >= 400 && total < 500
        case '500-600': return total >= 500 && total < 600
        case '600-700': return total >= 600 && total < 700
        case '≥700': return total >= 700
        default: return false
      }
    })
    return scores.length
  })

  const distOption = {
    title: {
      text: '成绩分布',
      left: 'center'
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
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '学生人数',
        type: 'bar',
        data: distribution,
        itemStyle: {
          color: '#1890ff'
        },
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }
  scoreDistributionChart?.setOption(distOption)

  // 各科目得分率图
  const subjectDom = document.querySelector('#subjectScoreChart') as HTMLElement
  if (subjectDom && !subjectScoreChart) {
    subjectScoreChart = echarts.init(subjectDom)
  }

  const subjects = ['语文', '数学', '英语', '物理', '化学', '生物']
  const subjectKeys = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology']
  const fullScores = {
    chinese: 150,
    math: 150,
    english: 150,
    physics: 100,
    chemistry: 100,
    biology: 100
  }

  const subjectScores = subjectKeys.map((key, index) => {
    const scores = scoreData.value.map(s => s[key as keyof Score] as number)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return {
      subject: subjects[index],
      scoreRate: Number((avg / fullScores[key as keyof typeof fullScores] * 100).toFixed(1))
    }
  })

  const subjectOption = {
    title: {
      text: '各科目得分率',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
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
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '得分率',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '得分率',
        type: 'bar',
        data: subjectScores.map(item => item.scoreRate),
        itemStyle: {
          color: function(params: any) {
            const colors = ['#ff4d4f', '#1890ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2']
            return colors[params.dataIndex]
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  }
  subjectScoreChart?.setOption(subjectOption)
}

// 更新统计数据
const updateStatistics = () => {
  if (!scoreData.value.length) return

  const scores = scoreData.value.map(s => s.totalScore)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const excellent = scores.filter(s => s >= 480).length // 优秀线设为总分的80%
  const pass = scores.filter(s => s >= 360).length // 及格线设为总分的60%

  statistics.value = {
    averageScore: Number(avg.toFixed(1)),
    excellentRate: Number(((excellent / scores.length) * 100).toFixed(1)),
    passRate: Number(((pass / scores.length) * 100).toFixed(1)),
    standardDeviation: Number(calculateStandardDeviation(scores).toFixed(1))
  }
}

// 计算标准差
const calculateStandardDeviation = (scores: number[]) => {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const squareDiffs = scores.map(score => Math.pow(score - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / scores.length
  return Math.sqrt(avgSquareDiff)
}

// 生成AI分析报告
const generateAIAnalysis = async () => {
  if (!selectedClassId.value) {
    message.warning('请先选择班级')
    return
  }

  if (aiLoading.value) {
    message.warning('分析报告正在生成中，请稍候...')
    return
  }

  aiLoading.value = true
  message.loading({
    content: 'AI分析报告生成中，可能需要1-2分钟...',
    duration: 0,
    key: 'aiAnalysis'
  })

  try {
    const response = await teacherApi.generateScoreAnalysis(
      selectedClassId.value,
      {
        scores: scoreData.value,
        statistics: statistics.value
      }
    )
    if (response.success) {
      message.success({
        content: '分析报告生成成功',
        key: 'aiAnalysis',
        duration: 2
      })
      aiAnalysis.value = response.data
    } else {
      message.error({
        content: response.message || '生成分析报告失败',
        key: 'aiAnalysis',
        duration: 2
      })
    }
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      message.error({
        content: '生成报告超时，请稍后重试。如果问题持续存在，请联系管理员。',
        key: 'aiAnalysis',
        duration: 3
      })
    } else {
      message.error({
        content: error.message || '生成分析报告失败',
        key: 'aiAnalysis',
        duration: 2
      })
    }
  } finally {
    aiLoading.value = false
  }
}

// 清除分析报告
const clearAnalysis = () => {
  aiAnalysis.value = null
}

// 处理班级变更
const handleClassChange = async (classId: number) => {
  selectedClassId.value = classId
  clearAnalysis()
  await fetchScoreData()
  await fetchAnalysis()  // 获取已有的分析报告
}

// 获取成绩数据
const fetchScoreData = async () => {
  if (!selectedClassId.value) return

  try {
    loading.value = true
    const res = await teacherApi.getClassScores(selectedClassId.value)
    if (res.success) {
      scoreData.value = res.data
      updateStatistics()
      initCharts()
    }
  } catch (error: any) {
    message.error(error.message || '获取成绩数据失败')
  } finally {
    loading.value = false
  }
}

// 获取班级列表
const fetchClasses = async () => {
  try {
    const res = await teacherApi.getClasses()
    if (res.success) {
      classList.value = res.data
      if (res.data.length > 0) {
        selectedClassId.value = res.data[0].id
        await fetchScoreData()
      }
    }
  } catch (error: any) {
    message.error(error.message || '获取班级列表失败')
  }
}

// 获取分析报告
const fetchAnalysis = async () => {
  if (!selectedClassId.value) return

  try {
    const res = await teacherApi.getScoreAnalysis(selectedClassId.value)
    if (res.success && res.data) {
      aiAnalysis.value = res.data
      reportUpdatedAt.value = res.updated_at || new Date().toISOString()
    }
  } catch (error: any) {
    message.error(error.message || '获取分析报告失败')
  }
}

onMounted(async () => {
  await fetchClasses()
  if (selectedClassId.value) {
    await fetchAnalysis()
  }
})

// 监听窗口大小变化，重绘图表
window.addEventListener('resize', () => {
  scoreDistributionChart?.resize()
  subjectScoreChart?.resize()
})

// 防止组件卸载时还在加载
onBeforeUnmount(() => {
  if (aiLoading.value) {
    message.destroy('aiAnalysis')
  }
})

// 添加获取章节图标的方法
const getSectionIcon = (title: string) => {
  const iconMap: Record<string, any> = {
    '整体表现分析': BarChartOutlined,
    '各科目表现分析': BookOutlined,
    '成绩分布特点': PieChartOutlined,
    '存在的问题和短板': WarningOutlined,
    '针对性的改进建议': SolutionOutlined
  }
  return iconMap[title]
}
</script>

<style scoped lang="less">
.score-analysis {
  padding: 24px;

  .header {
    margin-bottom: 24px;
  }

  .statistics-cards {
    margin-bottom: 24px;
  }

  .chart {
    height: 400px;
  }

  .mt-16 {
    margin-top: 16px;
  }

  .analysis-section {
    margin-bottom: 24px;

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0 12px 0 0;
        color: #1890ff;
        font-weight: 500;
        .section-icon {
          margin-right: 8px;
          font-size: 18px;
        }
      }
    }

    .markdown-content {
      font-size: 14px;
      line-height: 1.8;
      color: #333;
      text-align: justify;
      margin: 16px 0;
      padding: 0 8px;

      :deep(h1, h2, h3, h4, h5, h6) {
        margin: 16px 0 8px;
        font-weight: 500;
        color: #1890ff;
      }

      :deep(p) {
        margin: 8px 0;
      }

      :deep(ul, ol) {
        padding-left: 24px;
        margin: 8px 0;
      }

      :deep(li) {
        margin: 4px 0;
      }

      :deep(table) {
        border-collapse: collapse;
        margin: 16px 0;
        width: 100%;
      }

      :deep(th, td) {
        border: 1px solid #e8e8e8;
        padding: 8px 16px;
        text-align: left;
      }

      :deep(th) {
        background-color: #fafafa;
        font-weight: 500;
      }

      :deep(blockquote) {
        margin: 16px 0;
        padding: 0 16px;
        color: #666;
        border-left: 4px solid #1890ff;
        background-color: #f0f5ff;
      }

      :deep(code) {
        background-color: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
      }

      :deep(pre code) {
        display: block;
        padding: 16px;
        overflow-x: auto;
      }

      :deep(strong) {
        font-weight: 500;
        color: #1890ff;
      }
    }

    .suggestions {
      margin-top: 16px;
      background: #fafafa;
      padding: 16px 24px;
      border-radius: 8px;
      border-left: 4px solid #faad14;
      transition: all 0.3s ease;

      &:hover {
        background: #fff7e6;
        box-shadow: 0 2px 8px rgba(250, 173, 20, 0.15);
      }

      h4 {
        .anticon {
          margin-right: 8px;
          color: #faad14;
        }
      }

      ul li {
        padding: 4px 0;

        &:hover {
          color: #333;
        }
      }
    }
  }

  :deep(.ant-card-head-title) {
    display: flex;
    align-items: center;
  }

  :deep(.ant-card-extra) {
    .ant-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;

      .anticon {
        font-size: 14px;
      }
    }
  }
}
</style>
