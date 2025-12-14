import http from './http'

export const fetchTodos = () => http.get('/todos')
export const createTodo = (data) => http.post('/todos', data)
export const updateTodo = (id, data) => http.put(`/todos/${id}`, data)
export const deleteTodo = (id) => http.delete(`/todos/${id}`)
