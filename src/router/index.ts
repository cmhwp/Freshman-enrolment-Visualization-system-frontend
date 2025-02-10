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
        //公共路由
        {
          path: '/welcome',
          name: 'welcome',
          component: () => import('@/views/user/welcome.vue'),
        },
        // 学生路由
        {
          path: 'student/scores',
          name: 'studentScores',
          component: () => import('@/views/student/ScoreView.vue'),
          meta: { role: 'student' }
        },
        {
          path: 'student/ranking',
          name: 'studentRanking',
          component: () => import('@/views/student/RankingView.vue'),
          meta: { role: 'student' }
        },

        // 教师路由
        {path: 'teacher',
          children: [
            {
              path: 'score-management',
              name: 'scoreManagement',
              component: () => import('../views/teacher/ScoreManagement.vue'),
              meta: { role: 'teacher' }
            },
            {
              path: 'class-management',
              name: 'ClassManagement',
              component: () => import('@/views/teacher/ClassManagement.vue'),
              meta: {
                title: '班级管理',
                requiresAuth: true,
                role: 'teacher'
              }
            }
          ]
        },
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

        // 管理员路由
        {
          path: 'admin',
          children: [
            {
              path: 'settings',
              name: 'systemSettings',
              component: () => import('@/views/admin/SystemSettings.vue'),
              meta: { role: 'admin' }
            },
            {
              path: 'student-list',
              name: 'adminStudentList',
              component: () => import('@/views/admin/StudentList.vue'),
              meta: { role: 'admin' }
            },
            {
              path: 'teacher-list',
              name: 'adminTeacherList',
              component: () => import('@/views/admin/TeacherList.vue'),
              meta: { role: 'admin' }
            },
            {
              path: 'create-teacher',
              name: 'CreateTeacher',
              component: () => import('@/views/admin/CreateTeacher.vue'),
              meta: {
                title: '创建教师',
                requiresAuth: true,
                roles: ['admin']
              }
            },
            {
              path: 'logs',
              name: 'adminLogs',
              component: () => import('../views/admin/SystemLogs.vue'),
              meta: { role: 'admin' }
            },
            {
              path: 'enrollment-stats',
              name: 'enrollmentStats',
              component: () => import('@/views/admin/EnrollmentStats.vue'),
              meta: { role: 'admin', title: '新生报到统计' }
            },
            {
              path: 'dormitory-management',
              name: 'dormitoryManagement',
              component: () => import('@/views/admin/DormitoryManagement.vue'),
              meta: { role: 'admin', title: '宿舍管理' }
            },
          ]
        },

        // 用户信息路由
        {
          path: 'user/profile',
          name: 'userProfile',
          component: UserInfoView
        },
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
    next('/welcome')
  } else {
    next()
  }
})

export default router
