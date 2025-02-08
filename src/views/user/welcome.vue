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
            <statistic title="学生总数" :value="stats.studentCount">
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
            <statistic title="班级总数" :value="stats.classCount">
              <template #prefix>
                <apartment-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <statistic title="今日访问" :value="stats.todayVisits">
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
            <statistic title="管理班级数" :value="stats.managedClasses">
              <template #prefix>
                <team-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="学生总数" :value="stats.studentCount">
              <template #prefix>
                <user-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="待处理事项" :value="stats.todoCount">
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
            <statistic title="学号" :value="stats.student_profile?.student_id">
              <template #prefix>
                <idcard-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="专业" :value="stats.student_profile?.major">
              <template #prefix>
                <book-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <statistic title="学籍状态" :value="stats.student_profile?.status === 'active' ? '在读' : '已毕业'">
              <template #prefix>
                <solution-outlined />
              </template>
            </statistic>
          </a-card>
        </a-col>
      </template>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

const userStore = useUserStore()
const userRole = computed(() => userStore.userRole)
const userName = computed(() => userStore.userName)
const lastLoginTime = ref<string>('')

// 统计数据
const stats = ref({
  studentCount: 0,
  teacherCount: 0,
  classCount: 0,
  todayVisits: 0,
  managedClasses: 0,
  todoCount: 0,
  student_profile: {
    student_id: '',
    major: '',
    status: 'active'
  }
})

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
    // 获取统计概览
    const statsRes = await statsApi.getOverview()
    console.log(statsRes.data)
    if (statsRes.success) {
      stats.value = { ...stats.value, ...statsRes.data }
    }

    // 获取上次登录时间
    const loginRes = await statsApi.getLastLogin()
    if (loginRes.success && loginRes.data.lastLoginTime) {
      lastLoginTime.value = dayjs(loginRes.data.lastLoginTime).format('YYYY-MM-DD HH:mm:ss')
    }
  } catch (error) {
    message.error('获取统计数据失败')
  }
}

onMounted(() => {
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
</style>
