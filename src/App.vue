<template>
  <div class="app-shell">
    <NavBar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
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
    auth.setUser(res.data)
  } catch (e) {
    auth.clearUser()
  }
})
</script>
