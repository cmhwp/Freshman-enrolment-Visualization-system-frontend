<template>
  <div class="teacher-list">
    <div class="header-actions">
      <a-form layout="inline" class="search-form" :model="searchParams">
        <a-form-item>
          <a-input
            v-model:value="searchParams.search"
            placeholder="搜索姓名/邮箱"
            allow-clear
            @pressEnter="fetchTeachers"
          />
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchParams.department"
            placeholder="选择院系"
            style="width: 200px"
            allow-clear
          >
            <a-select-option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchTeachers">搜索</a-button>
          <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- 操作按钮组 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleCreate">
          <plus-outlined /> 创建教师
        </a-button>
        <a-button type="primary" @click="showImportModal" style="margin-left: 8px">
          <upload-outlined /> 批量导入
        </a-button>
      </div>
    </div>

    <!-- 教师表格 -->
    <a-table
      :columns="columns"
      :data-source="teachers"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
    >
      <!-- 表格列插槽 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="showEditModal(record)">编辑</a>
            <a-popconfirm
              title="确定要删除这个教师吗？"
              @confirm="handleDelete(record.id)"
            >
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑教师信息"
      @ok="handleEdit"
      :confirmLoading="editLoading"
    >
      <a-form ref="editFormRef" :model="editForm" layout="vertical">
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

    <!-- 批量导入弹窗 -->
    <a-modal
      v-model:visible="importModalVisible"
      title="批量导入教师"
      :footer="null"
      width="600px"
    >
      <div class="import-container">
        <div class="upload-section">
          <a-upload
            :customRequest="handleUpload"
            :showUploadList="false"
            accept=".xlsx,.xls"
          >
            <a-button type="primary">
              <upload-outlined /> 选择文件
            </a-button>
          </a-upload>
          <a-button type="link" @click="downloadTemplate">
            <download-outlined /> 下载模板
          </a-button>
        </div>

        <!-- 导入说明 -->
        <div class="import-guide">
          <h4>导入说明：</h4>
          <ul>
            <li>请使用Excel文件（.xlsx或.xls格式）</li>
            <li>必填字段：用户名、邮箱、姓名</li>
            <li>选填字段：性别、联系方式、省份、院系、职称、研究方向</li>
            <li>默认密码为：123456</li>
          </ul>
        </div>

        <!-- 导入进度和结果 -->
        <div v-if="importStatus.total" class="import-result">
          <a-descriptions bordered size="small">
            <a-descriptions-item label="总数">{{ importStatus.total }}</a-descriptions-item>
            <a-descriptions-item label="成功">
              <span class="success-text">{{ importStatus.success }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="失败">
              <span class="error-text">{{ importStatus.failed }}</span>
            </a-descriptions-item>
          </a-descriptions>

          <!-- 错误信息列表 -->
          <div v-if="importStatus.errors?.length" class="error-list">
            <a-alert
              message="导入错误"
              type="error"
              show-icon
            >
              <template #description>
                <ul>
                  <li v-for="(error, index) in importStatus.errors" :key="index">
                    {{ error }}
                  </li>
                </ul>
              </template>
            </a-alert>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 创建教师弹窗 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="创建教师"
      @ok="handleCreate"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="用户名" required>
          <a-input v-model:value="createForm.username" />
        </a-form-item>
        <a-form-item label="邮箱" required>
          <a-input v-model:value="createForm.email" />
        </a-form-item>
        <a-form-item label="密码" required>
          <a-input-password v-model:value="createForm.password" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model:value="createForm.name" />
        </a-form-item>
        <a-form-item label="院系" required>
          <a-select v-model:value="createForm.department">
            <a-select-option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
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
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { adminApi } from '@/api/admin'
import { departments, titles, researchAreas } from '@/constants/teacherRelate'
import { useRouter } from 'vue-router'

const router = useRouter()
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

// 创建相关
const createModalVisible = ref(false)
const createForm = reactive({
  username: '',
  email: '',
  password: '',
  name: '',
  department: '',
  title: '',
  research_area: ''
})

// 批量导入相关
const importModalVisible = ref(false)
const importStatus = ref({
  total: 0,
  success: 0,
  failed: 0,
  errors: [] as string[]
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

// 显示批量导入弹窗
const showImportModal = () => {
  importModalVisible.value = true
  importStatus.value = {
    total: 0,
    success: 0,
    failed: 0,
    errors: []
  }
}

// 处理上传
const handleUpload = async ({ file }: { file: File }) => {
  try {
    const res = await adminApi.importTeachers(file)
    console.log(res)
    if (res.success && res.data) {
      importStatus.value = res.data
      if (res.data.failed === 0) {
        message.success('导入成功')
        importModalVisible.value = false
        fetchTeachers()
      } else {
        message.warning(`导入完成，${res.data.failed}条数据导入失败`)
      }
    }
  } catch (error) {
    message.error('导入失败')
  }
}

// 下载模板
const downloadTemplate = async () => {
  try {
    const response = await adminApi.downloadTeacherTemplate()
    const url = window.URL.createObjectURL(response)
    const a = document.createElement('a')
    a.href = url
    a.download = '教师导入模板.xlsx'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  } catch (error) {
    console.error('Download error:', error)
    message.error('下载模板失败')
  }
}

// 显示创建弹窗
const showCreateModal = () => {
  createModalVisible.value = true
}

// 处理创建
const handleCreate = async () => {
  router.push({
    path: '/admin/create-teacher',
  })
}

onMounted(() => {
  fetchTeachers()
})
</script>

<style scoped lang="less">
.teacher-list {
  padding: 24px;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .import-container {
    .upload-section {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .import-guide {
      background-color: #fafafa;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;

      h4 {
        margin-top: 0;
        margin-bottom: 8px;
      }

      ul {
        margin: 0;
        padding-left: 20px;
      }
    }

    .import-result {
      .success-text {
        color: #52c41a;
      }

      .error-text {
        color: #ff4d4f;
      }

      .error-list {
        margin-top: 16px;

        ul {
          margin: 8px 0 0;
          padding-left: 20px;
        }
      }
    }
  }
}
</style>
