import axios from 'axios'

export const getCompletionSummary = (studyLogId) =>
  axios.get(`/api/study-logs/${studyLogId}/completion-summary`).then(r => r.data)

export const saveCompletionSummaryEvaluation = (studyLogId, selfEvaluation) =>
  axios.patch(`/api/study-logs/${studyLogId}/completion-summary/evaluation`, { selfEvaluation })
    .then(r => r.data)
