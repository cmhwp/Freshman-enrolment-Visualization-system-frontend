<template>
  <div class="welcome">
    <a-row :gutter="24">
      <!-- 欢迎卡片 -->
      <a-col :span="24">
        <a-card class="welcome-card">
          <template #cover>
            <div class="welcome-header">
              <h1>欢迎使用新生入学可视化系统</h1>
              <p>{{ getWelcomeMessage() }}</p>
            </div>
          </template>
          <a-card-meta>
            <template #description>
              <p>上次登录时间：{{ lastLoginTime || '首次登录' }}</p>
            </template>
          </a-card-meta>
        </a-card>
      </a-col>

      <!-- 统计卡片 -->
      <template v-if="userRole === 'admin'">
        <a-col :span="6">
          <a-card class="stat-card">
            <statistic title="学生总数" :value="stats.studentStats.total">
              <template #prefix>
                <user-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <statistic title="教师总数" :value="stats.teacherCount">
              <template #prefix>
                <team-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <statistic title="班级总数" :value="stats.stats.classCount">
              <template #prefix>
                <apartment-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <statistic title="今日访问" :value="stats.stats.todayVisits">
              <template #prefix>
                <eye-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
      </template>

      <!-- 教师视图 -->
      <template v-if="userRole === 'teacher'">
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="管理班级数" :value="stats.stats.managedClasses">
              <template #prefix>
                <team-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="管理学生数" :value="stats.stats.managedStudents">
              <template #prefix>
                <user-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="待处理事项" :value="stats.stats.todoCount">
              <template #prefix>
                <notification-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
      </template>

      <!-- 学生视图 -->
      <template v-if="userRole === 'student'">
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="学号" :value="stats.stats.student_profile?.student_id">
              <template #prefix>
                <idcard-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="专业" :value="stats.stats.student_profile?.major">
              <template #prefix>
                <book-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic
              title="报到状态"
              :value="getStatusText(stats.stats.student_profile?.status || 'unreported')"
              :value-style="{ color: getStatusColor(stats.stats.student_profile?.status || 'unreported') }"
            >
              <template #prefix>
                <solution-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
      </template>

      <!-- 报到卡片 -->
      <a-card v-if="userRole === 'student'" class="report-card">
        <template #title>
          <span>新生报到</span>
        </template>
        <div class="report-status">
          <a-alert
            v-if="studentInfo.status === 'pending'"
            message="待报到"
            description="请在规定时间内完成报到"
            type="info"
            show-icon
          />
          <a-alert
            v-else-if="studentInfo.status === 'unreported'"
            message="您未按时报到"
            description="请联系辅导员处理"
            type="error"
            show-icon
          />
          <a-alert
            v-else-if="studentInfo.status === 'reported'"
            message="您已完成报到"
            :description="`报到时间：${dayjs(studentInfo.report_time).format('YYYY-MM-DD HH:mm:ss')}`"
            type="success"
            show-icon
          />
        </div>

        <a-button
          v-if="studentInfo.status === 'pending'"
          type="primary"
          :loading="reporting"
          @click="handleReport"
        >
          立即报到
        </a-button>
      </a-card>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue'
