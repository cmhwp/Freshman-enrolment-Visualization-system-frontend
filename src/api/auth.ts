import request from './axios'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordResponse
} from '@/types/api'

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
  },

  //获取是否允许注册
  getRegisterStatus: () => {
    return request.get<any, { success: boolean; message: string; data: { allowRegister: boolean } }>(
      '/auth/register-status'
    )
  },

  // 发送重置密码验证码
  sendResetCode: (email: string) => {
    return request.post<any, { success: boolean; message: string }>(
      '/auth/send-reset-code',
      { email }
    )
  },

  // 重置密码
  resetPassword: (data: ForgotPasswordRequest) => {
    return request.post<any, ResetPasswordResponse>(
      '/auth/reset-password',
      data
    )
  }
}
