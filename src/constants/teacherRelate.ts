import { teacherApi } from '@/api/teacher'

const res = await teacherApi.getOptions()
export const departments = res.data.departments
export const majors = res.data.majors
export const titles = [
  '教授',
  '副教授',
  '讲师',
  '助教'
] as const

export const researchAreas = [
  '人工智能',
  '计算机视觉',
  '机器学习',
  '数据挖掘',
  '网络安全',
  '软件工程',
  '分布式系统',
  '云计算',
  '物联网',
  '嵌入式系统',
  '生物信息学',
  '计算数学',
  '应用数学',
  '统计学',
  '外语教学',
  '法学理论',
  '经济学',
  '艺术理论',
  '教育学',
  '体育学',
  '马克思主义理论',
  '国际关系',
  '科学技术史'
] as const
