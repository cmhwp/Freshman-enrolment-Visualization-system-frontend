import { defineStore } from 'pinia'

interface UserState {
  token: string
  userRole: string
  userName: string
  userId: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userRole: localStorage.getItem('userRole') || '',
    userName: localStorage.getItem('userName') || '',
    userId: localStorage.getItem('userId') || ''
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userRole === 'admin',
    isTeacher: (state) => state.userRole === 'teacher',
    isStudent: (state) => state.userRole === 'student'
  },

  actions: {
    setUserInfo(userInfo: Partial<UserState>) {
      if (userInfo.token) {
        this.token = userInfo.token
        localStorage.setItem('token', userInfo.token)
      }
      if (userInfo.userRole) {
        this.userRole = userInfo.userRole
        localStorage.setItem('userRole', userInfo.userRole)
      }
      if (userInfo.userName) {
        this.userName = userInfo.userName
        localStorage.setItem('userName', userInfo.userName)
      }
      if (userInfo.userId) {
        this.userId = userInfo.userId
        localStorage.setItem('userId', userInfo.userId)
      }
    },

    clearUserInfo() {
      this.token = ''
      this.userRole = ''
      this.userName = ''
      this.userId = ''

      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
      localStorage.removeItem('userId')
    }
  }
})
