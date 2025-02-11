<template>
  <div class="class-management">
    <div class="header">
      <a-space>
        <a-button type="primary" @click="showCreateModal">
          创建班级
        </a-button>
        <a-button @click="handleRefresh">
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 班级列表 -->
    <a-table
  :columns="columns"
  :data-source="classList"
  :loading="loading"
  :pagination="false"
  row-key="id"
>
  <!-- 添加专门的操作列插槽 -->
  <template #action="{ record }">
    <a-space>
      <a @click="showDetails(record)">查看详情</a>
      <a-divider type="vertical" />
      <a @click="handleEdit(record)">编辑</a>
      <a-divider type="vertical" />
      <a @click="showAssignModal(record)">分配学生</a>
      <a-divider type="vertical" />
      <a-popconfirm
        title="确定删除该班级吗？"
        @confirm="handleDelete(record)"
      >
        <a class="danger">删除</a>
      </a-popconfirm>
    </a-space>
  </template>

  <!-- 保留其他列的 bodyCell 处理 -->
  <template #bodyCell="{ column, record }">
    <template v-if="column.key === 'studentCount'">
      {{ record.students?.length || 0 }}
    </template>
  </template>
</a-table>
    <!-- 创建/编辑班级对话框 -->
    <a-modal
      :title="editingClass ? '编辑班级' : '创建班级'"
      :visible="modalVisible"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="submitting"
    >
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="班级名称" name="class_name">
          <a-input v-model:value="formState.class_name" placeholder="请输入班级名称" />
        </a-form-item>
        <a-form-item label="所属院系" name="department">
          <a-select
            v-model:value="formState.department"
            placeholder="请选择院系"
            :options="departmentOptions"
          />
        </a-form-item>
        <a-form-item label="专业" name="major">
          <a-select
            v-model:value="formState.major"
            placeholder="请选择专业"
            :options="majorOptions"
          />
        </a-form-item>
        <a-form-item label="入学年份" name="year">
          <a-input-number
            v-model:value="formState.year"
            :min="2000"
            :max="2100"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="班级容量" name="capacity">
          <a-input-number
            v-model:value="formState.capacity"
            :min="1"
            :max="100"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 班级详情对话框 -->
    <a-modal
      v-model:visible="detailsVisible"
      title="班级详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="班级名称">
          {{ selectedClass?.class_name }}
        </a-descriptions-item>
        <a-descriptions-item label="院系">
          {{ selectedClass?.department }}
        </a-descriptions-item>
        <a-descriptions-item label="专业">
          {{ selectedClass?.major }}
        </a-descriptions-item>
        <a-descriptions-item label="入学年份">
          {{ selectedClass?.year }}
        </a-descriptions-item>
        <a-descriptions-item label="班级容量">
          {{ selectedClass?.capacity }}
        </a-descriptions-item>
        <a-descriptions-item label="学生人数">
          {{ selectedClass?.assigned_students || 0 }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 学生列表 -->
  <div class="student-list">
    <h3>学生列表</h3>
    <a-table
      :columns="studentColumns"
      :data-source="selectedClass?.students"
      :pagination="false"
      size="small"
    >
      <!-- 添加操作列插槽 -->
      <template #action="{ record }">
        <a-space>
          <a-popconfirm
            title="确定将该学生从班级中移除吗？"
            @confirm="handleRemoveStudent(selectedClass!.id, record.id)"
          >
            <a class="danger">移除</a>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>
  </div>
    </a-modal>

    <!-- 分配学生对话框 -->
    <a-modal
      v-model:visible="assignModalVisible"
      title="分配学生"
      @ok="handleAssignStudents"
      :confirmLoading="assignLoading"
    >
      <a-table
        :columns="unassignedStudentColumns"
        :data-source="unassignedStudents"
        :row-selection="{
          selectedRowKeys: selectedStudents,
          onChange: handleStudentSelect,
          columnWidth: 60
        }"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { teacherApi } from '@/api/teacher'
import type { ClassInfo } from '@/types/api'
import { departments, majors } from '@/constants/teacherRelate'

const columns = [
  {
    title: '班级名称',
    dataIndex: 'class_name',
    key: 'class_name'
  },
  {
    title: '院系',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '专业',
    dataIndex: 'major',
    key: 'major'
  },
  {
    title: '入学年份',
    dataIndex: 'year',
    key: 'year'
  },
  {
    title: '班级容量',
    dataIndex: 'capacity',
    key: 'capacity'
  },
  {
    title: '学生人数',
    dataIndex: 'assigned_students',
    key: 'assigned_students'
  },
  {
    title: '操作',
    key: 'action',
    width: 300,
    slots: {
      customRender: 'action'
    }
  }
]

const studentColumns = [
  {
    title: '学号',
    dataIndex: ['student_id'],
    key: 'student_id'
  },
  {
    title: '姓名',
    dataIndex: ['name'],
    key: 'name'
  },
  {
    title: '性别',
    dataIndex: ['gender'],
    key: 'gender'
  },
  {
    title: '联系方式',
    dataIndex: ['contact'],
    key: 'contact'
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    slots: {
      customRender: 'action'
    }
  }
]

const unassignedStudentColumns = [
  {
    title: '学号',
    dataIndex: 'student_id',
    key: 'student_id'
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '专业',
    dataIndex: 'major',
    key: 'major'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  }
]

