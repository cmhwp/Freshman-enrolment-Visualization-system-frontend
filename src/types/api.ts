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
    role: 'admin' | 'teacher' | 'student'
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

// 用户基础信息
export interface BaseUserProfile {
  id: number
  username: string
  email: string
  name: string
  province?: string
  gender?: 'M' | 'F'
  contact?: string
  role: 'student' | 'teacher' | 'admin'
  class_id?: number
}

// 教师特有信息
export interface TeacherProfile extends BaseUserProfile {
  teacher_profile?: {
    id: number
    department: string
    title?: string
    research_area?: string
  }
}

// 学生特有信息
export interface StudentProfile extends BaseUserProfile {
  student_profile?: {
    id: number
    student_id: string
    major: string
    admission_date?: string
    graduation_date?: string
    status: 'active' | 'graduated' | 'suspended'
  }
}

// 通用用户信息（联合类型）
export type UserProfile = TeacherProfile | StudentProfile

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

export interface CreateTeacherData {
  username: string
  email: string
  password: string
  name: string
  gender?: 'M' | 'F'
  province?: string
  teacher_profile: {
    department: string
    title?: string
    research_area?: string
  }
}
