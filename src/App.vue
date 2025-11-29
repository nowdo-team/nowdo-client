<template>
  <NavBar />
  <router-view />
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import { onMounted } from 'vue'
import { useAuthStore } from './store/auth'
import { getMyInfo } from './api/user'

const auth = useAuthStore()

onMounted(async () => {
  try {
    const res = await getMyInfo()
    auth.setUser(res.data)   // ✅ 새로고침 시 로그인 복구
  } catch (e) {
    auth.clearUser()        // ✅ 세션 없으면 비로그인 유지
  }
})
</script>