const loading = ref(false)
const submitting = ref(false)
const modalVisible = ref(false)
const detailsVisible = ref(false)
const assignModalVisible = ref(false)
const classList = ref<ClassInfo[]>([])
const selectedClass = ref<ClassInfo | null>(null)
const editingClass = ref<ClassInfo | null>(null)
const formRef = ref<FormInstance>()
const departmentOptions = ref<any[]>(departments.map(dept => ({
  label: dept,
  value: dept
})))
const majorOptions = ref<any[]>(majors.map(major => ({
  label: major,
  value: major
})))
const unassignedStudents = ref<any[]>([])
const selectedStudents = ref<number[]>([])
const assignLoading = ref(false)

// 表单状态
const formState = ref({
  class_name: '',
  department: '',
  major: '',
  year: new Date().getFullYear(),
  capacity: 30
})

// 表单验证规则
const rules = {
  class_name: [{ required: true, message: '请输入班级名称' }],
  department: [{ required: true, message: '请选择院系' }],
  major: [{ required: true, message: '请选择专业' }],
  year: [{ required: true, message: '请输入入学年份' }],
  capacity: [{ required: true, message: '请输入班级容量' }]
}

// 获取班级列表
const fetchClasses = async () => {
  try {
    loading.value = true
    const res = await teacherApi.getClasses()
    console.log(res)
    if (res.success) {
      classList.value = res.data
    }
  } catch (error: any) {
    message.error(error.message || '获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 显示创建对话框
const showCreateModal = () => {
  editingClass.value = null
  formState.value = {
    class_name: '',
    department: '',
    major: '',
    year: new Date().getFullYear(),
    capacity: 30
  }
  modalVisible.value = true
}

// 显示编辑对话框
const handleEdit = (record: ClassInfo) => {
  editingClass.value = record
  formState.value = {
    class_name: record.class_name,
    department: record.department,
    major: record.major,
    year: record.year,
    capacity: record.capacity
  }
  modalVisible.value = true
}

// 显示详情
const showDetails = async (record: ClassInfo) => {
  try {
    const res = await teacherApi.getClassDetails(record.id)
    console.log(res)
    if (res.success) {
      selectedClass.value = res.data
      detailsVisible.value = true
    }
  } catch (error: any) {
    message.error(error.message || '获取班级详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const data = {
      ...formState.value
    }

    const res = editingClass.value
      ? await teacherApi.updateClass(editingClass.value.id, data)
      : await teacherApi.createClass(data)
    if (res.success) {
      message.success(editingClass.value ? '编辑成功' : '创建成功')
      modalVisible.value = false
      fetchClasses()
    }
  } catch (error: any) {
    message.error(error.message || (editingClass.value ? '编辑失败' : '创建失败'))
  } finally {
    submitting.value = false
  }
}

// 删除班级
const handleDelete = async (record: ClassInfo) => {
  try {
    const res = await teacherApi.deleteClass(record.id)
    if (res.success) {
      message.success('删除成功')
      fetchClasses()
    }
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

// 刷新列表
const handleRefresh = () => {
  fetchClasses()
}

// 取消操作
const handleCancel = () => {
  formRef.value?.resetFields()
  modalVisible.value = false
}

// 获取未分配学生列表
const fetchUnassignedStudents = async () => {
  try {
    const res = await teacherApi.getUnassignedStudents()
    if (res.success) {
      unassignedStudents.value = res.data
    }
  } catch (error: any) {
    message.error(error.message || '获取未分配学生列表失败')
  }
}

// 显示分配学生对话框
const showAssignModal = async (record: ClassInfo) => {
  selectedClass.value = record
  selectedStudents.value = []
  assignModalVisible.value = true
  await fetchUnassignedStudents()
}

// 处理学生分配
const handleAssignStudents = async () => {
  if (!selectedClass.value || selectedStudents.value.length === 0) {
    message.warning('请选择要分配的学生')
    return
  }

  try {
    assignLoading.value = true
    const res = await teacherApi.assignStudentsToClass(
      selectedClass.value.id,
      selectedStudents.value
    )
    if (res.success) {
      message.success('分配成功')
      assignModalVisible.value = false
      fetchClasses()
    }
  } catch (error: any) {
    message.error(error.message || '分配失败')
  } finally {
    assignLoading.value = false
  }
}

// 处理移除学生
const handleRemoveStudent = async (classId: number, studentId: number) => {
  try {
    const res = await teacherApi.removeStudentsFromClass(classId, [studentId])
    if (res.success) {
      message.success('移除成功')
      showDetails({ id: classId } as ClassInfo)
    }
  } catch (error: any) {
    message.error(error.message || '移除失败')
  }
}

const handleStudentSelect = (selectedRowKeys: number[]) => {
  selectedStudents.value = selectedRowKeys
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'orange',
    reported: 'green',
    unreported: 'red'
  }
  return statusMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待报到',
    reported: '已报到',
    unreported: '未报到'
  }
  return statusMap[status] || status
}

onMounted(() => {
  fetchClasses()
})
</script>

<style scoped lang="less">
.class-management {
  padding: 24px;

  .header {
    margin-bottom: 16px;
  }

  .danger {
    color: #ff4d4f;
  }

  .student-list {
    margin-top: 24px;

    h3 {
      margin-bottom: 16px;
    }
  }

  .footer {
    margin-top: 24px;
    text-align: right;
  }
}
</style>
