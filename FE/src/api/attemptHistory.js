import axios from 'axios'

export const getAttemptHistory = (studyLogId = null) =>
  axios.get('/api/attempts', { params: studyLogId ? { studyLogId } : {} })
    .then(r => r.data)
