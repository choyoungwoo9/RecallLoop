import apiClient from './apiClient'

export const login = (accessCode) =>
  apiClient.post(
    '/api/auth/login',
    { accessCode },
    { skipAuthRedirect: true }
  )

export const getSessionStatus = () =>
  apiClient.get('/api/auth/session', { skipAuthRedirect: true })

export const logout = () =>
  apiClient.post('/api/auth/logout', null, { skipAuthRedirect: true })
