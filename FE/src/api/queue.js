import apiClient from './apiClient'

export const getQueueStatus = () =>
  apiClient.get('/api/queue/status').then(r => r.data)

export const getCurrentQuiz = () =>
  apiClient.get('/api/queue/current').then(r => r.data)

export const submitAnswer = (data) =>
  apiClient.post('/api/queue/submit', data).then(r => r.data)
