import request from './axios'
import type {
  EnrollmentStats,
  UserProfile,
  StudentProfile,
  TeacherProfile,
  CreateTeacherData,
  SystemSettings,
  GetSettingsResponse,
  UpdateSettingsResponse,
  DormitoryBuilding,
  DormitoryRoom,
  GetBuildingsResponse,
  GetRoomsResponse,
  GetRoomDetailsResponse,
  CreateBuildingRequest,
  AssignRoomRequest,
  CreateRoomRequest,
  GetUnassignedStudentsResponse,
  BatchCreateRoomsRequest
} from '@/types/api'
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

export interface ImportResult {
  total: number
  success: number
  failed: number
  errors: string[]
}

export const adminApi = {
  // 学生管理
  getStudentList: (params: StudentListParams) => {
    return request.get<any, { success: boolean; data: { list: StudentProfile[]; total: number } }>(
      '/admin/students',
      { params }
    )
  },

  updateStudent: (id: number, data: Partial<StudentProfile>) => {
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
    return request.get<any, GetSettingsResponse>('/admin/settings')
  },

  updateSystemSettings: (data: Partial<Omit<SystemSettings, 'enrollmentDeadline'> & { enrollmentDeadline?: string | null }>) => {
    return request.put<any, UpdateSettingsResponse>('/admin/settings', data)
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
  },

  // 批量导入教师
  importTeachers: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<any, { success: boolean; data?: ImportResult; message?: string }>(
      '/admin/teachers/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },

  // 下载教师导入模板
  downloadTeacherTemplate: () => {
    return request.get<any, Blob>('/admin/teachers/template', {
      responseType: 'blob'
    })
  },

  // 获取新生报到统计
  getEnrollmentStats: () => {
    return request.get<any, { success: boolean; data: EnrollmentStats }>('/admin/enrollment/stats')
  },

  // 获取每日报到趋势
  getEnrollmentTrend: (params: { startDate: string; endDate: string }) => {
    return request.get<any, {
      success: boolean
      data: Array<{
        date: string
        count: number
        accumulative: number
      }>
    }>('/admin/enrollment/trend', { params })
  },

  // 获取宿舍分配情况
  getDormitoryStats: () => {
    return request.get<any, {
      success: boolean
      data: {
        totalRooms: number
        assignedRooms: number
        availableRooms: number
        byBuilding: Array<{
          building: string
          total: number
          assigned: number
          available: number
        }>
      }
    }>('/admin/dormitory/stats')
  },

  // 批量分配宿舍
  assignDormitories: (data: {
    studentIds: number[]
    building: string
    room: string
  }) => {
    return request.post<any, {
      success: boolean
      message: string
    }>('/admin/dormitory/assign', data)
  },

  // 下载学生导入模板
  downloadStudentTemplate: () => {
    return request.get<any, Blob>('/admin/students/template', {
      responseType: 'blob'
    })
  },

  // 导入学生
  importStudents: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<any, { success: boolean; data?: ImportResult; message?: string }>(
      '/admin/students/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }
}

// 宿舍管理相关接口
export const dormitoryApi = {
  // 获取所有宿舍楼
  getBuildings: () => {
    return request.get<any, GetBuildingsResponse>('/dormitory/buildings')
  },

  // 创建宿舍楼
  createBuilding: (data: CreateBuildingRequest) => {
    return request.post<any, { success: boolean; data: DormitoryBuilding }>(
      '/dormitory/buildings',
      data
    )
  },

  // 更新宿舍楼
  updateBuilding: (id: number, data: Partial<DormitoryBuilding>) => {
    return request.put<any, { success: boolean; data: DormitoryBuilding }>(
      `/dormitory/buildings/${id}`,
      data
    )
  },

  // 删除宿舍楼
  deleteBuilding: (id: number) => {
    return request.delete<any, { success: boolean; message: string }>(
      `/dormitory/buildings/${id}`
    )
  },

  // 获取指定宿舍楼的房间列表
  getRooms: (buildingId: number) => {
    return request.get<any, GetRoomsResponse>(`/dormitory/rooms/${buildingId}`)
  },

  // 创建宿舍房间
  createRoom: (data: CreateRoomRequest) => {
    return request.post<any, { success: boolean; data: DormitoryRoom }>(
      '/dormitory/rooms',
      data
    )
  },

  // 更新房间信息
  updateRoom: (id: number, data: Partial<DormitoryRoom>) => {
    return request.put<any, { success: boolean; data: DormitoryRoom }>(
      `/dormitory/rooms/${id}`,
      data
    )
  },

  // 删除房间
  deleteRoom: (id: number) => {
    return request.delete<any, { success: boolean; message: string }>(
      `/dormitory/rooms/${id}`
    )
  },

  // 获取宿舍详情
  getRoomDetails: (buildingId: number, roomNumber: string) => {
    return request.get<any, GetRoomDetailsResponse>('/dormitory/room-details', {
      params: { buildingId, roomNumber }
    })
  },

  // 分配宿舍
  assignRoom: (data: AssignRoomRequest) => {
    return request.post<any, { success: boolean; message: string }>(
      '/dormitory/assign',
      data
    )
  },

  // 学生退宿
  checkout: (assignmentId: number) => {
    return request.post<any, { success: boolean; message: string }>(
      `/dormitory/assignments/${assignmentId}/checkout`
    )
  },

  // 调整宿舍
  changeRoom: (assignmentId: number, data: { newRoomId: number }) => {
    return request.post<any, { success: boolean; message: string }>(
      `/dormitory/assignments/${assignmentId}/change`,
      data
    )
  },

  // 获取未分配宿舍的学生
  getUnassignedStudents: (buildingId: number) => {
    return request.get<any, GetUnassignedStudentsResponse>(
      '/dormitory/unassigned-students',
      { params: { buildingId } }
    )
  },

  // 批量创建房间
  batchCreateRooms: (data: BatchCreateRoomsRequest) => {
    return request.post<any, { success: boolean; message: string }>(
      '/dormitory/rooms/batch',
      data
    )
  }
}
