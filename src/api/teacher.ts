import request from './axios'
import type { ClassInfo, CourseInfo, CourseScore, Score, GetOptionsResponse, StudentProfile, ReportStatus } from '@/types/api'

interface CreateClassData {
  class_name: string;
  major: string;
  department: string;
  year: number;
  capacity: number;
}

interface UpdateScoresData {
  subject: string;
  semester: string;
  scores: Partial<Score>[];
}

interface ScoreData {
  studentNumber: string;
  year: number;
  totalScore: number;
  chinese?: number;
  math?: number;
  english?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
  provinceRank?: number;
  majorRank?: number;
}

export interface ImportResult {
  total: number
  success: number
  failed: number
  errors: string[]
}

export const teacherApi = {
  // 创建班级
  createClass: (data: CreateClassData) => {
    return request.post<any, { success: boolean; message: string; data: any }>(
      '/teacher/classes',
      data
    )
  },

  // 班级管理相关
  getClasses: () => {
    return request.get<any, { success: boolean; data: ClassInfo[] }>('/teacher/classes')
  },

  getClassDetails: (classId: number) => {
    return request.get<any, { success: boolean; data: ClassInfo }>(
      `/teacher/classes/${classId}`
    )
  },

  // 课程成绩管理相关
  getCourses: () => {
    return request.get<any, { success: boolean; data: CourseInfo[] }>('/teacher/courses')
  },

  getCourseScores: (courseId: number) => {
    return request.get<any, { success: boolean; data: CourseScore[] }>(
      `/teacher/courses/${courseId}/scores`
    )
  },

  updateCourseScores: (courseId: number, scores: Partial<CourseScore>[]) => {
    return request.post<any, { success: boolean; message: string }>(
      `/teacher/courses/${courseId}/scores`,
      { scores }
    )
  },

  // 成绩管理相关
  getScores: () => {
    return request.get<any, { success: boolean; data: Score[] }>(
      '/teacher/scores'
    )
  },

  // 下载成绩导入模板
  downloadScoreTemplate: (classId: number) => {
    return request.get<any, Blob>(
      `/teacher/classes/${classId}/score-template`,
      {
        responseType: 'blob'
      }
    )
  },

  // 导入成绩
  importScores: (classId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<any, { success: boolean; data?: ImportResult; message?: string }>(
      `/teacher/classes/${classId}/scores/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },

  updateClassScores: (classId: number, scores: Partial<Score>[]) => {
    return request.post<any, { success: boolean; message: string }>(
      `/teacher/classes/${classId}/scores`,
      { scores }
    )
  },

  // 更新班级信息
  updateClass: (classId: number, data: CreateClassData) => {
    return request.put<any, { success: boolean; message: string }>(
      `/teacher/classes/${classId}`,
      data
    )
  },

  // 删除班级
  deleteClass: (classId: number) => {
    return request.delete<any, { success: boolean; message: string }>(
      `/teacher/classes/${classId}`
    )
  },

  // 获取选项数据
  getOptions: () => {
    return request.get<any, GetOptionsResponse>('/teacher/options')
  },

  // 分配学生到班级
  assignStudentsToClass: async (classId: number, studentIds: number[]) => {
    return request.post<any, { success: boolean; message: string }>(`/teacher/class/${classId}/assign-students`, {
      student_ids: studentIds
    })
  },

  // 从班级移除学生
  removeStudentsFromClass: async (classId: number, studentIds: number[]) => {
    return request.post<any, { success: boolean; message: string }>(`/teacher/class/${classId}/remove-students`, {
      student_ids: studentIds
    })
  },

  // 获取未分配班级的学生列表
  getUnassignedStudents: async () => {
    return request.get<any, { success: boolean; data: StudentProfile[] }>('/teacher/unassigned-students')
  },

  // 获取班级成绩
  getClassScores: (classId: number) => {
    return request.get<any, { success: boolean; data: Score[] }>(
      `/teacher/classes/${classId}/scores`
    )
  },

  // 更新成绩
  updateScore: (score: Score) => {
    return request.put<any, { success: boolean; message: string }>(`/teacher/scores/${score.id}`, score)
  },

  // 删除成绩
  deleteScore: (scoreId: number) => {
    return request.delete<any, { success: boolean; message: string }>(`/teacher/scores/${scoreId}`)
  },

  // 获取成绩分析报告
  getScoreAnalysis: (classId: number) => {
    return request.get<any, { success: boolean; data: string | null; updated_at?: string }>(
      `/teacher/classes/${classId}/analysis`
    )
  },

  // 生成成绩分析
  generateScoreAnalysis: (classId: number, data: { scores: Score[], statistics: any }) => {
    return request.post<any, { success: boolean; message: string; data: string }>(
      `/teacher/classes/${classId}/analysis`,
      data,
      {
        timeout: 600000  // 增加到60秒
      }
    )
  },

  // 获取学生报到情况
  getStudentsReportStatus: () => {
    return request.get<any, {
      success: boolean
      data: ReportStatus
      message?: string
    }>('/teacher/students/report-status')
  },


  // 更新学生报到状态
  updateStudentReportStatus: (studentId: number, status: 'reported' | 'unreported') => {
    return request.put<any, { success: boolean; message: string }>(
      `/teacher/students/${studentId}/report-status`,
      { status }
    )
  },
}
