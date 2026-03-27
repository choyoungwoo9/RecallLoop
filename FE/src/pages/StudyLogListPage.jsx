import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudyLogs } from '../api/studyLog'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StudyLogCard from '../components/studylog/StudyLogCard'
import { BookIcon, PlusIcon } from '../components/common/Icons'
import './StudyLogListPage.css'

function StudyLogListPage() {
  const [studyLogs, setStudyLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getStudyLogs()
      .then(data => {
        setStudyLogs(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <Layout>
      <LoadingSpinner />
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="error-container">
        <div className="error-message">❌ 에러: {error}</div>
        <Button onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="study-log-list">
        <div className="study-log-list__header">
          <div className="study-log-list__title-section">
            <h2 className="study-log-list__title">내 학습 기록</h2>
            <p className="study-log-list__subtitle">기록을 정리하고 문제 생성의 재료를 관리하세요</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/study-logs/new')}
            className="study-log-list__create-btn"
          >
            <PlusIcon className="study-log-list__create-icon" />
            새 학습 기록 작성
          </Button>
        </div>

        {studyLogs.length === 0 ? (
          <div className="study-log-list__empty">
            <div className="study-log-list__empty-icon">
              <BookIcon />
            </div>
            <h3 className="study-log-list__empty-title">학습 기록이 없습니다</h3>
            <p className="study-log-list__empty-text">
              새로운 학습 기록을 작성하여 시작해보세요!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/study-logs/new')}
            >
              새 학습 기록 작성
            </Button>
          </div>
        ) : (
          <div className="study-log-list__grid">
            {studyLogs.map(log => (
              <StudyLogCard key={log.id} studyLog={log} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default StudyLogListPage
