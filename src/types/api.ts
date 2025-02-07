// 用户相关接口
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: number
    username: string
    email: string
    role: string
    name: string
  }
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role: string
  name: string
  verification_code: string
  contact?: string
  province?: string
  gender?: 'M' | 'F'
}

// 学生成绩相关接口
export interface StudentScore {
  total_score: number
  chinese: number
  math: number
  english: number
  physics: number
  chemistry: number
  biology: number
  province_rank: number
  major_rank: number
}

export interface MajorRanking {
  major_name: string
  student_rank: number
  total_students: number
  average_score: number
  highest_score: number
}

export interface ScoreDistribution {
  score_distribution: {
    ranges: string[]
    counts: number[]
  }
  gender_ratio: {
    male: number
    female: number
  }
}

export interface SchoolRanking {
  school_rank: number
  total_students: number
  percentile: number
}

// 添加用户信息相关接口
export interface UserProfile {
  id: number
  username: string
  email: string
  name: string
  role: string
  contact?: string
  province?: string
  gender?: 'M' | 'F'
  class_id?: number
}

export interface UpdateProfileRequest {
  name?: string
  contact?: string
  province?: string
  gender?: 'M' | 'F'
}

export interface UpdatePasswordRequest {
  old_password: string
  new_password: string
}

export interface ForgotPasswordRequest {
  email: string
  verification_code: string
  new_password: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}
