<template>
  <section class="page auth-page">
    <div class="hero">
      <span class="pill tag-soft">NOWDO</span>
      <div class="hero-copy">
        <h1>가볍게 시작하는 오늘의 집중</h1>
        <p>해야 할 일을 한눈에 정리하고, 타이머로 몰입해 보세요. 미니멀한 화면에 필요한 정보만 담았습니다.</p>
      </div>
    </div>

    <div class="auth-card surface panel">
      <div class="section-title">
        <h2>로그인</h2>
        <span>계정으로 계속 진행</span>
      </div>
      <form class="stack" @submit.prevent="doLogin">
        <div class="field">
          <label for="email">이메일</label>
          <input id="email" v-model="email" class="input" type="email" placeholder="name@email.com" required />
        </div>
        <div class="field">
          <label for="password">비밀번호</label>
          <input id="password" v-model="password" class="input" type="password" placeholder="••••••••" required />
        </div>
        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
      <p class="muted helper">
        아직 계정이 없나요?
        <router-link to="/register">회원가입</router-link>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/user'
import { useAuthStore } from '../store/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

const doLogin = async () => {
  loading.value = true
  try {
    const res = await login({
      email: email.value,
      password: password.value
    })

    auth.setUser(res.data)
    router.push('/main')
  } catch (e) {
    console.error(e)
    alert('로그인에 실패했습니다. 입력 정보를 다시 확인해주세요.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: center;
  position: relative;
  padding: clamp(20px, 5vw, 40px);
  border-radius: 32px;
  overflow: hidden;
  background-image: linear-gradient(rgba(14, 32, 127, 0.55), rgba(14, 32, 127, 0.35)),
    url('../assets/sumongi-bg.jpg');
  background-size: cover;
  background-position: center;
  color: #fff;
}

.auth-page > * {
  position: relative;
  z-index: 1;
}

.hero {
  display: grid;
  gap: 12px;
  color: #fff;
  text-shadow: 0 8px 24px rgba(11, 18, 74, 0.5);
}

.auth-card {
  width: min(420px, 100%);
  justify-self: end;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: var(--text);
}

.helper {
  margin-top: 8px;
}

.helper a {
  font-weight: 700;
  color: var(--accent-strong);
}

@media (max-width: 760px) {
  .auth-card {
    justify-self: stretch;
  }
}
</style>
