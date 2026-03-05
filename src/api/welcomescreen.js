import api from './axios'

export const getAll = () => api.get('/welcomescreens')
export const getById = (id) => api.get(`/welcomescreens/${id}`)
export const create = (data) => api.post('/welcomescreens', data)
export const update = (id, data) => api.put(`/welcomescreens/${id}`, data)
export const remove = (id) => api.delete(`/welcomescreens/${id}`)
export const updateStatus = (id, status) => api.patch(`/welcomescreens/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
})