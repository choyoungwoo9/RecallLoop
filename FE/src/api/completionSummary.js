import apiClient from './apiClient'

export const getCompletionSummary = (studyLogId) =>
  apiClient.get(`/api/study-logs/${studyLogId}/completion-summary`).then(r => r.data)

export const saveCompletionSummaryEvaluation = (studyLogId, payload) =>
  apiClient.patch(`/api/study-logs/${studyLogId}/completion-summary/evaluation`, payload)
    .then(r => r.data)
