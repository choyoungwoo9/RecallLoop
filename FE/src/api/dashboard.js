import axios from 'axios'

export const getDashboard = () =>
  axios.get('/api/dashboard').then(r => r.data)
