<template>
  <h2>내 정보</h2>

  <button @click="load">내 정보 불러오기</button>

  <div v-if="user">
    <p>이메일: {{ user.email }}</p>

    <input v-model="nickname" placeholder="새 닉네임" />
    <input v-model="profileImg" placeholder="프로필 이미지 URL" />

    <button @click="update">프로필 수정</button>

    <pre>{{ user }}</pre>
  </div>
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

  // 기존 값 세팅
  nickname.value = user.value.nickname
  profileImg.value = user.value.profileImg
}

const update = async () => {
  await updateProfile({
    nickname: nickname.value,
    profileImg: profileImg.value
  })

  alert('프로필 수정 완료')
  load() // 수정 후 다시 조회
}
</script>
