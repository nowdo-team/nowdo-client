<template>
  <h2>회원가입</h2>
  <input v-model="email" placeholder="이메일" />
  <input v-model="password" placeholder="비밀번호" />
  <button @click="doRegister">가입</button>
</template>

<script setup>
import { ref } from 'vue'
import { register } from '../api/user'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const doRegister = async () => {
  await register({ email: email.value, password: password.value })
  router.push('/')
}
</script>
