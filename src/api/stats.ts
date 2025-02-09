import request from './axios'
import type { StatsOverview } from '@/types/api'
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
