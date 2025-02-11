<template>
  <div class="todo-list">
    <!-- 创建待办按钮 -->
    <div class="header" v-if="isStudent">
      <a-button type="primary" @click="showCreateModal">
        创建待办
      </a-button>
    </div>

    <!-- 待办列表 -->
    <a-list
      :loading="loading"
      :data-source="todos"
      :pagination="false"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-card :class="['todo-card', item.priority]" style="width: 100%">
            <template #title>
              <div class="card-title">
                <span>{{ item.title }}</span>
                <a-tag :color="getStatusColor(item.status)">
                  {{ getStatusText(item.status) }}
                </a-tag>
              </div>
            </template>
            <template #extra>
              <a-space>
                <a-button
                  v-if="isStudent && item.status === 'pending'"
                  type="link"
                  @click="handleEdit(item)"
                >
                  编辑
                </a-button>
                <a-button
                  v-if="isTeacher"
                  type="link"
                  @click="handleProcess(item)"
                >
                  处理
                </a-button>
                <a-popconfirm
                  title="确定删除该待办事项吗？"
                  @confirm="handleDelete(item)"
                >
                  <a-button type="link" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
            <a-descriptions>
              <a-descriptions-item label="内容">
                {{ item.content }}
              </a-descriptions-item>
              <a-descriptions-item label="优先级">
                <a-tag :color="getPriorityColor(item.priority)">
                  {{ getPriorityText(item.priority) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                {{ new Date(item.created_at).toLocaleString() }}
              </a-descriptions-item>
              <a-descriptions-item v-if="item.comment" label="教师反馈">
                {{ item.comment }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-list-item>
      </template>
    </a-list>

    <!-- 创建/编辑待办弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="editingTodo ? '编辑待办' : '创建待办'"
      @ok="handleSave"
      :confirmLoading="saving"
    >
      <a-form :model="todoForm" layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model:value="todoForm.title" />
        </a-form-item>
        <a-form-item label="内容" required>
          <a-textarea v-model:value="todoForm.content" :rows="4" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model:value="todoForm.priority">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="normal">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

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
            <a-select-option value="processing">处理中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="反馈">
          <a-textarea v-model:value="processForm.comment" :rows="4" />
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
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isStudent = userStore.role === 'student'
const isTeacher = userStore.role === 'teacher'

// 响应式变量
const loading = ref(false)
const todos = ref<Todo[]>([])
const modalVisible = ref(false)
const processModalVisible = ref(false)
const saving = ref(false)
const editingTodo = ref<Todo | null>(null)
const processingTodo = ref<Todo | null>(null)

// 表单数据
const todoForm = ref({
  title: '',
  content: '',
  priority: 'normal'
})

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

// 显示创建弹窗
const showCreateModal = () => {
  editingTodo.value = null
  todoForm.value = {
    title: '',
    content: '',
    priority: 'normal'
  }
  modalVisible.value = true
}

// 显示编辑弹窗
const handleEdit = (todo: Todo) => {
  editingTodo.value = todo
  todoForm.value = {
    title: todo.title,
    content: todo.content,
    priority: todo.priority
  }
  modalVisible.value = true
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

// 保存待办
const handleSave = async () => {
  if (!todoForm.value.title || !todoForm.value.content) {
    message.warning('请填写完整信息')
    return
  }

  saving.value = true
  try {
    if (editingTodo.value) {
      // 更新
      const res = await todoApi.updateTodo(editingTodo.value.id, todoForm.value)
      if (res.success) {
        message.success('更新成功')
        modalVisible.value = false
        await fetchTodos()
      }
    } else {
      // 创建
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

// 保存处理结果
const handleSaveProcess = async () => {
  if (!processingTodo.value) return

  saving.value = true
  try {
    const res = await todoApi.updateTodo(processingTodo.value.id, processForm.value)
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

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    low: 'green',
    normal: 'blue',
    high: 'red'
  }
  return colorMap[priority] || 'default'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    low: '低',
    normal: '中',
    high: '高'
  }
  return textMap[priority] || priority
}

onMounted(() => {
  fetchTodos()
})
</script>

<style scoped lang="less">
.todo-list {
  .header {
    margin-bottom: 16px;
  }

  .todo-card {
    &.high {
      border-left: 4px solid #ff4d4f;
    }
    &.normal {
      border-left: 4px solid #1890ff;
    }
    &.low {
      border-left: 4px solid #52c41a;
    }

    .card-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>
