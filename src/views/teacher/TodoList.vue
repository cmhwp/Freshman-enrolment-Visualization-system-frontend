<template>
  <div class="todo-list">
    <a-card title="学生待办事项">
      <a-table
        :columns="columns"
        :data-source="todos"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                type="link"
                @click="handleProcess(record)"
              >
                处理
              </a-button>
              <a-popconfirm
                title="确定删除该待办事项吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 处理待办弹窗 -->
    <a-modal
      v-model:visible="processModalVisible"
      title="处理待办"
      @ok="handleSaveProcess"
      :confirmLoading="saving"
    >
      <a-form :model="processForm" layout="vertical">
        <a-form-item label="状态">
          <a-select v-model:value="processForm.status">
            <a-select-option value="completed">已处理</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="反馈" required>
          <a-textarea
            v-model:value="processForm.comment"
            :rows="4"
            placeholder="请输入反馈内容"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { Todo } from '@/types/api'
import { todoApi } from '@/api/todo'

const columns = [
  {
    title: '学生',
    dataIndex: 'student',
    key: 'student'
  },
  {
    title: '班级',
    dataIndex: 'class_name',
    key: 'class_name'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    customRender: ({ text }: { text: string }) => new Date(text).toLocaleString()
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 响应式变量
const loading = ref(false)
const todos = ref<Todo[]>([])
const processModalVisible = ref(false)
const saving = ref(false)
const processingTodo = ref<Todo | null>(null)

// 表单数据
const processForm = ref({
  status: 'processing',
  comment: ''
})

// 获取待办列表
const fetchTodos = async () => {
  loading.value = true
  try {
    const res = await todoApi.getTodos()
    if (res.success) {
      todos.value = res.data
    }
  } catch (error: any) {
    message.error(error.message || '获取待办列表失败')
  } finally {
    loading.value = false
  }
}

// 显示处理弹窗
const handleProcess = (todo: Todo) => {
  processingTodo.value = todo
  processForm.value = {
    status: todo.status,
    comment: todo.comment || ''
  }
  processModalVisible.value = true
}

// 保存处理结果
const handleSaveProcess = async () => {
  if (!processingTodo.value) return

  if (!processForm.value.comment) {
    message.warning('请输入反馈内容')
    return
  }

  saving.value = true
  try {
    const res = await todoApi.updateTodo(processingTodo.value.id, {
      status: processForm.value.status as Todo['status'],
      comment: processForm.value.comment
    })
    if (res.success) {
      message.success('处理成功')
      processModalVisible.value = false
      await fetchTodos()
    }
  } catch (error: any) {
    message.error(error.message || '处理失败')
  } finally {
    saving.value = false
  }
}

// 删除待办
const handleDelete = async (todo: Todo) => {
  try {
    const res = await todoApi.deleteTodo(todo.id)
    if (res.success) {
      message.success('删除成功')
      await fetchTodos()
    }
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}

onMounted(() => {
  fetchTodos()
})
</script>
