import request from './axios'

export interface StatsOverview {
  studentCount?: number
  teacherCount?: number
  classCount?: number
  todayVisits?: number
  managedClasses?: number
  todoCount?: number
  className?: string
  major?: string
  studentId?: string
}

export const statsApi = {
  // 获取统计概览
  getOverview: () => {
    return request.get<any, { success: boolean; data: StatsOverview }>(
      '/stats/overview'
    )
  },

  // 获取上次登录时间
  getLastLogin: () => {
    return request.get<any, { success: boolean; data: { lastLoginTime: string | null } }>(
      '/stats/last-login'
    )
  }
}
