import request from './axios'
import type {
  StudentScore,
  MajorRanking,
  ScoreDistribution,
  SchoolRanking
} from '@/types/api'

export const studentApi = {
  // 获取学生个人成绩
  getScores: () => {
    return request.get<any, { success: boolean; data: StudentScore }>(
      '/student/scores'
    )
  },

  // 获取专业排名信息
  getMajorRanking: () => {
    return request.get<any, { success: boolean; data: MajorRanking }>(
      '/student/major-ranking'
    )
  },

  // 获取分数分布和性别比例
  getScoreDistribution: () => {
    return request.get<any, { success: boolean; data: ScoreDistribution }>(
      '/student/score-distribution'
    )
  },

  // 获取学校总体排名
  getSchoolRanking: () => {
    return request.get<any, { success: boolean; data: SchoolRanking }>(
      '/student/school-ranking'
    )
  }
}
