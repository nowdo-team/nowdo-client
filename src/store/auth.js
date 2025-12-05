import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true // 초기 로그인 상태 확인 중
  }),
  actions: {
    setUser(user) {
      this.user = user
      this.loading = false
    },
    clearUser() {
      this.user = null
      this.loading = false
    }
  }
})
