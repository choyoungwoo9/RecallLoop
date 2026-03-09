import axios from 'axios'

export const getCompletionSummary = (studyLogId) =>
  axios.get(`/api/study-logs/${studyLogId}/completion-summary`).then(r => r.data)
