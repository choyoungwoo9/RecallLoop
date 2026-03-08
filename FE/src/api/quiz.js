import axios from 'axios'

export const getQuizzesByStudyLog = (studyLogId) =>
  axios.get(`/api/study-logs/${studyLogId}/quizzes`).then(r => r.data)

export const deleteQuiz = (id) =>
  axios.delete(`/api/quizzes/${id}`).then(r => r.data)
