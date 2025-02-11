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

    <!-- 添加班级切换的 Tabs -->
    <a-tabs v-model:activeKey="activeClassId" @change="handleClassChange">
      <a-tab-pane
        v-for="classInfo in classList"
        :key="classInfo.id"
        :tab="classInfo.class_name"
        type="card"
      >
        <a-card :title="`${classInfo.class_name}成绩管理`">
          <template #extra>
            <a-space>
              <import-users />
            </a-space>
          </template>

          <!-- 成绩统计卡片 -->
          <a-row :gutter="16" class="statistics-cards">
            <a-col :span="6">
              <a-card>
                <a-statistic
                  title="平均分"
                  :value="statistics.averageScore"
                  :precision="1"
                />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card>
                <a-statistic
                  title="最高分"
                  :value="statistics.highestScore"
                  :precision="1"
                />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card>
                <a-statistic
                  title="最低分"
                  :value="statistics.lowestScore"
                  :precision="1"
                />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card>
                <a-statistic
                  title="学生总数"
                  :value="statistics.totalStudents"
                />
              </a-card>
            </a-col>
          </a-row>

          <!-- 成绩列表 -->
          <a-table
            :columns="columns"
            :data-source="allScores"
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
      </a-tab-pane>
    </a-tabs>

    <!-- 导入成绩弹窗 -->
    <import-scores
      v-model:visible="importVisible"
      :class-id="activeClassId || 0"
      @success="handleImportSuccess"
    />

    <!-- 编辑成绩弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑成绩"
      @ok="handleSaveEdit"
      :confirmLoading="editLoading"
    >
      <a-form v-if="editForm" layout="vertical">
        <a-form-item label="学号">
          <a-input v-model:value="editForm.studentNumber" disabled />
        </a-form-item>
        <a-form-item label="姓名">
          <a-input v-model:value="editForm.studentName" disabled />
        </a-form-item>
        <a-form-item label="年份">
          <a-input v-model:value="editForm.year" disabled />
        </a-form-item>
        <a-form-item label="语文">
          <a-input-number
            v-model:value="editForm.chinese"
            :min="0"
            :max="150"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="数学">
          <a-input-number
            v-model:value="editForm.math"
            :min="0"
            :max="150"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="英语">
          <a-input-number
            v-model:value="editForm.english"
            :min="0"
            :max="150"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="物理">
          <a-input-number
            v-model:value="editForm.physics"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="化学">
          <a-input-number
            v-model:value="editForm.chemistry"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="生物">
          <a-input-number
            v-model:value="editForm.biology"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import type { Score, ClassInfo } from '@/types/api'
import { teacherApi } from '@/api'
import { watch } from 'vue'
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

// 添加新的响应式变量
const classList = ref<ClassInfo[]>([])
const activeClassId = ref<number>()
const allScores = ref<Score[]>([])

const statistics = ref({
  averageScore: 0,
  highestScore: 0,
  lowestScore: 0,
  totalStudents: 0
})

// 添加编辑对话框相关的响应式变量
const editModalVisible = ref(false)
const editForm = ref<Score | null>(null)
const editLoading = ref(false)

// 修改 watch，移除图表相关调用
watch(activeClassId, (newVal) => {
  console.log("activeClassId",newVal)
  fetchScores()
})

const updateStatistics = () => {
  const scores = allScores.value
  if (scores.length === 0) {
    statistics.value = {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalStudents: 0
    }
    return
  }

  const totalScores = scores.reduce((sum, score) => sum + score.totalScore, 0)
  statistics.value = {
    averageScore: Number((totalScores / scores.length).toFixed(1)),
    highestScore: Math.max(...scores.map(s => s.totalScore)),
    lowestScore: Math.min(...scores.map(s => s.totalScore)),
    totalStudents: scores.length
  }
}

// 获取班级列表
const fetchClasses = async () => {
  try {
    const res = await teacherApi.getClasses()
    console.log(res)
    if (res.success) {
      classList.value = res.data
      // 默认选中第一个班级
      if (res.data.length > 0 && !activeClassId.value) {
        activeClassId.value = res.data[0].id
        console.log("activeClassId",activeClassId.value)
      }
    }
  } catch (error: any) {
    message.error(error.message || '获取班级列表失败')
  }
}

// 处理班级切换
const handleClassChange = (classId: number) => {
  activeClassId.value = classId
  updateStatistics()
}

const fetchScores = async () => {
  try {
    if (!activeClassId.value) return
    loading.value = true
    const res = await teacherApi.getClassScores(activeClassId.value)
    console.log("获取成绩列表",res)
    if (res.success) {
      allScores.value = res.data
      scoreList.value = res.data
      updateStatistics()
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
  editForm.value = { ...record } // 复制一份数据，避免直接修改原数据
  editModalVisible.value = true
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editForm.value) return

  try {
    editLoading.value = true
    const res = await teacherApi.updateScore(editForm.value)
    if (res.success) {
      message.success('更新成功')
      editModalVisible.value = false
      fetchScores() // 刷新列表
    }
  } catch (error: any) {
    message.error(error.message || '更新失败')
  } finally {
    editLoading.value = false
  }
}

// 删除成绩
const handleDelete = async (record: Score) => {
  try {
    const res = await teacherApi.deleteScore(record.id)
    if (res.success) {
      message.success('删除成功')
      fetchScores() // 刷新列表
    }
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

onMounted(async () => {
  await fetchClasses()
  await fetchScores()
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
}
</style>
