import api from './axios'

export const getAll = (welcomeScreenId) =>
    api.get('/media', { params: welcomeScreenId ? { welcomeScreenId } : {} })

export const upload = (file, welcomeScreenId) => {
    const form = new FormData()
    form.append('file', file)
    if (welcomeScreenId) form.append('welcomeScreenId', welcomeScreenId)
    return api.post('/media', form)
}

export const remove = (id) => api.delete(`/media/${id}`)