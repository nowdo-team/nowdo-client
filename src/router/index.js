import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Main from '../views/Main.vue'
import MyPage from '../views/MyPage.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/register', component: Register },
  { path: '/main', component: Main },
  { path: '/mypage', component: MyPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // 로그인이 필요한 경로들
  const needLogin = ['/main', '/mypage']

  if (auth.loading) {
    next()
    return
  }

  if (needLogin.includes(to.path) && !auth.user) {
    alert('로그인이 필요한 페이지입니다.')
    next('/')
    return
  }

  next()
})

export default router
