export const LOG_TYPES = {
  login: '用户登录',
  register: '用户注册',
  create_teacher: '创建教师',
  update_teacher: '更新教师信息',
  delete_teacher: '删除教师',
  create_class: '创建班级',
  update_class: '更新班级',
  update_student: '更新学生信息',
  update_profile: '更新个人信息',
  update_password: '修改密码',
  update_settings: '更新系统设置',
  view_scores: '查看成绩'
}

export type LogType = keyof typeof LOG_TYPES
