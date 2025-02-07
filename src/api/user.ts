import request from './axios'
import type { UserProfile, UpdateProfileRequest } from '@/types/api'

export const userApi = {
  // 获取用户信息
  getProfile: () => {
    return request.get<any, { success: boolean; data: UserProfile }>('/user/profile')
  },

  // 更新用户信息
  updateProfile: (data: UpdateProfileRequest) => {
    return request.put<any, { success: boolean; message: string }>('/user/profile', data)
  },

  // 更新密码
  updatePassword: (data: { old_password: string; new_password: string }) => {
    return request.put<any, { success: boolean; message: string }>('/user/password', data)
  }
}
