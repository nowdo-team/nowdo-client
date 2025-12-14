<template>
  <section class="page auth-page">
    <div class="hero">
      <span class="pill tag-soft">Welcome</span>
      <div class="hero-copy">
        <h1>NOWDO에 처음 오셨나요?</h1>
        <p>간결한 워크플로우에 필요한 정보만 담았습니다. 몇 초면 계정을 만들 수 있어요.</p>
      </div>
    </div>

    <div class="auth-card surface panel">
      <div class="section-title">
        <h2>회원가입</h2>
        <span>기본 정보로 시작</span>
      </div>
      <form class="stack" @submit.prevent="doRegister">
        <div class="field">
          <label for="email">이메일</label>
          <input id="email" v-model="email" class="input" type="email" placeholder="name@email.com" required />
        </div>
        <div class="field">
          <label for="nickname">닉네임</label>
          <input id="nickname" v-model="nickname" class="input" placeholder="어떻게 불러드릴까요?" required />
        </div>
        <div class="field">
          <label for="password">비밀번호</label>
          <input id="password" v-model="password" class="input" type="password" placeholder="8자 이상 입력" required />
        </div>
        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? '가입 중...' : '가입하기' }}
        </button>
      </form>
      <p class="muted helper">
        이미 계정이 있다면
        <router-link to="/">로그인</router-link>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/user'

const email = ref('')
const nickname = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

const doRegister = async () => {
  loading.value = true
  try {
    await register({
      email: email.value,
      password: password.value,
      nickname: nickname.value
    })
    alert('가입이 완료되었습니다! 로그인 해주세요.')
    router.push('/')
  } catch (error) {
    console.error(error)
    alert('가입에 실패했습니다. 정보를 확인해주세요.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: center;
}

.hero {
  display: grid;
  gap: 12px;
}

.auth-card {
  width: min(420px, 100%);
  justify-self: end;
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