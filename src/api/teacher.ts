import request from './axios'
import type { ClassInfo, CourseInfo, CourseScore, Score, GetOptionsResponse } from '@/types/api'

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
  downloadScoreTemplate: () => {
    return request.get<any, Blob>('/teacher/scores/template', {
      responseType: 'blob'
    })
  },

  // 导入成绩
  importScores: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<any, { success: boolean; data?: ImportResult; message?: string }>(
      '/teacher/scores/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },

  updateClassScores: (classId: number, data: UpdateScoresData) => {
    return request.post<any, { success: boolean; message: string }>(
      `/teacher/classes/${classId}/scores`,
      data
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
}
