import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getSessionStatus, login } from '../api/auth'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import LoadingSpinner from '../components/common/LoadingSpinner'
import logo from '../assets/logo.svg'
import './LoginPage.css'

function normalizeRedirectPath(redirect) {
  if (!redirect || !redirect.startsWith('/')) {
    return '/'
  }

  return redirect
}

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = useMemo(
    () => normalizeRedirectPath(searchParams.get('redirect')),
    [searchParams]
  )
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isActive = true

    getSessionStatus()
      .then(() => {
        if (isActive) {
          navigate(redirectPath, { replace: true })
        }
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.response?.status !== 401) {
          setError('세션 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      })
      .finally(() => {
        if (isActive) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [navigate, redirectPath])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!accessCode.trim()) {
      setError('접근 코드를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await login(accessCode.trim())
      navigate(redirectPath, { replace: true })
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        setError('접근 코드가 올바르지 않습니다.')
      } else {
        setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="login-page">
        <LoadingSpinner size="lg" text="세션을 확인하는 중..." />
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-page__backdrop" aria-hidden="true" />
      <Card className="login-page__card">
        <div className="login-page__brand">
          <img src={logo} alt="Recall Loop" className="login-page__logo" />
          <span className="login-page__eyebrow">Private Access</span>
        </div>

        <h1 className="login-page__title">Recall Loop에 로그인</h1>
        <p className="login-page__subtitle">
          이 앱은 개인용으로 보호되어 있습니다. 미리 정한 접근 코드를 입력해 들어오세요.
        </p>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <Input
            label="접근 코드"
            type="password"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            placeholder="접근 코드를 입력하세요"
            autoComplete="current-password"
            required
            error={error}
            size="lg"
          />

          <Button
            type="submit"
            size="lg"
            className="login-page__submit"
            loading={isSubmitting}
          >
            입장하기
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
