import apiClient from './apiClient'

export const getQuizConfigs = (studyLogId) =>
  apiClient.get(`/api/study-logs/${studyLogId}/quiz-configs`).then(r => r.data)

export const createQuizConfig = (studyLogId, data) =>
  apiClient.post(`/api/study-logs/${studyLogId}/quiz-configs`, data).then(r => r.data)

export const deleteQuizConfig = (id) =>
  apiClient.delete(`/api/quiz-configs/${id}`).then(r => r.data)

export const generateQuizzes = (configId) =>
  apiClient.post(`/api/quiz-configs/${configId}/generate`).then(r => r.data)
