import axios from 'axios'

export const getQuizConfigs = (studyLogId) =>
  axios.get(`/api/study-logs/${studyLogId}/quiz-configs`).then(r => r.data)

export const createQuizConfig = (studyLogId, data) =>
  axios.post(`/api/study-logs/${studyLogId}/quiz-configs`, data).then(r => r.data)

export const deleteQuizConfig = (id) =>
  axios.delete(`/api/quiz-configs/${id}`).then(r => r.data)

export const generateQuizzes = (configId) =>
  axios.post(`/api/quiz-configs/${configId}/generate`).then(r => r.data)
