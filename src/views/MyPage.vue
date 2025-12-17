<template>
  <section class="page stack">
    <div class="section-title">
      <h2>프로필</h2>
      <span>나의 계정 정보를 관리하세요</span>
    </div>

    <div v-if="!isVerified" class="surface panel verify-panel">
      <h3>보안을 위해 비밀번호를 확인해주세요</h3>
      <p>프로필 정보에 접근하기 전에 현재 비밀번호를 한번 더 확인합니다.</p>
      <form class="stack verify-form" @submit.prevent="verifyAccess">
        <div class="field">
          <label for="verifyPassword">비밀번호</label>
          <input
            id="verifyPassword"
            v-model="verificationPassword"
            class="input"
            type="password"
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
        </div>
        <p v-if="verificationError" class="error">{{ verificationError }}</p>
        <div class="actions">
          <button class="btn primary" type="submit" :disabled="verifying">
            {{ verifying ? '확인 중...' : '접근 허용' }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="surface panel profile-grid">
      <div class="intro">
        <p class="pill tag-soft">Account</p>
        <div class="avatar-wrap">
          <div class="avatar">
            <img
              :src="profileImageSrc"
              @error="e => (e.target.src = defaultAvatar)"
              alt="프로필 이미지"
            />
          </div>
        </div>
        <div class="hero-copy">
          <h3>{{ user?.nickname || '사용자' }}님의 공간</h3>
          <p>연결된 이메일, 닉네임, 프로필 이미지를 깔끔하게 관리할 수 있습니다.</p>
        </div>
        <button class="btn ghost" type="button" @click="load" :disabled="profileLoading">내 정보 새로고침</button>
      </div>

      <form class="stack form" @submit.prevent="submitProfile">
        <div>
          <h3>계정 정보 관리</h3>
          <p class="muted">이메일, 닉네임, 프로필 이미지와 비밀번호를 한 번에 관리하세요.</p>
        </div>
        <div class="field">
          <label for="email">이메일</label>
          <input id="email" class="input" type="email" :value="user?.email || ''" readonly />
        </div>
        <div class="field">
          <label for="nickname">닉네임</label>
          <input id="nickname" v-model="nickname" class="input" placeholder="닉네임을 입력하세요" required />
        </div>
        <div class="field">
          <label for="profileImg">프로필 이미지 URL</label>
          <input id="profileImg" v-model="profileImg" class="input" placeholder="https://example.com/avatar.png" />
        </div>

        <div class="divider"></div>

        <div>
          <h4>비밀번호 변경 (선택)</h4>
          <p class="muted">비밀번호를 변경하지 않으려면 아래 필드를 비워두세요.</p>
        </div>
        <div class="field">
          <label for="currentPassword">현재 비밀번호</label>
          <input
            id="currentPassword"
            v-model="currentPassword"
            class="input"
            type="password"
            placeholder="현재 비밀번호"
          />
        </div>
        <div class="field">
          <label for="newPassword">새 비밀번호</label>
          <input
            id="newPassword"
            v-model="newPassword"
            class="input"
            type="password"
            minlength="6"
            maxlength="20"
            placeholder="6자 이상으로 입력하세요"
          />
        </div>
        <div class="field">
          <label for="confirmPassword">새 비밀번호 확인</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            class="input"
            type="password"
            placeholder="새 비밀번호를 다시 입력하세요"
          />
        </div>
        <p v-if="passwordError" class="error">{{ passwordError }}</p>
        <div class="actions">
          <button class="btn primary" type="submit" :disabled="saving">
            {{ saving ? '저장 중...' : '변경사항 저장' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { changePassword, getMyInfo, updateProfile, verifyProfilePassword } from '../api/user'
import { useAuthStore } from '../store/auth'
import defaultAvatar from '../assets/default-avatar.svg'
import { resolveProfileImage } from '../utils/image'

const auth = useAuthStore()
const user = ref(null)
const nickname = ref('')
const profileImg = ref('')
const profileLoading = ref(false)
const saving = ref(false)
const verificationPassword = ref('')
const verifying = ref(false)
const verificationError = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

const isVerified = computed(() => auth.profileVerified)
const isPasswordSectionDirty = computed(
  () =>
    currentPassword.value.trim().length > 0 ||
    newPassword.value.trim().length > 0 ||
    confirmPassword.value.trim().length > 0
)
const profileImageSrc = computed(() => resolveProfileImage(profileImg.value) || defaultAvatar)

const load = async () => {
  if (!isVerified.value) {
    return
  }
  try {
    profileLoading.value = true
    const res = await getMyInfo()
    user.value = res.data
    nickname.value = user.value.nickname || ''
    profileImg.value = user.value.profileImg || ''
    auth.updateUser(res.data)
  } catch (err) {
    if (err.response?.status === 401) {
      auth.setProfileVerified(false)
      verificationError.value = '세션이 만료되었습니다. 다시 비밀번호를 확인해주세요.'
    } else {
      alert('내 정보를 불러오지 못했습니다.')
    }
  } finally {
    profileLoading.value = false
  }
}

const verifyAccess = async () => {
  verificationError.value = ''
  verifying.value = true
  try {
    await verifyProfilePassword({ password: verificationPassword.value })
    auth.setProfileVerified(true)
    verificationPassword.value = ''
    await load()
  } catch (err) {
    if (err.response?.status === 401) {
      verificationError.value = err.response?.data?.message || '비밀번호가 일치하지 않습니다.'
    } else {
      verificationError.value = '인증 중 오류가 발생했습니다. 다시 시도해주세요.'
    }
  } finally {
    verifying.value = false
  }
}

const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

const submitProfile = async () => {
  if (!isVerified.value) {
    verificationError.value = '비밀번호 확인 후 다시 시도해주세요.'
    return
  }

  passwordError.value = ''

  if (isPasswordSectionDirty.value) {
    if (!currentPassword.value) {
      passwordError.value = '현재 비밀번호를 입력해주세요.'
      return
    }

    if (newPassword.value.length < 6) {
      passwordError.value = '새 비밀번호는 6자 이상이어야 합니다.'
      return
    }

    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = '새 비밀번호와 확인 값이 일치하지 않습니다.'
      return
    }
  }

  const hasPasswordUpdate = isPasswordSectionDirty.value
  saving.value = true

  try {
    await updateProfile({
      nickname: nickname.value,
      profileImg: profileImg.value
    })
  } catch (err) {
    if (err.response?.status === 401) {
      verificationError.value = '세션이 만료되었습니다. 다시 인증해주세요.'
      auth.setProfileVerified(false)
    } else {
      alert('프로필을 수정하지 못했습니다.')
    }
    saving.value = false
    return
  }

  if (hasPasswordUpdate) {
    try {
      await changePassword({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      })
      resetPasswordForm()
    } catch (err) {
      if (err.response?.status === 401) {
        verificationError.value = '세션이 만료되었습니다. 다시 인증해주세요.'
        auth.setProfileVerified(false)
      } else {
        passwordError.value = err.response?.data?.message || '비밀번호를 변경하지 못했습니다.'
      }
      saving.value = false
      return
    }
  }

  alert(hasPasswordUpdate ? '계정 정보와 비밀번호가 업데이트되었습니다.' : '프로필이 업데이트되었습니다.')
  await load()
  saving.value = false
}

if (isVerified.value) {
  load()
}
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: start;
}

.intro {
  display: grid;
  gap: 12px;
}

.form .actions {
  display: flex;
  justify-content: flex-end;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #eee;
  background-color: #eaeaea;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-wrap {
  display: flex;
  justify-content: center;
}

.verify-panel {
  max-width: 520px;
  margin: 0 auto;
}

.verify-form .actions {
  display: flex;
  justify-content: flex-end;
}

.error {
  color: #dc2626;
  font-size: 0.9rem;
}

.muted {
  margin-top: 4px;
  color: #6b7280;
  font-size: 0.9rem;
}

.divider {
  border-top: 1px solid #e5e7eb;
  margin: 12px 0;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
