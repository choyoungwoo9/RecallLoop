import apiClient from './apiClient'

const BASE = '/api/study-logs'

export const getStudyLogs = () => apiClient.get(BASE).then(r => r.data)
export const getStudyLog = (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data)
export const createStudyLog = (data) => apiClient.post(BASE, data).then(r => r.data)
export const deleteStudyLog = (id) => apiClient.delete(`${BASE}/${id}`).then(r => r.data)
