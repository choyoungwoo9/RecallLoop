import axios from 'axios'

export const getQueueStatus = () =>
  axios.get('/api/queue/status').then(r => r.data)

export const getCurrentQuiz = () =>
  axios.get('/api/queue/current').then(r => r.data)

export const submitAnswer = (data) =>
  axios.post('/api/queue/submit', data).then(r => r.data)
