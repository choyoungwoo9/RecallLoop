import axios from 'axios'

function buildRedirectPath() {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return `/login?redirect=${encodeURIComponent(currentPath)}`
}

const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  response => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url ?? ''
    const skipAuthRedirect = Boolean(error?.config?.skipAuthRedirect)
    const isAuthRequest = typeof requestUrl === 'string' && requestUrl.startsWith('/api/auth/')

    if (
      status === 401 &&
      !skipAuthRedirect &&
      !isAuthRequest &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      window.location.replace(buildRedirectPath())
    }

    return Promise.reject(error)
  }
)

export default apiClient
