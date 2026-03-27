import axios from 'axios'

export const getCompletionSummary = (studyLogId) =>
  axios.get(`/api/study-logs/${studyLogId}/completion-summary`).then(r => r.data)

export const saveCompletionSummaryEvaluation = (studyLogId, payload) =>
  axios.patch(`/api/study-logs/${studyLogId}/completion-summary/evaluation`, payload)
    .then(r => r.data)
