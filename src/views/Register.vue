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
          <div class="email-input-row">
            <input
              id="email"
              v-model="email"
              class="input"
              type="email"
              placeholder="name@email.com"
              required
            />
            <button type="button" class="btn ghost" @click="checkEmail" :disabled="checkingEmail">
              {{ checkingEmail ? '확인 중...' : '중복 확인' }}
            </button>
          </div>
          <p v-if="emailCheckMessage" class="email-check-message" :class="emailAvailable ? 'success' : 'error'">
            {{ emailCheckMessage }}
          </p>
        </div>
        <div class="field">
          <label for="nickname">닉네임</label>
          <input id="nickname" v-model="nickname" class="input" placeholder="어떻게 불러드릴까요?" required />
        </div>
        <div class="field">
          <label for="password">비밀번호</label>
          <input id="password" v-model="password" class="input" type="password" placeholder="8자 이상 입력" required />
        </div>
        <button class="btn primary" type="submit" :disabled="loading || !emailAvailable">
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/user'
import http from '../api/http'

const email = ref('')
const nickname = ref('')
const password = ref('')
const loading = ref(false)
const checkingEmail = ref(false)
const emailAvailable = ref(false)
const emailCheckMessage = ref('')
const router = useRouter()

watch(email, () => {
  emailAvailable.value = false
  emailCheckMessage.value = ''
})

const doRegister = async () => {
  if (!emailAvailable.value) {
    alert('이메일 중복 확인을 먼저 완료해주세요.')
    return
  }

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

const checkEmail = async () => {
  if (!email.value) {
    emailCheckMessage.value = '이메일을 입력해주세요.'
    emailAvailable.value = false
    return
  }

  checkingEmail.value = true
  try {
    const { data } = await http.get('/users/check-email', {
      params: { email: email.value }
    })
    if (data.available) {
      emailAvailable.value = true
      emailCheckMessage.value = '사용 가능한 이메일입니다.'
    } else {
      emailAvailable.value = false
      emailCheckMessage.value = '이미 사용 중인 이메일입니다.'
    }
  } catch (error) {
    console.error(error)
    emailAvailable.value = false
    emailCheckMessage.value = '이메일 확인 중 오류가 발생했습니다.'
  } finally {
    checkingEmail.value = false
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

.email-input-row {
  display: flex;
  gap: 8px;
}

.email-input-row .btn {
  white-space: nowrap;
  padding-inline: 16px;
}

.email-check-message {
  margin-top: 6px;
  font-size: 14px;
}

.email-check-message.success {
  color: var(--accent-strong);
}

.email-check-message.error {
  color: var(--warning-strong, #d93025);
}

@media (max-width: 760px) {
  .auth-card {
    justify-self: stretch;
  }
}
</style>
