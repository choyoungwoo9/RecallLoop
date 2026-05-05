import apiClient from './apiClient'

export const getQuizzesByStudyLog = (studyLogId) =>
  apiClient.get(`/api/study-logs/${studyLogId}/quizzes`).then(r => r.data)

export const deleteQuiz = (id) =>
  apiClient.delete(`/api/quizzes/${id}`).then(r => r.data)
