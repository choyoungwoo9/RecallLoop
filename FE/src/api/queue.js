import axios from 'axios'

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getQueueStatus = () =>
  api.get('/api/queue/status').then(r => r.data)

export const getCurrentQuiz = () =>
  api.get('/api/queue/current').then(r => r.data)

export const submitAnswer = (data) =>
  api.post('/api/queue/submit', data).then(r => r.data)

export const evaluateAttempt = (attemptId, selfEvaluation) =>
  api.patch(`/api/queue/attempts/${attemptId}/evaluate`, { selfEvaluation }).then(r => r.data)
