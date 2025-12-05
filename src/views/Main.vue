<template>
  <section class="page stack dashboard">
    <div class="surface panel dashboard-hero">
      <div class="hero-copy">
        <span class="pill tag-soft">오늘도 차분하게</span>
        <h1>NOWDO에서 할 일을 정리하세요</h1>
        <p>간결한 카드와 타이머로 해야 할 일을 한눈에 모았습니다. 가장 중요한 일부터 시작해 보세요.</p>
        <div class="hero-actions">
          <router-link class="btn ghost" to="/mypage">프로필 관리</router-link>
          <button class="btn" type="button" @click="doLogout">로그아웃</button>
        </div>
      </div>
      <div class="card profile-card">
        <div class="profile-row">
          <span class="label">닉네임</span>
          <strong>{{ auth.user?.nickname || '-' }}</strong>
        </div>
        <div class="profile-row">
          <span class="label">이메일</span>
          <span>{{ auth.user?.email || '-' }}</span>
        </div>
        <div class="profile-row">
          <span class="label">상태</span>
          <span class="pill">{{ auth.user?.status || 'ACTIVE' }}</span>
        </div>
      </div>
    </div>

    <div class="surface panel todo-shell">
      <div class="todo-form">
        <div class="section-title">
          <h2>{{ editingId ? '할 일 수정' : '새 할 일 추가' }}</h2>
          <span>{{ editingId ? '수정 후 저장하세요' : '짧게 적을수록 좋습니다' }}</span>
        </div>
        <form class="stack" @submit.prevent="submitTodo">
          <input v-model="form.content" class="input" type="text" placeholder="무엇을 해야 하나요?" required />
          <div class="form-grid">
            <label class="field">
              <span>마감 시각</span>
              <input v-model="form.dueDate" class="input" type="datetime-local" required />
            </label>
            <label class="field">
              <span>우선순위</span>
              <select v-model="form.priority" class="input">
                <option v-for="option in priorities" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
            <label class="field">
              <span>카테고리 (선택)</span>
              <input v-model="form.category" class="input" type="text" placeholder="예: 업무" />
            </label>
            <div class="form-actions">
              <button class="btn primary" type="submit" :disabled="savingTodo">
                {{ savingTodo ? '저장 중...' : editingId ? '업데이트' : '추가' }}
              </button>
              <button v-if="editingId" class="btn ghost" type="button" @click="cancelEdit">취소</button>
            </div>
          </div>
        </form>
      </div>

      <div class="divider"></div>

      <div class="todo-list-block">
        <div class="section-title">
          <h2>TODO 목록</h2>
          <div class="title-actions">
            <button class="btn ghost" type="button" @click="loadTodos" :disabled="todosLoading">
              {{ todosLoading ? '불러오는 중...' : '새로고침' }}
            </button>
          </div>
        </div>

        <div class="todo-list" v-if="todos.length">
          <div v-for="todo in todos" :key="todo.id" class="todo-item">
            <label class="todo-check">
              <input type="checkbox" :checked="todo.completed" @change="toggleComplete(todo)" />
            </label>
            <div class="todo-body">
              <div class="todo-title">
                <span :class="{ done: todo.completed }">{{ todo.content }}</span>
              </div>
              <div class="todo-meta">
                <span class="pill small">{{ formatDate(todo.dueDate) }}</span>
                <span class="pill small tone">
                  {{ todo.priority }}
                </span>
                <span v-if="todo.category" class="pill small tag-soft">{{ todo.category }}</span>
              </div>
            </div>
            <div class="todo-buttons">
              <button type="button" class="btn ghost tiny" @click="openTimer(todo)">타이머</button>
              <button type="button" class="btn tiny" @click="startEdit(todo)">수정</button>
              <button type="button" class="btn ghost tiny" @click="removeTodo(todo)">삭제</button>
            </div>
          </div>
        </div>
        <p v-else class="muted empty-copy">아직 할 일이 없습니다. 위에서 새로운 일을 추가해 보세요.</p>
      </div>
    </div>

    <div v-if="timerVisible" class="timer-overlay" @click.self="closeTimer">
      <div class="timer-modal surface glass">
        <header class="timer-header">
          <div>
            <p class="timer-label">집중 타이머</p>
            <h2 class="timer-title">{{ timerTarget?.content }}</h2>
          </div>
          <button class="close-btn" type="button" @click="closeTimer">×</button>
        </header>

        <div class="timer-display">
          <div class="timer-clock">{{ formatClock(timerState.remainingMs) }}</div>
          <p class="timer-subcopy">
            {{ timerState.running ? '타이머가 실행 중입니다.' : '시간을 설정하고 시작해보세요.' }}
          </p>
        </div>

        <div class="timer-inputs" :class="{ disabled: timerState.running }">
          <label>
            <span>시간</span>
            <input type="number" min="0" max="12" v-model.number="timerInputs.hours" :disabled="timerState.running" />
          </label>
          <label>
            <span>분</span>
            <input type="number" min="0" max="59" v-model.number="timerInputs.minutes" :disabled="timerState.running" />
          </label>
          <label>
            <span>초</span>
            <input type="number" min="0" max="59" v-model.number="timerInputs.seconds" :disabled="timerState.running" />
          </label>
        </div>

        <div class="timer-actions">
          <button type="button" class="btn primary" @click="startTimer" :disabled="timerState.running || timerState.remainingMs <= 0">
            시작
          </button>
          <button type="button" class="btn ghost" @click="pauseTimer" :disabled="!timerState.running">일시정지</button>
          <button type="button" class="btn ghost" @click="resetTimer" :disabled="timerState.running">리셋</button>
        </div>
        <p class="timer-hint">타이머는 열린 상태에서 동작합니다. 창을 닫지 말고 집중하세요.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from '../api/todo'
