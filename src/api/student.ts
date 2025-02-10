import request from './axios'
import type { Score } from '@/types/api'

// 定义API返回的数据类型
interface RankingData {
  currentRank: number;
  totalStudents: number;
}

interface ScoreAnalysis {
  averageScores: {
    chinese: number;
    math: number;
    english: number;
    physics: number;
    chemistry: number;
    biology: number;
  };
  subjectRanks: {
    chinese: number;
    math: number;
    english: number;
    physics: number;
    chemistry: number;
    biology: number;
  };
}

export const studentApi = {
  // 获取个人成绩
  getScore: () => {
    return request.get<any, { success: boolean; data: Score }>(
      '/student/score'
    )
  },

  // 获取专业排名
  getMajorRanking: () => {
    return request.get<any, { success: boolean; data: RankingData }>(
      '/student/major-ranking'
    )
  },

  // 获取省排名
  getProvinceRanking: () => {
    return request.get<any, { success: boolean; data: RankingData }>(
      '/student/province-ranking'
    )
  },

  // 获取成绩分析
  getScoreAnalysis: () => {
    return request.get<any, { success: boolean; data: ScoreAnalysis }>(
      '/student/score-analysis'
    )
  },

  // 学生报到
  report: () => {
    return request.post<any, { success: boolean; message: string }>(
      '/student/report'
    )
  },

  // 获取分数段分布
  getScoreDistribution: () => {
    return request.get<any, {
      success: boolean;
      data: {
        province: Record<string, number>;
        major: Record<string, number>;
      }
    }>('/student/score-distribution')
  },

  // 获取学校排名
  getSchoolRanking: () => {
    return request.get<any, { success: boolean; data: RankingData }>(
      '/student/school-ranking'
    )
  }
}
