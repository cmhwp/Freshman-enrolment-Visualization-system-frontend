import request from './axios'
import type { UserProfile, TeacherProfile, CreateTeacherData } from '@/types/api'

export interface StudentListParams {
  page: number
  pageSize: number
  search?: string
  major?: string
  province?: string
}

export interface TeacherListParams {
  page: number
  pageSize: number
  search?: string
  department?: string
}

export interface SystemLogParams {
  page: number
  pageSize: number
  startDate?: string
  endDate?: string
  type?: string
}

export interface UpdateTeacherData {
  name?: string
  gender?: 'M' | 'F'
  contact?: string

  teacher_profile?: {
    department?: string
    title?: string
    research_area?: string
  }
}

interface CreateClassData {
  name: string;
  major: string;
  department: string;
  year: number;
  capacity: number;
  teacher_id?: number;
}

export const adminApi = {
  // 学生管理
  getStudentList: (params: StudentListParams) => {
    return request.get<any, { success: boolean; data: { list: UserProfile[]; total: number } }>(
      '/admin/students',
      { params }
    )
  },

  updateStudent: (id: number, data: Partial<UserProfile>) => {
    return request.put<any, { success: boolean; message: string }>(
      `/admin/students/${id}`,
      data
    )
  },

  deleteStudent: (id: number) => {
    return request.delete<any, { success: boolean; message: string }>(
      `/admin/students/${id}`
    )
  },

  // 教师管理
  getTeacherList: (params: TeacherListParams) => {
    return request.get<any, { success: boolean; data: { list: UserProfile[]; total: number } }>(
      '/admin/teachers',
      { params }
    )
  },

  updateTeacher: (id: number, data: UpdateTeacherData) => {
    return request.put<any, { success: boolean; message: string }>(
      `/admin/teachers/${id}`,
      data
    )
  },

  deleteTeacher: (id: number) => {
    return request.delete<any, { success: boolean; message: string }>(
      `/admin/teachers/${id}`
    )
  },

  // 系统设置
  getSystemSettings: () => {
    return request.get<any, { success: boolean; data: Record<string, any> }>(
      '/admin/settings'
    )
  },

  updateSystemSettings: (data: Record<string, any>) => {
    return request.put<any, { success: boolean; message: string }>(
      '/admin/settings',
      data
    )
  },

  // 操作日志
  getSystemLogs: (params: SystemLogParams) => {
    return request.get<any, { success: boolean; data: { list: any[]; total: number } }>(
      '/admin/logs',
      { params }
    )
  },

  // 创建教师用户
  createTeacher: (data: CreateTeacherData) => {
    return request.post<any, { success: boolean; message: string; data: TeacherProfile }>(
      '/admin/teachers',
      data
    )
  },

  // 创建班级
  createClass: (data: CreateClassData) => {
    return request.post<any, { success: boolean; message: string; data: any }>(
      '/admin/classes',
      data
    )
  }
}
