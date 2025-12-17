import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true, // 초기 로그인 상태 확인 중
    profileVerified: false
  }),
  actions: {
    setUser(user) {
      this.user = user
      this.loading = false
      this.profileVerified = false
    },
    updateUser(partial) {
      this.user = {
        ...(this.user || {}),
        ...partial
      }
    },
    clearUser() {
      this.user = null
      this.loading = false
      this.profileVerified = false
    },
    setProfileVerified(value) {
      this.profileVerified = value
    }
  }
})
