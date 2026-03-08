import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQueueStatus, getCurrentQuiz } from '../api/queue'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './QueueStatusPage.css'

function QueueStatusPage() {
  const [queueStatus, setQueueStatus] = useState(null)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadQueueData()
  }, [])

  const loadQueueData = async () => {
    try {
      setLoading(true)
      const status = await getQueueStatus()
      const quiz = await getCurrentQuiz()

      setQueueStatus(status)
      if (quiz && quiz.id) {
        setCurrentQuiz(quiz)
      }
    } catch (error) {
      console.error('Queue 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout>
      <LoadingSpinner />
    </Layout>
  )

  const totalQuizzes = queueStatus?.totalCount || 0
  const completedQuizzes = queueStatus?.completedCount || 0
  const progressPercent = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0

  return (
    <Layout>
      <div className="queue-status">
        <div className="queue-status__header">
          <h2 className="queue-status__title">문제 풀이 현황</h2>
          <p className="queue-status__subtitle">학습 진도를 확인하고 문제를 풀어보세요</p>
        </div>

        <Card className="queue-status__progress-card">
          <div className="queue-status__progress-container">
            <div className="queue-status__progress-circle">
              <svg className="queue-status__progress-svg" viewBox="0 0 120 120">
                <circle
                  className="queue-status__progress-bg"
                  cx="60"
                  cy="60"
                  r="54"
                />
                <circle
                  className="queue-status__progress-fill"
                  cx="60"
                  cy="60"
                  r="54"
                  style={{ '--progress': progressPercent }}
                />
              </svg>
              <div className="queue-status__progress-text">
                <div className="queue-status__progress-number">{completedQuizzes}/{totalQuizzes}</div>
                <div className="queue-status__progress-label">완료</div>
              </div>
            </div>

            <div className="queue-status__progress-bar">
              <div className="queue-status__bar-label">
                <span>진행도</span>
                <span className="queue-status__bar-percent">{progressPercent}%</span>
              </div>
              <div className="queue-status__bar-background">
                <div
                  className="queue-status__bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {currentQuiz ? (
          <>
            <Card className="queue-status__quiz-preview">
              <div className="queue-status__quiz-preview-header">
                <h3 className="queue-status__quiz-preview-title">다음 문제</h3>
              </div>
              <div className="queue-status__quiz-preview-content">
                <p className="queue-status__quiz-preview-text">{currentQuiz.question}</p>
                <small className="queue-status__quiz-preview-meta">
                  학습 주제: {currentQuiz.studyLogTitle}
                </small>
              </div>
            </Card>

            <Button
              variant="primary"
              size="lg"
              className="queue-status__solve-btn"
              onClick={() => navigate('/queue/solve')}
            >
              ▶️ 문제 풀기
            </Button>
          </>
        ) : (
          <div className="queue-status__empty">
            <div className="queue-status__empty-icon">📭</div>
            <h3 className="queue-status__empty-title">풀 문제가 없습니다</h3>
            <p className="queue-status__empty-text">
              먼저 학습 기록을 생성하고 문제를 만들어주세요
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
            >
              🏠 홈으로 가기
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default QueueStatusPage
