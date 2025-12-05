<template>
  <h2>회원가입</h2>
  <input v-model="email" type="email" placeholder="이메일" />
  <input v-model="nickname" placeholder="닉네임" />
  <input v-model="password" type="password" placeholder="비밀번호" />
  <button @click="doRegister">회원가입</button>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/user'

const email = ref('')
const nickname = ref('')
const password = ref('')
const router = useRouter()

const doRegister = async () => {
  await register({
    email: email.value,
    password: password.value,
    nickname: nickname.value
  })
  router.push('/')
}
</script>
