<template>
  <section class="page stack">
    <div class="section-title">
      <h2>프로필</h2>
      <span>나의 계정 정보를 관리하세요</span>
    </div>

    <div class="surface panel profile-grid">
      <div class="intro">
        <p class="pill tag-soft">Account</p>
        <div class="hero-copy">
          <h3>{{ user?.nickname || '사용자' }}님의 공간</h3>
          <p>연결된 이메일, 닉네임, 프로필 이미지를 깔끔하게 관리할 수 있습니다.</p>
        </div>
        <button class="btn ghost" type="button" @click="load">내 정보 새로고침</button>
      </div>

      <form class="stack form" @submit.prevent="update">
        <div class="field">
          <label>이메일</label>
          <input class="input" type="email" :value="user?.email" readonly />
        </div>
        <div class="field">
          <label for="nickname">닉네임</label>
          <input id="nickname" v-model="nickname" class="input" placeholder="닉네임을 입력하세요" required />
        </div>
        <div class="field">
          <label for="profileImg">프로필 이미지 URL</label>
          <input id="profileImg" v-model="profileImg" class="input" placeholder="https://example.com/avatar.png" />
        </div>
        <div class="actions">
          <button class="btn primary" type="submit">변경사항 저장</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { getMyInfo, updateProfile } from '../api/user'

const user = ref(null)
const nickname = ref('')
const profileImg = ref('')

const load = async () => {
  const res = await getMyInfo()
  user.value = res.data
  nickname.value = user.value.nickname
  profileImg.value = user.value.profileImg
}

const update = async () => {
  await updateProfile({
    nickname: nickname.value,
    profileImg: profileImg.value
  })

  alert('프로필이 업데이트되었습니다.')
  load()
}

load()
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

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
