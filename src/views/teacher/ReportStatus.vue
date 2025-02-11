<template>
  <div class="report-status">
    <a-card title="学生报到情况">
      <!-- 统计信息 -->
      <a-row :gutter="16" class="statistics">
        <a-col :span="6">
          <a-statistic
            title="总人数"
            :value="reportStatus.statistics.total"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="已报到"
            :value="reportStatus.statistics.reported"
            :value-style="{ color: '#3f8600' }"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="未报到"
            :value="reportStatus.statistics.unreported"
            :value-style="{ color: '#cf1322' }"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="报到率"
            :value="reportStatus.statistics.report_rate"
            :value-style="{ color: '#1890ff' }"
          />
        </a-col>
      </a-row>

      <!-- 学生列表 -->
      <a-table
        :columns="columns"
        :data-source="reportStatus.students"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'report_status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'reported_at'">
            {{ record.report_time ? new Date(record.report_time).toLocaleString() : '-' }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.status !== 'pending'"
                type="link"
                @click="handleUpdateStatus(record)"
                :loading="updating === record.id"
              >
                {{ record.status === 'reported' ? '取消报到' : '标记报到' }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { teacherApi } from '@/api/teacher'
import type { ReportStatus } from '@/types/api'
const columns = [
  {
    title: '学号',
    dataIndex: 'student_number',
    key: 'student_number'
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '班级',
    dataIndex: 'class_name',
    key: 'class_name'
  },
  {
    title: '报到状态',
    dataIndex: 'report_status',
    key: 'report_status'
  },
  {
    title: '报到时间',
    dataIndex: 'reported_at',
    key: 'reported_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const loading = ref(false)
const reportStatus = ref<ReportStatus>({
  students: [],
  statistics: {
    total: 0,
    reported: 0,
    unreported: 0,
    report_rate: '0%'
  }
})


const updating = ref<number | null>(null)

// 获取报到状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'processing',  // 蓝色
    reported: 'success',    // 绿色
    unreported: 'warning'   // 黄色
  }
  return colorMap[status] || 'default'
}

// 获取报到状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待报到',
    reported: '已报到',
    unreported: '未报到'
  }
  return textMap[status] || status
}

// 获取学生报到数据
const fetchReportStatus = async () => {
  loading.value = true
  try {
    const res = await teacherApi.getStudentsReportStatus()
    if (res.success) {
      reportStatus.value = res.data
    }
  } catch (error: any) {
    message.error(error.message || '获取报到数据失败')
  } finally {
    loading.value = false
  }
}

// 更新报到状态
const handleUpdateStatus = async (student: any) => {
  if (student.status === 'pending') return // 待报到状态不允许操作

  updating.value = student.id
  try {
    const newStatus = student.status === 'reported' ? 'unreported' : 'reported'
    const res = await teacherApi.updateStudentReportStatus(student.id, newStatus)
    if (res.success) {
      message.success('更新成功')
      await fetchReportStatus() // 刷新数据
    }
  } catch (error: any) {
    message.error(error.message || '更新失败')
  } finally {
    updating.value = null
  }
}

onMounted(() => {
  fetchReportStatus()
})
</script>

<style scoped lang="less">
.report-status {
  .statistics {
    margin-bottom: 24px;
  }
}
</style>
