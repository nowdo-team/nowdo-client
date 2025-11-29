<template>
  <h2>로그인</h2>
  <input v-model="email" placeholder="이메일" />
  <input v-model="password" type="password" placeholder="비밀번호" />
  <button @click="doLogin">로그인</button>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/user'
import { useAuthStore } from '../store/auth'

const email = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()

const doLogin = async () => {
  try {
    const res = await login({
      email: email.value,
      password: password.value
    })

    auth.setUser(res.data)

    alert('로그인 성공')
    router.push('/main')
  } catch (e) {
    console.error(e)
    alert('로그인 실패')
  }
}
</script>
