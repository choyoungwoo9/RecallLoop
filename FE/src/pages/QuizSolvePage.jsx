import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentQuiz, submitAnswer } from '../api/queue'
import CompletionQuizzesModal from '../components/queue/CompletionQuizzesModal'
import QueueProgressBar from '../components/queue/QueueProgressBar'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import Textarea from '../components/common/Textarea'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ConfirmModal from '../components/common/ConfirmModal'
import useTimerStore from '../store/timerStore'
import './QuizSolvePage.css'

function QuizSolvePage() {
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [submittedAnswer, setSubmittedAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completedStudyLog, setCompletedStudyLog] = useState(null)
  const [isCycleComplete, setIsCycleComplete] = useState(false)
  const [showQuizzesModal, setShowQuizzesModal] = useState(false)
  const [pendingCycleComplete, setPendingCycleComplete] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: '' })
  const timerInterval = useTimerStore((state) => state.timerInterval)
  const startTimer = useTimerStore((state) => state.startTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)
  const navigate = useNavigate()

  useEffect(() => {
    loadCurrentQuiz()
  }, [])

  useEffect(() => {
    if (currentQuiz) {
      startTimer()
      return () => stopTimer()
    }
  }, [currentQuiz, startTimer, stopTimer])

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadCurrentQuiz = async () => {
    try {
      setLoading(true)
      const quiz = await getCurrentQuiz()
      if (quiz && quiz.id) {
        setCurrentQuiz(quiz)
        setSubmittedAnswer('')
        setElapsedSeconds(0)
      } else {
        setCurrentQuiz(null)
      }
    } catch (error) {
      console.error('문제 로드 실패:', error)
      setCurrentQuiz(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!submittedAnswer.trim()) {
      setConfirmModal({
        isOpen: true,
        title: '알림',
        message: '답을 입력해주세요',
        type: 'empty'
      })
      return
    }

    setSubmitting(true)
    try {
      const result = await submitAnswer({
        quizId: currentQuiz.id,
        submittedAnswer: submittedAnswer,
        elapsedSeconds: elapsedSeconds
      })

      // completedStudyLog가 있으면 먼저 모달을 표시하고, 나중에 처리
      if (result.completedStudyLog) {
        setCompletedStudyLog(result.completedStudyLog)
        setShowQuizzesModal(true)
        setPendingCycleComplete(result.isCycleComplete)
        setSubmitting(false)
      } else if (result.isCycleComplete) {
        // completedStudyLog가 없고 cycleComplete만 있으면 배너 표시
        setIsCycleComplete(true)
        setTimeout(() => {
          setIsCycleComplete(false)
          loadCurrentQuiz()
          setSubmitting(false)
        }, 2000)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
        loadCurrentQuiz()
        setSubmitting(false)
      }
    } catch (error) {
      console.error('답 제출 실패:', error)
      setConfirmModal({
        isOpen: true,
        title: '오류',
        message: '답 제출에 실패했습니다',
        type: 'error'
      })
      setSubmitting(false)
    }
  }

  const handleQuizzesModalAction = (action) => {
    if (action === 'continue') {
      // "계속 풀기" 선택
      setShowQuizzesModal(false)
      if (pendingCycleComplete) {
        // 사이클 완료 배너를 보여줌
        setIsCycleComplete(true)
        setPendingCycleComplete(false)
        setTimeout(() => {
          setIsCycleComplete(false)
          loadCurrentQuiz()
        }, 2000)
      } else {
        loadCurrentQuiz()
      }
    }
  }

  const handleConfirmModalConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', type: '' })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  if (!currentQuiz) {
    return (
      <Layout>
        <div className="quiz-solve__empty">
          <div className="quiz-solve__empty-icon" />
          <h2 className="quiz-solve__empty-title">풀 문제가 없습니다</h2>
          <p className="quiz-solve__empty-text">
            먼저 학습 기록을 생성하고 문제를 만들어주세요
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="quiz-solve">
        <QueueProgressBar />

        {isCycleComplete && (
          <div className="quiz-solve__cycle-complete">
            <div className="quiz-solve__cycle-complete-content">
              <h2>한 바퀴 완료!</h2>
              <p>다시 처음부터 시작합니다</p>
            </div>
          </div>
        )}

        <div className="quiz-solve__container">
          <div className="quiz-solve__header">
            <div className="quiz-solve__title-section">
              <h2 className="quiz-solve__title">{currentQuiz.studyLogTitle}</h2>
              <p className="quiz-solve__subtitle">문제를 읽고 답변을 작성하세요</p>
            </div>
            <div className="quiz-solve__timer">{formatTime(elapsedSeconds)}</div>
          </div>

          <div className="quiz-solve__question-area">
            <div className="quiz-solve__question-number">Q</div>
            <p className="quiz-solve__question">{currentQuiz.question}</p>
          </div>

          <form onSubmit={handleSubmit} className="quiz-solve__form">
            <Textarea
              label="답변"
              value={submittedAnswer}
              onChange={(e) => setSubmittedAnswer(e.target.value)}
              placeholder="여기에 답변을 입력하세요"
              rows={8}
              size="lg"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="quiz-solve__submit-btn"
              loading={submitting}
              disabled={submitting}
            >
              ✅ 제출하기
            </Button>
          </form>
        </div>

        {showQuizzesModal && completedStudyLog && (
          <CompletionQuizzesModal
            studyLog={completedStudyLog}
            isCycleComplete={pendingCycleComplete}
            onAction={handleQuizzesModalAction}
          />
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="확인"
          cancelText={null}
          variant={confirmModal.type === 'error' ? 'danger' : 'primary'}
          onConfirm={handleConfirmModalConfirm}
          onCancel={handleConfirmModalConfirm}
        />
      </div>
    </Layout>
  )
}

export default QuizSolvePage
