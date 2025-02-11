import request from './axios'
import type { Todo } from '@/types/api'

export const todoApi = {
  // 获取待办列表
  getTodos: () => {
    return request.get<any, { success: boolean; data: Todo[]; message?: string }>('/todo/todos')
  },

  // 创建待办
  createTodo: (data: Partial<Todo>) => {
    return request.post<any, { success: boolean; data: Todo; message?: string }>('/todo/todos', data)
  },

  // 更新待办
  updateTodo: (id: number, data: Partial<Todo>) => {
    return request.put<any, { success: boolean; data: Todo; message?: string }>(`/todo/todos/${id}`, data)
  },

  // 删除待办
  deleteTodo: (id: number) => {
    return request.delete<any, { success: boolean; message: string }>(`/todo/todos/${id}`)
  }
}
