import apiClient from './apiClient'

export const getAttemptHistory = (studyLogId = null) =>
  apiClient.get('/api/attempts', { params: studyLogId ? { studyLogId } : {} })
    .then(r => r.data)
