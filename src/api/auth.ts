import request from './axios'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api'

export const authApi = {
  // 发送验证码
  sendVerification: (email: string) => {
    return request.post('/auth/send-verification', { email })
  },

  // 用户注册
  register: (data: RegisterRequest) => {
    return request.post<any, any>('/auth/register', data)
  },

  // 用户登录
  login: (data: LoginRequest) => {
    return request.post<any, LoginResponse>('/auth/login', data)
  },

  // 刷新token
  refreshToken: () => {
    return request.post<any, { access_token: string }>('/auth/refresh')
  }
}