import { Statistic } from 'ant-design-vue'
import {
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
  EyeOutlined,
  NotificationOutlined,
  BookOutlined,
  IdcardOutlined,
  SolutionOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores'
import { statsApi } from '@/api/stats'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { studentApi } from '@/api/student'
import type { StatsOverview } from '@/types/api'
import { watch } from 'vue'
const userStore = useUserStore()
const userRole = computed(() => userStore.userRole)
const userName = computed(() => userStore.userName)
const lastLoginTime = ref<string>('')
dayjs.extend(utc)
dayjs.extend(timezone)

// 统计数据
const stats = ref<StatsOverview>({
  studentStats: {
    total: 0,
    reported: 0,
    unreported: 0,
    pending: 0
  },
  teacherCount: 0,
  dormitoryStats: {
    total: 0,
    occupied: 0,
    available: 0
  },
  majorDistribution: [],
  provinceDistribution: [],
  studentDetails: [],
  stats: {
    studentCount: 0,
    teacherCount: 0,
    classCount: 0,
    todayVisits: 0,
    student_profile: {
      student_id: '',
      major: '',
      status: 'unreported', // pending-待报到, reported-已报到, unreported-未报到
      report_time: ''
    },
    managedClasses: 0,
    managedStudents: 0,
    todoCount: 0
  }
})

const reporting = ref(false)

// 学生信息
const studentInfo = ref({
  status: 'unreported',
  report_time: ''
})

// 检查报到状态并提醒
const checkReportStatus = () => {
  if (userRole.value === 'student') {
    if (stats.value.stats.student_profile?.status === 'pending') {
      message.warning({
        content: '您尚未完成报到，请尽快报到！',
        duration: 5,
        key: 'report_reminder'
      })
    } else if (stats.value.stats.student_profile?.status === 'unreported') {
      message.error({
        content: '您未按时报到，请联系辅导员处理！',
        duration: 5,
        key: 'report_reminder'
      })
    }
  }
}

// 获取欢迎消息
const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  let timeMsg = ''
  if (hour < 6) timeMsg = '凌晨好'
  else if (hour < 9) timeMsg = '早上好'
  else if (hour < 12) timeMsg = '上午好'
  else if (hour < 14) timeMsg = '中午好'
  else if (hour < 17) timeMsg = '下午好'
  else if (hour < 19) timeMsg = '傍晚好'
  else timeMsg = '晚上好'
  return `${timeMsg}，${userName.value}！`
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const statsRes = await statsApi.getOverview()
    if (statsRes.success) {
      stats.value = { ...stats.value, ...statsRes.data }
      // 获取数据后检查报到状态
      checkReportStatus()
    }

    // 获取上次登录时间
    const loginRes = await statsApi.getLastLogin()
    console.log(loginRes)
    if (loginRes.success && loginRes.data.lastLoginTime) {
      lastLoginTime.value = dayjs(loginRes.data.lastLoginTime).format('YYYY-MM-DD HH:mm:ss')
    }
  } catch (error) {
    message.error('获取统计数据失败')
  }
}

// 获取学生信息
const fetchStudentInfo = async () => {
  try {
    const res = await statsApi.getOverview()
    console.log(res)
    if (res.success) {
      studentInfo.value = {
        status: res.data.stats.student_profile?.status || 'unreported',
        report_time: res.data.stats.student_profile?.report_time || ''
      }
    }
    console.log(dayjs(studentInfo.value.report_time).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'))
  } catch (error) {
    message.error('获取学生信息失败')
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待报到',
    reported: '已报到',
    unreported: '未报到'
  }
  return textMap[status] || status
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: '#1890ff',    // 蓝色
    reported: '#52c41a',   // 绿色
    unreported: '#ff4d4f'  // 红色
  }
  return colorMap[status] || '#d9d9d9'
}

// 监听报到状态
watch(() => studentInfo.value.status, (newStatus) => {
  if (newStatus === 'reported') {
    fetchStudentInfo()
  }
})


// 处理报到
const handleReport = async () => {
  if (studentInfo.value.status === 'reported') return

  reporting.value = true
  try {
    const res = await studentApi.report()
    if (res.success) {
      message.success('报到成功')
      // 更新状态
      studentInfo.value.status = 'reported'
      studentInfo.value.report_time = new Date().toISOString()
      // 刷新数据
      await fetchStats()
    }
  } catch (error: any) {
    message.error(error.message || '报到失败')
  } finally {
    reporting.value = false
  }
}
onMounted(() => {
  fetchStudentInfo()
  fetchStats()
})
</script>

<style scoped>
.welcome {
  padding: 24px;
}

.welcome-card {
  margin-bottom: 24px;
}

.welcome-header {
  padding: 48px;
  text-align: center;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
}

.welcome-header h1 {
  color: white;
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
}

:deep(.ant-statistic-title) {
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
}

.report-card {
  margin-top: 24px;

  .report-status {
    margin-bottom: 24px;
  }
}
</style>
