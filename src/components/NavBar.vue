<template>
  <nav class="nav-bar surface glass">
    <div class="nav-inner">
      <router-link to="/main" class="brand">
        <span class="brand-dot"></span>
        <span>Nowdo</span>
      </router-link>

      <div class="nav-links">
        <router-link v-if="!auth.user" to="/">로그인</router-link>
        <router-link v-if="!auth.user" to="/register">가입하기</router-link>
        <router-link to="/main">할 일</router-link>
        <router-link to="/mypage">프로필</router-link>
      </div>

      <div class="nav-actions">
        <div
          v-if="auth.user"
          class ="avatar-sm">
          <img
            :src="avatarSrc"
            @error="e => (e.target.src = defaultAvatar)"
            alt="profile"
          />
        </div>
        <span v-if="auth.user" class="user-chip">안녕하세요, {{ auth.user.nickname }}님</span>
        <button v-if="auth.user" class="btn ghost" type="button" @click="handleLogout">로그아웃</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '../api/user'
import { useAuthStore } from '../store/auth'
import defaultAvatar from '../assets/default-avatar.svg'
import { resolveProfileImage } from '../utils/image'


const auth = useAuthStore()
const router = useRouter()
const avatarSrc = computed(() => resolveProfileImage(auth.user?.profileImg) || defaultAvatar)

const handleLogout = async () => {
  try {
    await logout()
  } finally {
    auth.clearUser()
    router.push('/')
  }
}
</script>

<style scoped>
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 0 clamp(16px, 4vw, 48px);
  padding: 14px clamp(16px, 3vw, 26px);
}

.nav-inner {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 18px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.02em;
  color: var(--text);
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 0 0 6px rgba(14, 32, 127, 0.18);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-links a {
  padding: 8px 12px;
  border-radius: 10px;
  color: var(--text);
  font-weight: 600;
  transition: background 150ms ease, color 150ms ease;
}

.nav-links a.router-link-active {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

.user-chip {
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.btn {
  height: 40px;
}

.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;

  border: 1px solid var(--border);
  background: #d9d9d9;

  display: flex;
  align-items: center;
  justify-content: center;
  
  cursor: pointer;
}

.avatar-sm img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}


@media (max-width: 760px) {
  .nav-inner {
    grid-template-columns: 1fr;
    justify-items: start;
  }
  .nav-links {
    width: 100%;
    justify-content: flex-start;
  }
  .nav-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
