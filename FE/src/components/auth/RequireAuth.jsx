import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getSessionStatus } from '../../api/auth'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import './RequireAuth.css'

function buildRedirectTarget(location) {
  return `${location.pathname}${location.search}${location.hash}`
}

function RequireAuth() {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking')
  const initialLocationRef = useRef(location)

  useEffect(() => {
    let isActive = true

    getSessionStatus()
      .then(() => {
        if (isActive) {
          setStatus('authenticated')
        }
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        if (error?.response?.status === 401) {
          const redirect = encodeURIComponent(buildRedirectTarget(initialLocationRef.current))
          navigate(`/login?redirect=${redirect}`, { replace: true })
          return
        }

        setStatus('error')
      })

    return () => {
      isActive = false
    }
  }, [navigate])

  if (status === 'authenticated') {
    return <Outlet />
  }

  if (status === 'error') {
    return (
      <div className="auth-gate">
        <div className="auth-gate__panel">
          <h2 className="auth-gate__title">세션 확인에 실패했습니다</h2>
          <p className="auth-gate__message">
            네트워크 상태를 확인한 뒤 다시 시도해주세요.
          </p>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-gate">
      <LoadingSpinner size="lg" text="인증 상태를 확인하는 중..." />
    </div>
  )
}

export default RequireAuth
