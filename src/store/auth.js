import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true   // ✅ 로그인 복구 중인지 여부
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
