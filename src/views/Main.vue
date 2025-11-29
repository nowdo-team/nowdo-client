<template>
  <div style="padding: 32px;">
    <h1>NOWDO 대시보드</h1>

    <div style="margin-top: 24px; display: flex; gap: 16px;">
      <div class="card">
        <h3>내 정보</h3>
        <p>닉네임: {{ auth.user?.nickname }}</p>
        <p>이메일: {{ auth.user?.email }}</p>
      </div>

      <div class="card">
        <h3>계정 상태</h3>
        <p>상태: {{ auth.user?.status }}</p>
      </div>

      <div class="card">
        <h3>빠른 메뉴</h3>
        <router-link to="/mypage">마이페이지 이동</router-link><br/>
        <button @click="doLogout">로그아웃</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { logout } from '../api/user'

const router = useRouter()
const auth = useAuthStore()

const doLogout = async () => {
  await logout()
  auth.clearUser()
  router.push('/')
}
</script>

<style scoped>
.card {
  width: 220px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}
</style>
