<template>
  <div class="system-logs">
    <a-card title="操作日志" :bordered="false">
      <!-- 搜索表单 -->
      <a-form layout="inline" class="search-form">
        <a-form-item label="日志类型">
          <a-select
            v-model:value="searchParams.type"
            style="width: 200px"
            allowClear
            placeholder="选择日志类型"
          >
            <a-select-option v-for="(label, value) in LOG_TYPES" :key="value" :value="value">
              {{ label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="dateRange"
            @change="onDateRangeChange"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchLogs">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- 日志表格 -->
      <a-table
        :columns="columns"
        :data-source="logs"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }: { column: any, record: { type: LogType, created_at: string } }">
          <!-- 日志类型列 -->
          <template v-if="column.key === 'type'">
            <span>{{ LOG_TYPES[record.type] || record.type }}</span>
          </template>
          <!-- 操作时间列 -->
          <template v-if="column.key === 'created_at'">
            <span>{{ dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { LOG_TYPES } from '@/constants/logTypes'
import type { LogType } from '@/constants/logTypes'
import type { Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 表格列定义
const columns = [
  {
    title: '操作类型',
    dataIndex: 'type',
    key: 'type',
    width: 150
  },
  {
    title: '操作内容',
    dataIndex: 'content',
    key: 'content'
  },
  {
    title: '操作人ID',
    dataIndex: 'user_id',
    key: 'user_id',
    width: 100
  },
  {
    title: 'IP地址',
    dataIndex: 'ip_address',
    key: 'ip_address',
    width: 150
  },
  {
    title: '操作时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  }
]

// 搜索参数
const searchParams = reactive({
  page: 1,
  pageSize: 10,
  type: undefined as string | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

// 日期范围选择
const dateRange = ref<[Dayjs, Dayjs] | null>(null)
const onDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
  if (dates) {
    searchParams.startDate = dates[0].format('YYYY-MM-DD HH:mm:ss')
    searchParams.endDate = dates[1].format('YYYY-MM-DD HH:mm:ss')
  } else {
    searchParams.startDate = undefined
    searchParams.endDate = undefined
  }
}

// 表格数据
const logs = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 获取日志数据
const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await adminApi.getSystemLogs(searchParams)
    if (res.success) {
      logs.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    message.error('获取日志失败')
  } finally {
    loading.value = false
  }
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  searchParams.page = pag.current
  searchParams.pageSize = pag.pageSize
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchLogs()
}

// 重置搜索条件
const resetSearch = () => {
  searchParams.type = undefined
  searchParams.startDate = undefined
  searchParams.endDate = undefined
  dateRange.value = null
  searchParams.page = 1
  fetchLogs()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.system-logs {
  padding: 24px;
}
.search-form {
  margin-bottom: 24px;
}
</style>
