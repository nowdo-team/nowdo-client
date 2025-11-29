<template>
  <nav style="padding: 12px; border-bottom: 1px solid #ccc;">
    <router-link to="/">로그인</router-link> |
    <router-link to="/register">회원가입</router-link> |
    <router-link to="/main">메인</router-link> |
    <router-link to="/mypage">마이페이지</router-link>

    <span v-if="auth.user" style="margin-left: 20px;">
      👤 {{ auth.user.nickname }} 님
    </span>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../store/auth'
const auth = useAuthStore()
</script>
