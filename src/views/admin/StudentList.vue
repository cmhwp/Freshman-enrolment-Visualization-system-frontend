<template>
  <div class="student-list">
    <!-- 搜索表单 -->
     <div class="header-actions">
      <a-form layout="inline" class="search-form">
      <a-form-item label="搜索">
        <a-input
          v-model:value="searchForm.search"
          placeholder="姓名/学号/邮箱"
          allow-clear
          @change="handleSearch"
        />
      </a-form-item>
      <a-form-item label="专业">
        <a-select
          v-model:value="searchForm.major"
          placeholder="选择专业"
          style="width: 200px"
          allow-clear
          @change="handleSearch"
        >
          <a-select-option v-for="major in majors" :key="major" :value="major">
            {{ major }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="学籍状态">
        <a-select
          v-model:value="searchForm.status"
          placeholder="选择状态"
          style="width: 120px"
          allow-clear
          @change="handleSearch"
        >
          <a-select-option value="pending">待报到</a-select-option>
          <a-select-option value="unreported">未报到</a-select-option>
          <a-select-option value="reported">已报到</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleImport">
          <template #icon> <UploadOutlined /> </template>
          导入学生
        </a-button>
      </a-form-item>
    </a-form>
     </div>

    <!-- 学生列表表格 -->
    <a-table
      :columns="columns"
      :data-source="students"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <!-- 学号列 -->
      <template #student_id="{ text }">
        <a>{{ text }}</a>
      </template>

      <!-- 性别列 -->
      <template #gender="{ text }">
        {{ text === 'M' ? '男' : '女' }}
      </template>

      <!-- 状态列 -->
      <template #status="{ text }">
        <a-tag :color="getStatusColor(text)">
          {{ getStatusText(text) }}
        </a-tag>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a @click="showEditModal(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="showDetailsModal(record)">详情</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除这个学生吗？"
            @confirm="handleDelete(record.id)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑学生信息"
      @ok="handleSave"
      :confirmLoading="editLoading"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="姓名" required>
          <a-input v-model:value="editForm.name" />
        </a-form-item>
        <a-form-item label="性别" required>
          <a-select v-model:value="editForm.gender">
            <a-select-option value="M">男</a-select-option>
            <a-select-option value="F">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="专业" required>
          <a-select v-model:value="editForm.major">
            <a-select-option v-for="major in majors" :key="major" :value="major">
              {{ major }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="学籍状态">
          <a-select v-model:value="editForm.status">
            <a-select-option value="pending">待报到</a-select-option>
            <a-select-option value="reported">已报到</a-select-option>
            <a-select-option value="unreported">未报到</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="detailsModalVisible"
      title="学生详细信息"
      :footer="null"
    >
      <a-descriptions bordered v-if="selectedStudent">
        <a-descriptions-item label="学号">
          {{ selectedStudent?.student_id }}
        </a-descriptions-item>
        <a-descriptions-item label="姓名">
          {{ selectedStudent?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="性别">
          {{ selectedStudent?.gender === 'M' ? '男' : '女' }}
        </a-descriptions-item>
        <a-descriptions-item label="专业">
          {{ selectedStudent?.major }}
        </a-descriptions-item>
        <a-descriptions-item label="入学日期">
          {{ selectedStudent?.admission_date }}
        </a-descriptions-item>
        <a-descriptions-item label="预计毕业">
          {{ selectedStudent?.graduation_date }}
        </a-descriptions-item>
        <a-descriptions-item label="学籍状态">
          <a-tag :color="getStatusColor(selectedStudent?.status)">
            {{ getStatusText(selectedStudent?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="联系方式">
          {{ selectedStudent?.contact }}
        </a-descriptions-item>
        <a-descriptions-item label="邮箱">
          {{ selectedStudent?.email }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 添加导入弹窗 -->
    <import-users
      v-model:visible="importModalVisible"
      type="student"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { adminApi } from '@/api/admin'
import type { StudentProfile } from '@/types/api'
import type { TablePaginationConfig } from 'ant-design-vue'
import ImportUsers from '../../components/ImportUsers.vue'
import { UploadOutlined } from '@ant-design/icons-vue'
// 搜索表单数据
const searchForm = ref({
  search: '',
  major: undefined,
  status: undefined
})

// 专业列表
const majors = ref<string[]>([])

// 表格数据
const students = ref<StudentProfile[]>([])
const loading = ref(false)
const pagination = ref<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10
})

// 编辑相关
const editModalVisible = ref(false)
const editLoading = ref(false)
const editForm = ref<Partial<StudentProfile>>({
  name: '',
  gender: undefined,
  student_id: '',
  major: '',
  status: 'pending' as const,
  admission_date: undefined,
  graduation_date: undefined
})

// 详情相关
const detailsModalVisible = ref(false)
const selectedStudent = ref<StudentProfile>()

// 导入相关
const importModalVisible = ref(false)

// 获取学生列表
const fetchStudents = async () => {
  try {
    loading.value = true
    const res = await adminApi.getStudentList({
      page: pagination.value.current || 1,
      pageSize: pagination.value.pageSize || 10,
      ...searchForm.value
    })
    console.log(res)
    if (res.success) {
      students.value = res.data.list
      pagination.value.total = res.data.total
    }
  } catch (error) {
    message.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.value.current = 1
  fetchStudents()
}

// 导入学生
const handleImport = () => {
  importModalVisible.value = true
}

// 导入成功处理
const handleImportSuccess = (result: { success: number; failed: number }) => {
  message.success(`导入完成！成功：${result.success}条，失败：${result.failed}条`)
  fetchStudents() // 刷新列表
}

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = pag
  fetchStudents()
}

// 显示编辑弹窗
const showEditModal = (record: StudentProfile) => {
  editForm.value = {
    id: record.id,
    name: record.name,
    gender: record.gender,
    student_id: record.student_id,
    major: record.major,
    status: record.status,
    admission_date: record.admission_date,
    graduation_date: record.graduation_date
  }
  editModalVisible.value = true
}

// 显示详情弹窗
const showDetailsModal = (record: StudentProfile) => {
  selectedStudent.value = record
  console.log(selectedStudent.value)
  detailsModalVisible.value = true
}

// 保存编辑
const handleSave = async () => {
  try {
    editLoading.value = true
    const res = await adminApi.updateStudent(editForm.value.id!, editForm.value)
    if (res.success) {
      message.success('更新成功')
      editModalVisible.value = false
      fetchStudents()
    }
  } catch (error) {
    message.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

// 删除学生
const handleDelete = async (id: number) => {
  try {
    const res = await adminApi.deleteStudent(id)
    if (res.success) {
      message.success('删除成功')
      fetchStudents()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 获取专业列表
const fetchMajors = async () => {
  try {
    const res = await adminApi.getSystemSettings()
    if (res.success) {
      majors.value = res.data.majors
    }
  } catch (error) {
    message.error('获取专业列表失败')
  }
}

onMounted(() => {
  fetchStudents()
  fetchMajors()
})

// 表格列定义
const columns = [
  {
    title: '学号',
    dataIndex: ['student_id'],
    key: 'student_id',
    slots: { customRender: 'student_id' }
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    slots: { customRender: 'gender' }
  },
  {
    title: '专业',
    dataIndex: ['major'],
    key: 'major'
  },
  {
    title: '状态',
    dataIndex: ['status'],
    key: 'status',
    slots: { customRender: 'status' }
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' }
  }
]

// 状态相关函数
const getStatusText = (status: string | undefined) => {
  if (!status) return ''
  const statusMap = {
    pending: '待报到',
    reported: '已报到',
    unreported: '未报到'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getStatusColor = (status: string | undefined) => {
  if (!status) return ''
  const colorMap = {
    pending: 'green',
    reported: 'blue',
    unreported: 'orange'
  }
  return colorMap[status as keyof typeof colorMap] || 'default'
}
</script>
<style scoped lang="less">
.student-list {
  padding: 24px;
  .header-actions {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
