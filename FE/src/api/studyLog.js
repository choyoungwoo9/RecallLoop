import axios from 'axios'

const BASE = '/api/study-logs'

export const getStudyLogs = () => axios.get(BASE).then(r => r.data)
export const getStudyLog = (id) => axios.get(`${BASE}/${id}`).then(r => r.data)
export const createStudyLog = (data) => axios.post(BASE, data).then(r => r.data)
export const deleteStudyLog = (id) => axios.delete(`${BASE}/${id}`).then(r => r.data)