import { logout } from '../api/user'

const router = useRouter()
const auth = useAuthStore()

const doLogout = async () => {
  await logout()
  auth.clearUser()
  router.push('/')
}

const todos = ref([])
const todosLoading = ref(false)
const savingTodo = ref(false)
const editingId = ref(null)
const priorities = ['LOW', 'MEDIUM', 'HIGH']
const form = reactive({
  content: '',
  dueDate: '',
  priority: 'MEDIUM',
  category: ''
})

const timerVisible = ref(false)
const activeTimerId = ref(null)
const timerTarget = ref(null)
const timerInputs = reactive({
  hours: 0,
  minutes: 30,
  seconds: 0
})
const timerState = reactive({
  remainingMs: 30 * 60 * 1000,
  running: false,
  lastTick: null
})
const timerInterval = ref(null)

const serializeDate = (value) => {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const formatClock = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const resetForm = () => {
  editingId.value = null
  form.content = ''
  form.dueDate = ''
  form.priority = 'MEDIUM'
  form.category = ''
}

const loadTodos = async () => {
  todosLoading.value = true
  try {
    const { data } = await fetchTodos()
    todos.value = data || []
  } catch (error) {
    console.error(error)
  } finally {
    todosLoading.value = false
  }
}

const submitTodo = async () => {
  if (!form.content.trim() || !form.dueDate) return
  savingTodo.value = true
  const payload = {
    content: form.content.trim(),
    dueDate: serializeDate(form.dueDate),
    priority: form.priority,
    category: form.category || null,
    completed: false
  }

  try {
    if (editingId.value) {
      const current = todos.value.find((item) => item.id === editingId.value)
      payload.completed = current ? current.completed : false
      await updateTodo(editingId.value, payload)
    } else {
      await createTodo(payload)
    }
    await loadTodos()
    resetForm()
  } catch (error) {
    console.error(error)
  } finally {
    savingTodo.value = false
  }
}

const startEdit = (todo) => {
  editingId.value = todo.id
  form.content = todo.content
  form.dueDate = todo.dueDate ? todo.dueDate.slice(0, 16) : ''
  form.priority = todo.priority || 'MEDIUM'
  form.category = todo.category || ''
}

const cancelEdit = () => {
  resetForm()
}

const normalizeUnit = (value, max) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0) return 0
  return Math.min(parsed, max)
}

const toMilliseconds = () => {
  const hours = normalizeUnit(timerInputs.hours, 12)
  const minutes = normalizeUnit(timerInputs.minutes, 59)
  const seconds = normalizeUnit(timerInputs.seconds, 59)
  return (hours * 3600 + minutes * 60 + seconds) * 1000
}

const syncInitialTimer = (presetMinutes = 30) => {
  timerInputs.hours = 0
  timerInputs.minutes = presetMinutes
  timerInputs.seconds = 0
  timerState.remainingMs = toMilliseconds()
  timerState.running = false
}

