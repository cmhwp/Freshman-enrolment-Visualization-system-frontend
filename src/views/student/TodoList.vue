<template>
  <div class="todo-list">
    <a-card title="我的待办">
      <template #extra>
        <a-button type="primary" @click="showCreateModal">
          发送待办
        </a-button>
      </template>

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
                v-if="record.status === 'pending'"
                type="link"
                @click="handleEdit(record)"
              >
                编辑
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

    <!-- 创建/编辑待办弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="editingTodo ? '编辑待办' : '发送待办'"
      @ok="handleSave"
      :confirmLoading="saving"
    >
      <a-form :model="todoForm" layout="vertical">
        <a-form-item label="标题" required>
          <a-input
            v-model:value="todoForm.title"
            placeholder="请输入标题"
          />
        </a-form-item>
        <a-form-item label="内容" required>
          <a-textarea
            v-model:value="todoForm.content"
            :rows="4"
            placeholder="请输入待办内容"
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
    title: '教师反馈',
    dataIndex: 'comment',
    key: 'comment'
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
const modalVisible = ref(false)
const saving = ref(false)
const editingTodo = ref<Todo | null>(null)

// 表单数据
const todoForm = ref({
  title: '',
  content: ''
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

// 显示创建弹窗
const showCreateModal = () => {
  editingTodo.value = null
  todoForm.value = {
    title: '',
    content: ''
  }
  modalVisible.value = true
}

// 显示编辑弹窗
const handleEdit = (todo: Todo) => {
  editingTodo.value = todo
  todoForm.value = {
    title: todo.title,
    content: todo.content
  }
  modalVisible.value = true
}

// 保存待办
const handleSave = async () => {
  if (!todoForm.value.title || !todoForm.value.content) {
    message.warning('请填写完整信息')
    return
  }

  saving.value = true
  try {
    if (editingTodo.value) {
      const res = await todoApi.updateTodo(editingTodo.value.id, todoForm.value)
      if (res.success) {
        message.success('更新成功')
        modalVisible.value = false
        await fetchTodos()
      }
    } else {
      const res = await todoApi.createTodo(todoForm.value)
      if (res.success) {
        message.success('创建成功')
        modalVisible.value = false
        await fetchTodos()
      }
    }
  } catch (error: any) {
    message.error(error.message || '操作失败')
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
    completed: '已处理',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}

onMounted(() => {
  fetchTodos()
})
</script>
