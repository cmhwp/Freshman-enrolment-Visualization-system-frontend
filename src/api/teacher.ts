import request from './axios'

interface CreateClassData {
  name: string;
  major: string;
  department: string;
  year: number;
  capacity: number;
}

export const teacherApi = {
  // 创建班级
  createClass: (data: CreateClassData) => {
    return request.post<any, { success: boolean; message: string; data: any }>(
      '/teacher/classes',
      data
    )
  }
}