const openTimer = (todo) => {
  const isSameTarget = activeTimerId.value === todo.id
  if (!isSameTarget) {
    pauseTimer()
    activeTimerId.value = todo.id
    timerTarget.value = todo
    syncInitialTimer(30)
  } else {
    timerTarget.value = todo
  }
  timerVisible.value = true
}

const closeTimer = () => {
  timerVisible.value = false
}

const tickTimer = () => {
  const now = Date.now()
  const delta = now - (timerState.lastTick || now)
  timerState.lastTick = now
  timerState.remainingMs = Math.max(0, timerState.remainingMs - delta)

  if (timerState.remainingMs <= 0) {
    pauseTimer()
  }
}

const startTimer = () => {
  if (!timerTarget.value) return
  if (timerState.running) return

  if (timerState.remainingMs <= 0) {
    timerState.remainingMs = toMilliseconds()
  }
  if (timerState.remainingMs <= 0) return

  timerState.running = true
  timerState.lastTick = Date.now()
  timerInterval.value = setInterval(tickTimer, 200)
}

const pauseTimer = () => {
  timerState.running = false
  timerState.lastTick = null
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const resetTimer = () => {
  pauseTimer()
  timerState.remainingMs = toMilliseconds()
}

watch(
  () => [timerInputs.hours, timerInputs.minutes, timerInputs.seconds],
  () => {
    if (timerState.running) return
    timerState.remainingMs = toMilliseconds()
  }
)

const toggleComplete = async (todo) => {
  const payload = {
    content: todo.content,
    dueDate: serializeDate(todo.dueDate?.slice(0, 16) || todo.dueDate),
    priority: todo.priority || 'MEDIUM',
    category: todo.category || null,
    completed: !todo.completed
  }

  try {
    await updateTodo(todo.id, payload)
    await loadTodos()
  } catch (error) {
    console.error(error)
  }
}

const removeTodo = async (todo) => {
  try {
    await deleteTodo(todo.id)
    if (editingId.value === todo.id) resetForm()
    await loadTodos()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadTodos()
})

onBeforeUnmount(() => {
  pauseTimer()
})
</script>

<style scoped>
.dashboard-hero {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  align-items: center;
}

.hero-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.profile-card {
  display: grid;
  gap: 12px;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid var(--border);
}

.profile-row .label {
  color: var(--muted);
}

.todo-shell {
  display: grid;
  gap: 18px;
}

.todo-form .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: end;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.todo-list-block {
  display: grid;
  gap: 14px;
}

.title-actions {
  display: flex;
  gap: 8px;
}

.todo-list {
  display: grid;
  gap: 10px;
}

.todo-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fdfefe;
  align-items: start;
}

.todo-check input {
  width: 18px;
  height: 18px;
}

.todo-title {
  font-weight: 700;
}

.todo-title .done {
  text-decoration: line-through;
  color: var(--muted);
}

.todo-meta {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
  color: var(--muted);
}

.todo-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn.tiny {
  height: 34px;
  padding: 0 12px;
  box-shadow: none;
}

.pill.small {
  padding: 4px 8px;
  font-size: 12px;
}

.pill.tone {
  background: #eef2ff;
  color: #312e81;
  border: 1px solid #e0e7ff;
}

.empty-copy {
  margin-top: 4px;
}

.timer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 30;
}

.timer-modal {
  width: min(620px, 100%);
  border-radius: 18px;
  padding: 22px;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.timer-label {
  font-size: 13px;
  color: var(--muted);
}

.timer-title {
  margin: 4px 0 0;
  font-size: 22px;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #0f172a;
  font-size: 22px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.timer-display {
  margin: 18px 0 10px;
  text-align: center;
}

.timer-clock {
  font-size: 56px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}

.timer-subcopy {
  margin-top: 6px;
  color: var(--muted);
}

.timer-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 12px 0 8px;
}

.timer-inputs label {
  display: grid;
  gap: 6px;
  font-size: 14px;
}

.timer-inputs span {
  color: var(--muted);
}

.timer-inputs input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #f8fafc;
  color: var(--text);
  font-size: 16px;
}

.timer-inputs.disabled {
  opacity: 0.85;
}

.timer-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.timer-hint {
  margin-top: 12px;
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 1024px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .todo-item {
    grid-template-columns: 1fr;
  }
  .todo-buttons {
    justify-content: flex-start;
  }
  .timer-inputs {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  .timer-clock {
    font-size: 44px;
  }
}
</style>
