<template>
  <div class="teacher-list">
    <a-card title="教师管理" :bordered="false">
      <!-- 搜索表单 -->
      <a-form layout="inline" class="search-form">
        <a-form-item label="搜索">
          <a-input
            v-model:value="searchParams.search"
            placeholder="姓名/用户名/邮箱"
            allowClear
          />
        </a-form-item>
        <a-form-item label="院系">
          <a-select
            v-model:value="searchParams.department"
            style="width: 200px"
            allowClear
            placeholder="选择院系"
          >
            <a-select-option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchTeachers">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- 教师表格 -->
      <a-table
        :columns="columns"
        :data-source="teachers"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="showEditModal(record)">编辑</a>
              <a-popconfirm
                title="确定要删除此教师吗？"
                @confirm="handleDelete(record.id)"
              >
                <a class="danger-link">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 编辑教师弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑教师信息"
      @ok="handleEdit"
      :confirmLoading="editLoading"
    >
      <a-form
        :model="editForm"
        layout="vertical"
        ref="editFormRef"
      >
        <a-form-item label="姓名" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="editForm.name" />
        </a-form-item>
        <a-form-item label="院系" name="department" :rules="[{ required: true }]">
          <a-select v-model:value="editForm.department">
            <a-select-option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="职称" name="title" :rules="[{ required: true }]">
          <a-select v-model:value="editForm.title">
            <a-select-option v-for="title in titles" :key="title" :value="title">
              {{ title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="研究方向" name="research_area">
          <a-select v-model:value="editForm.research_area">
            <a-select-option v-for="area in researchAreas" :key="area" :value="area">
              {{ area }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { adminApi } from '@/api/admin'
import { departments, titles, researchAreas } from '@/constants/teacherRelate'

// 表格列定义
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 120
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 100
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 180
  },
  {
    title: '院系',
    dataIndex: 'department',
    key: 'department',
    width: 150
  },
  {
    title: '职称',
    dataIndex: 'title',
    key: 'title',
    width: 100
  },
  {
    title: '研究方向',
    dataIndex: 'research_area',
    key: 'research_area'
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 搜索参数
const searchParams = reactive({
  page: 1,
  pageSize: 10,
  search: '',
  department: undefined as string | undefined
})

// 表格数据
const teachers = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 编辑相关
const editModalVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: 0,
  name: '',
  department: '',
  title: '',
  research_area: ''
})

// 获取教师列表
const fetchTeachers = async () => {
  loading.value = true
  try {
    const res = await adminApi.getTeacherList(searchParams)
    if (res.success) {
      teachers.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    message.error('获取教师列表失败')
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
  fetchTeachers()
}

// 重置搜索
const resetSearch = () => {
  searchParams.search = ''
  searchParams.department = undefined
  searchParams.page = 1
  fetchTeachers()
}

// 显示编辑弹窗
const showEditModal = (record: any) => {
  Object.assign(editForm, record)
  editModalVisible.value = true
}

// 提交编辑
const handleEdit = async () => {
  try {
    await editFormRef.value?.validate()
    editLoading.value = true

    const res = await adminApi.updateTeacher(editForm.id, {
      name: editForm.name,
      teacher_profile: {
        department: editForm.department,
        title: editForm.title,
        research_area: editForm.research_area
      }
    })

    if (res.success) {
      message.success('更新成功')
      editModalVisible.value = false
      fetchTeachers()
    }
  } catch (error) {
    message.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

// 删除教师
const handleDelete = async (id: number) => {
  try {
    const res = await adminApi.deleteTeacher(id)
    if (res.success) {
      message.success('删除成功')
      fetchTeachers()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchTeachers()
})
</script>

<style scoped>
.teacher-list {
  padding: 24px;
}
.search-form {
  margin-bottom: 24px;
}
.danger-link {
  color: #ff4d4f;
}
</style>
