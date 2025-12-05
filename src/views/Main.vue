<template>
  <div style="padding: 32px;">
    <h1>NOWDO</h1>

    <div style="margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
      <div class="card">
        <h3>Profile</h3>
        <p>Nickname: {{ auth.user?.nickname }}</p>
        <p>Email: {{ auth.user?.email }}</p>
      </div>

      <div class="card">
        <h3>계정 상태 인데 이거 있어야 하나</h3> 
        <p>Status: {{ auth.user?.status }}</p>
      </div>

      <div class="card">
        <h3>Account</h3>
        <router-link to="/mypage">마이페이지로</router-link><br />
        <button @click="doLogout">Logout</button>
      </div>
    </div>

    <div class="todo-section">
      <div class="card todo-card">
        <div class="todo-header">
          <h3>TODO List</h3>
          <button @click="loadTodos" :disabled="todosLoading">Refresh</button>
        </div>

        <form class="todo-form" @submit.prevent="submitTodo">
          <input v-model="form.content" type="text" placeholder="Add a task" required />
          <div class="todo-form-row">
            <input v-model="form.dueDate" type="datetime-local" required />
            <select v-model="form.priority">
              <option v-for="option in priorities" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <input v-model="form.category" type="text" placeholder="Category (optional)" />
            <button type="submit" :disabled="savingTodo">
              {{ editingId ? 'Update' : 'Add' }}
            </button>
            <button v-if="editingId" type="button" @click="cancelEdit">Cancel</button>
          </div>
        </form>

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
                <span>{{ formatDate(todo.dueDate) }}</span>
                <span class="pill">{{ todo.priority }}</span>
                <span v-if="todo.category" class="pill">{{ todo.category }}</span>
              </div>
            </div>
            <div class="todo-buttons">
              <button type="button" class="ghost" @click="openTimer(todo)">타이머</button>
              <button type="button" @click="startEdit(todo)">수정</button>
              <button type="button" @click="removeTodo(todo)">삭제</button>
            </div>
          </div>
        </div>
        <p v-else class="empty-copy">No todos yet.</p>
      </div>
    </div>

    <div v-if="timerVisible" class="timer-overlay" @click.self="closeTimer">
      <div class="timer-modal">
        <header class="timer-header">
          <div>
            <p class="timer-label">이 일정의 타이머</p>
            <h2 class="timer-title">{{ timerTarget?.content }}</h2>
          </div>
          <button class="close-btn" type="button" @click="closeTimer">×</button>
        </header>

        <div class="timer-display">
          <div class="timer-clock">{{ formatClock(timerState.remainingMs) }}</div>
          <p class="timer-subcopy">
            {{ timerState.running ? '달리는 중...' : '시간을 잡고 시작하세요' }}
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
          <button type="button" class="primary" @click="startTimer" :disabled="timerState.running || timerState.remainingMs <= 0">
            시작!
          </button>
          <button type="button" @click="pauseTimer" :disabled="!timerState.running">일시정지</button>
          <button type="button" @click="resetTimer" :disabled="timerState.running">리셋</button>
        </div>
        <p class="timer-hint">타이머는 창을 닫아도 계속 돌아갑니다.</p>
      </div>
    </div>
  </div>
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
.card {
  width: 220px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}
.todo-section {
  margin-top: 32px;
}
.todo-card {
  width: 100%;
  max-width: 960px;
}
.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.todo-form {
  display: grid;
  gap: 8px;
}
.todo-form-row {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr 1fr auto auto;
  gap: 8px;
  align-items: center;
}
.todo-form input,
.todo-form select,
.todo-form button {
  height: 36px;
  padding: 8px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: white;
}
.todo-form button {
  cursor: pointer;
}
.todo-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.todo-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  align-items: flex-start;
}
.todo-check input {
  width: 18px;
  height: 18px;
}
.todo-title .done {
  text-decoration: line-through;
  color: #777;
}
.todo-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
  color: #555;
  flex-wrap: wrap;
}
.pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f1f1f1;
  font-size: 12px;
}
.todo-buttons {
  display: flex;
  gap: 8px;
}
.todo-buttons button {
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f7f7f7;
  padding: 6px 10px;
  cursor: pointer;
}
.todo-buttons .ghost {
  background: white;
}
.empty-copy {
  margin-top: 12px;
  color: #777;
}
.timer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 10;
}
.timer-modal {
  width: min(600px, 100%);
  background: #111827;
  color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid #1f2937;
}
.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.timer-label {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 6px;
}
.timer-title {
  margin: 0;
  font-size: 20px;
}
.close-btn {
  background: #1f2937;
  border: none;
  color: #e5e7eb;
  font-size: 20px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}
.timer-display {
  margin: 24px 0 12px;
  text-align: center;
}
.timer-clock {
  font-size: 64px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
}
.timer-subcopy {
  margin-top: 6px;
  color: #9ca3af;
}
.timer-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 12px 0 8px;
}
.timer-inputs label {
  display: grid;
  gap: 6px;
  font-size: 14px;
}
.timer-inputs span {
  color: #cbd5e1;
}
.timer-inputs input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #0b1220;
  color: white;
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
.timer-actions button {
  flex: 1;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #1f2937;
  background: #1f2937;
  color: #e5e7eb;
  cursor: pointer;
}
.timer-actions .primary {
  background: #10b981;
  border-color: #10b981;
  color: #0b1220;
  font-weight: 700;
}
.timer-hint {
  margin-top: 12px;
  color: #9ca3af;
  font-size: 13px;
}
</style>
