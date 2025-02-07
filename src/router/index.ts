import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserInfoView from '../views/user/userInfoView.vue'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
      children: [
        // // 学生路由
        // {
        //   path: 'student/scores',
        //   name: 'studentScores',
        //   component: () => import('../views/student/ScoresView.vue'),
        //   meta: { role: 'student' }
        // },
        // {
        //   path: 'student/ranking',
        //   name: 'studentRanking',
        //   component: () => import('../views/student/RankingView.vue'),
        //   meta: { role: 'student' }
        // },

        // // 教师路由
        // {
        //   path: 'teacher/class-list',
        //   name: 'teacherClassList',
        //   component: () => import('../views/teacher/ClassListView.vue'),
        //   meta: { role: 'teacher' }
        // },
        // {
        //   path: 'teacher/score-management',
        //   name: 'teacherScoreManagement',
        //   component: () => import('../views/teacher/ScoreManagementView.vue'),
        //   meta: { role: 'teacher' }
        // },
        // {
        //   path: 'teacher/statistics',
        //   name: 'teacherStatistics',
        //   component: () => import('../views/teacher/StatisticsView.vue'),
        //   meta: { role: 'teacher' }
        // },

        // // 管理员路由
        // {
        //   path: 'admin/student-list',
        //   name: 'adminStudentList',
        //   component: () => import('../views/admin/StudentListView.vue'),
        //   meta: { role: 'admin' }
        // },
        // {
        //   path: 'admin/teacher-list',
        //   name: 'adminTeacherList',
        //   component: () => import('../views/admin/TeacherListView.vue'),
        //   meta: { role: 'admin' }
        // },
        // {
        //   path: 'admin/settings',
        //   name: 'adminSettings',
        //   component: () => import('../views/admin/SettingsView.vue'),
        //   meta: { role: 'admin' }
        // },
        // {
        //   path: 'admin/logs',
        //   name: 'adminLogs',
        //   component: () => import('../views/admin/LogsView.vue'),
        //   meta: { role: 'admin' }
        // },

        // 用户信息路由
        {
          path: 'user/profile',
          name: 'userProfile',
          component: UserInfoView
        }
      ]
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue')
    }
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.role && to.meta.role !== userStore.userRole) {
    next('/')
  } else {
    next()
  }
})

export default router
