
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
          <input
            v-model="form.content"
            type="text"
            placeholder="Add a task"
            required
          />
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
              <input
                type="checkbox"
                :checked="todo.completed"
                @change="toggleComplete(todo)"
              />
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
              <button type="button" @click="startEdit(todo)">수정</button>
              <button type="button" @click="removeTodo(todo)">삭제</button>
            </div>
          </div>
        </div>
        <p v-else class="empty-copy">No todos yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
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

const serializeDate = (value) => {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
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
.empty-copy {
  margin-top: 12px;
  color: #777;
}
</style>
