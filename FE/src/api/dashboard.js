import apiClient from './apiClient'

export const getDashboard = () =>
  apiClient.get('/api/dashboard').then(r => r.data)
