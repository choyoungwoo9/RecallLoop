import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentQuiz, submitAnswer } from '../api/queue'
import CompletionQuizzesModal from '../components/queue/CompletionQuizzesModal'
import CycleCompleteOverlay from '../components/queue/CycleCompleteOverlay'
import QueueProgressBar from '../components/queue/QueueProgressBar'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import Textarea from '../components/common/Textarea'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ConfirmModal from '../components/common/ConfirmModal'
import useTimerStore from '../store/timerStore'
import './QuizSolvePage.css'

const CYCLE_TRANSITION_PHASE_SCHEDULE = [
  { phase: 'analyzing', delayMs: 1800 },
  { phase: 'regenerating', delayMs: 3600 },
  { phase: 'finalizing', delayMs: 5200 },
]

const CYCLE_TRANSITION_MESSAGES = {
  cycle_complete: 'AI 제어실이 새 루프를 기동합니다',
  analyzing: '이전 응답 패턴을 분석하고 있습니다',
  regenerating: 'AI가 다음 사이클 문제 세트를 재배치하고 있습니다',
  finalizing: '다음 루프를 안정화하고 있습니다',
}

function QuizSolvePage() {
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [submittedAnswer, setSubmittedAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completedStudyLog, setCompletedStudyLog] = useState(null)
  const [showQuizzesModal, setShowQuizzesModal] = useState(false)
  const [pendingCycleComplete, setPendingCycleComplete] = useState(false)
  const [isCycleTransitionPlaying, setIsCycleTransitionPlaying] = useState(false)
  const [cycleTransitionPhase, setCycleTransitionPhase] = useState('cycle_complete')
  const [cycleTransitionCanClose, setCycleTransitionCanClose] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: '' })
  const startTimer = useTimerStore((state) => state.startTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)
  const navigate = useNavigate()
  const isMountedRef = useRef(true)
  const cycleTransitionTimeoutsRef = useRef([])
  const cycleTransitionInFlightRef = useRef(false)
  const cycleTransitionRequestIdRef = useRef(0)
  const cycleTransitionMessage = CYCLE_TRANSITION_MESSAGES[cycleTransitionPhase]

  useEffect(() => {
    isMountedRef.current = true

    const initialize = async () => {
      setLoading(true)
      await loadCurrentQuiz()
      if (isMountedRef.current) {
        setLoading(false)
      }
    }

    initialize()

    return () => {
      isMountedRef.current = false
      clearCycleTransitionTimers()
      stopTimer()
    }
  }, [stopTimer])

  useEffect(() => {
    if (!currentQuiz || isCycleTransitionPlaying) {
      stopTimer()
      return undefined
    }

    startTimer()
    return () => stopTimer()
  }, [currentQuiz, isCycleTransitionPlaying, startTimer, stopTimer])

  useEffect(() => {
    if (isCycleTransitionPlaying) {
      return undefined
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isCycleTransitionPlaying])

  const clearCycleTransitionTimers = () => {
    cycleTransitionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    cycleTransitionTimeoutsRef.current = []
  }

  const applyLoadedQuiz = (quiz) => {
    if (!isMountedRef.current) {
      return
    }

    setCurrentQuiz(quiz)
    setSubmittedAnswer('')
    setElapsedSeconds(0)
  }

  const loadCurrentQuiz = async () => {
    try {
      const quiz = await getCurrentQuiz()
      const nextQuiz = quiz && quiz.id ? quiz : null
      applyLoadedQuiz(nextQuiz)
      return nextQuiz
    } catch (error) {
      console.error('문제 로드 실패:', error)
      applyLoadedQuiz(null)
      return null
    }
  }

  const scheduleCycleTransitionPhases = (requestId) => {
    clearCycleTransitionTimers()

    cycleTransitionTimeoutsRef.current = CYCLE_TRANSITION_PHASE_SCHEDULE.map(({ phase, delayMs }) =>
      window.setTimeout(() => {
        if (!isMountedRef.current || cycleTransitionRequestIdRef.current !== requestId) {
          return
        }

        setCycleTransitionPhase(phase)
      }, delayMs)
    )
  }

  const runCycleTransition = () => {
    if (cycleTransitionInFlightRef.current) {
      return
    }

    const requestId = Date.now()
    cycleTransitionInFlightRef.current = true
    cycleTransitionRequestIdRef.current = requestId

    setIsCycleTransitionPlaying(true)
    setCycleTransitionPhase('cycle_complete')
    setCycleTransitionCanClose(false)

    scheduleCycleTransitionPhases(requestId)

    void (async () => {
      await loadCurrentQuiz()

      if (!isMountedRef.current || cycleTransitionRequestIdRef.current !== requestId) {
        return
      }

      setCycleTransitionCanClose(true)
    })()
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

    if (cycleTransitionInFlightRef.current) {
      return
    }

    setSubmitting(true)

    try {
      const result = await submitAnswer({
        quizId: currentQuiz.id,
        submittedAnswer,
        elapsedSeconds
      })

      if (result.completedStudyLog) {
        setCompletedStudyLog(result.completedStudyLog)
        setShowQuizzesModal(true)
        setPendingCycleComplete(result.isCycleComplete)
        setSubmitting(false)
        return
      }

      if (result.isCycleComplete) {
        runCycleTransition()
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      await loadCurrentQuiz()
      setSubmitting(false)
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
    if (action !== 'continue') {
      return
    }

    setShowQuizzesModal(false)

    if (pendingCycleComplete) {
      setPendingCycleComplete(false)
      runCycleTransition()
      return
    }

    void loadCurrentQuiz()
  }

  const handleCycleTransitionFinished = () => {
    clearCycleTransitionTimers()
    cycleTransitionInFlightRef.current = false

    if (!isMountedRef.current) {
      return
    }

    setIsCycleTransitionPlaying(false)
    setCycleTransitionCanClose(false)
    setCycleTransitionPhase('cycle_complete')
    setSubmitting(false)
  }

  const handleConfirmModalConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', type: '' })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyLevel = (difficulty) => {
    if (difficulty >= 1 && difficulty <= 3) return 'easy'
    if (difficulty >= 4 && difficulty <= 7) return 'medium'
    if (difficulty >= 8 && difficulty <= 10) return 'hard'
    return 'medium'
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  if (!currentQuiz && !isCycleTransitionPlaying) {
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
        <CycleCompleteOverlay
          open={isCycleTransitionPlaying}
          phase={cycleTransitionPhase}
          message={cycleTransitionMessage}
          canClose={cycleTransitionCanClose}
          onFinished={handleCycleTransitionFinished}
        />

        <QueueProgressBar />

        {currentQuiz && (
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
              <div className="quiz-solve__question-header">
                <p className="quiz-solve__question">{currentQuiz.question}</p>
                {currentQuiz.difficulty && (
                  <div className={`quiz-solve__difficulty-badge difficulty-${getDifficultyLevel(currentQuiz.difficulty)}`}>
                    Lv.{currentQuiz.difficulty}
                  </div>
                )}
              </div>
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
                disabled={submitting || isCycleTransitionPlaying}
              >
                ✅ 제출하기
              </Button>
            </form>
          </div>
        )}

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
