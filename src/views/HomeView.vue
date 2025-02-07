<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">
        <VueLogo v-if="!collapsed" class="logo-img" />
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item key="dashboard">
          <template #icon>
            <dashboard-outlined />
          </template>
          <span>仪表盘</span>
        </a-menu-item>

        <!-- 学生菜单 -->
        <template v-if="userRole === 'student'">
          <a-menu-item key="student/scores">
            <template #icon>
              <bar-chart-outlined />
            </template>
            <span>成绩查询</span>
          </a-menu-item>
          <a-menu-item key="student/ranking">
            <template #icon>
              <trophy-outlined />
            </template>
            <span>排名分析</span>
          </a-menu-item>
        </template>

        <!-- 教师菜单 -->
        <template v-if="userRole === 'teacher'">
          <a-sub-menu key="class">
            <template #icon>
              <team-outlined />
            </template>
            <template #title>班级管理</template>
            <a-menu-item key="teacher/class-list">班级列表</a-menu-item>
            <a-menu-item key="teacher/score-management">成绩管理</a-menu-item>
          </a-sub-menu>
          <a-menu-item key="teacher/statistics">
            <template #icon>
              <line-chart-outlined />
            </template>
            <span>统计分析</span>
          </a-menu-item>
        </template>

        <!-- 管理员菜单 -->
        <template v-if="userRole === 'admin'">
          <a-sub-menu key="user">
            <template #icon>
              <user-outlined />
            </template>
            <template #title>用户管理</template>
            <a-menu-item key="admin/student-list">学生管理</a-menu-item>
            <a-menu-item key="admin/teacher-list">教师管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system">
            <template #icon>
              <setting-outlined />
            </template>
            <template #title>系统管理</template>
            <a-menu-item key="admin/settings">系统设置</a-menu-item>
            <a-menu-item key="admin/logs">操作日志</a-menu-item>
          </a-sub-menu>
        </template>

        <a-menu-item key="user/profile">
          <template #icon>
            <user-outlined />
          </template>
          <span>个人信息</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <div class="header-content">
          <div class="header-left">
            <menu-fold-outlined
              v-if="collapsed"
              class="trigger"
              @click="() => (collapsed = !collapsed)"
            />
            <menu-unfold-outlined
              v-else
              class="trigger"
              @click="() => (collapsed = !collapsed)"
            />
          </div>
          <div class="header-right">
            <a-dropdown>
              <a class="user-dropdown" @click.prevent>
                <user-outlined />
                <span class="username">{{ userName }}</span>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile" @click="handleMenuClick({ key: 'user/profile' })">
                    <user-outlined />
                    个人信息
                  </a-menu-item>
                  <a-menu-item key="logout" @click="handleLogout">
                    <logout-outlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content style="margin: 16px">
        <router-view></router-view>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        新生入学可视化系统 ©2024 Created by Your Team
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { VueLogo } from '@/components/icons'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const collapsed = ref<boolean>(false)
const selectedKeys = ref<string[]>(['dashboard'])
const userRole = computed(() => userStore.userRole)
const userName = computed(() => userStore.userName)

// 处理菜单点击
const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  router.push(`/${key}`)
}

const handleLogout = () => {
  userStore.clearUserInfo()
  message.success('已退出登录')
  router.push('/login')
}

// 根据当前路由设置选中的菜单项
onMounted(() => {
  const path = router.currentRoute.value.path.slice(1) // 移除开头的 /
  if (path) {
    selectedKeys.value = [path]
  }
})
</script>

<style scoped lang="less">
.logo {
  height: 32px;
  margin: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  .logo-img {
    height: 32px;
    width: 32px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 100%;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
}

.header-right {
  .user-dropdown {
    display: flex;
    align-items: center;
    color: rgba(0, 0, 0, 0.85);

    .username {
      margin-left: 8px;
    }

    &:hover {
      color: #1890ff;
    }
  }
}

:deep(.ant-layout-header) {
  padding: 0;
  background: #fff;
}

:deep(.ant-layout-content) {
  background: #fff;
  padding: 24px;
  margin: 16px;
  min-height: 280px;
  border-radius: 4px;
}
</style>
