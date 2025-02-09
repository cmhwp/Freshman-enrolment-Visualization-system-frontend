import dayjs from 'dayjs'

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
    id: number
    student_id: string
    major: string
    admission_date?: string
    graduation_date?: string
    status: 'pending' | 'reported' | 'unreported'
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

export interface SystemSettings {
  systemName: string
  version: string
  allowRegister: boolean
  requireEmailVerification: boolean
  studentIdPrefix: string
  defaultStudentStatus: string
  majors: string[]
  departments: string[]
  enrollmentDeadline: dayjs.Dayjs | null
}

export interface UpdateSettingsResponse {
  success: boolean
  message: string
}

export interface GetSettingsResponse {
  success: boolean
  data: SystemSettings
}

// 新生报到统计
export interface EnrollmentStats {
  totalCount: number
  reportedCount: number
  unreportedCount: number
  reportRate: number
  byMajor: Array<{
    major: string
    total: number
    reported: number
    rate: number
  }>
  byProvince: Array<{
    province: string
    count: number
    percentage: number
  }>
}

// 宿舍相关类型定义
export interface DormitoryBuilding {
  id: number
  name: string
  gender: 'M' | 'F'
  description?: string
  roomCount: number
}

export interface DormitoryRoom {
  id: number
  roomNumber: string
  buildingId: number
  buildingName: string
  capacity: number
  description?: string
  occupancy: number
}

export interface DormitoryAssignment {
  id: number
  studentId: number
  roomId: number
  checkInDate: string
  checkOutDate?: string
  status: 'active' | 'inactive'
}

export interface RoomStudent {
  id: number
  name: string
  studentId: string
  major: string
  gender: string
  assignmentId: number
}

export interface RoomDetails {
  id: number
  buildingId: number
  roomNumber: string
  building: string
  room: string
  capacity: number
  occupancy: number
  students: RoomStudent[]
}

// API 响应类型
export interface GetBuildingsResponse {
  success: boolean
  data: DormitoryBuilding[]
}

export interface GetRoomsResponse {
  success: boolean
  data: DormitoryRoom[]
}

export interface GetRoomDetailsResponse {
  success: boolean
  data: RoomDetails
}

export interface CreateBuildingRequest {
  name: string
  gender: 'M' | 'F'
  description?: string
}

export interface CreateRoomRequest {
  roomNumber: string
  buildingId: number
  capacity?: number
  description?: string
}

export interface AssignRoomRequest {
  studentId: number
  roomId: number
}

export interface GetUnassignedStudentsResponse {
  success: boolean
  data: StudentProfile[]
}
export interface DormitoryStats {
  total: number
  occupied: number
  available: number
}
export interface StatsOverview {
  studentStats: {
    total: number
    reported: number
    unreported: number
    pending: number
  }
  teacherCount: number
  dormitoryStats: DormitoryStats
  majorDistribution: Array<{
    major: string
    count: number
  }>
  provinceDistribution: Array<{
    province: string
    count: number
  }>
  studentDetails: Array<{
    province: string
    major: string
    studentId: string
    name: string
    gender: string
    status: string
    count: number
  }>
  stats: {
    studentCount: number
    teacherCount: number
    classCount: number
    todayVisits: number
    student_profile?: {
      student_id: string
      major: string
      status: string
      report_time: string
    }
    managedClasses?: number
    todoCount?: number
  }
}
