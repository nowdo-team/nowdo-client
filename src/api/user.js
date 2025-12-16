import http from './http'

export const login = (data) => http.post('/users/login', data)
export const register = (data) => http.post('/users/register', data)
export const getMyInfo = () => http.get('/users/me')
export const logout = () => http.post('/users/logout')
export const updateProfile = (data) => http.put('/users/me', data)
export const changePassword = (data) => http.patch('/users/me/password', data)