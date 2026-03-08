import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentQuiz, submitAnswer } from '../api/queue'
import StudyLogCompleteModal from '../components/queue/StudyLogCompleteModal'
import QueueProgressBar from '../components/queue/QueueProgressBar'
import useTimerStore from '../store/timerStore'
import './QuizSolvePage.css'

function QuizSolvePage() {
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [submittedAnswer, setSubmittedAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [completedStudyLog, setCompletedStudyLog] = useState(null)
  const [isCycleComplete, setIsCycleComplete] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!submittedAnswer.trim()) {
      alert('답을 입력해주세요')
      return
    }

    try {
      const result = await submitAnswer({
        quizId: currentQuiz.id,
        submittedAnswer: submittedAnswer,
        elapsedSeconds: elapsedSeconds
      })

      if (result.completedStudyLog) {
        setCompletedStudyLog(result.completedStudyLog)
        setShowModal(true)
      }

      if (result.isCycleComplete) {
        setIsCycleComplete(true)
        setTimeout(() => {
          setIsCycleComplete(false)
          loadCurrentQuiz()
        }, 2000)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
        loadCurrentQuiz()
      }
    } catch (error) {
      console.error('답 제출 실패:', error)
      alert('답 제출에 실패했습니다')
    }
  }

  const handleModalClose = async (action) => {
    setShowModal(false)
    if (action === 'view') {
      navigate(`/study-logs/${completedStudyLog.id}`)
    } else {
      await loadCurrentQuiz()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="quiz-solve-page"><p>문제 로딩 중...</p></div>
  }

  if (!currentQuiz) {
    return (
      <div className="quiz-solve-page empty">
        <h2>문제가 없습니다</h2>
        <p>먼저 학습 기록을 생성하고 문제를 만들어주세요</p>
        <Link to="/">홈으로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div className="quiz-solve-page">
      <QueueProgressBar />

      {isCycleComplete && (
        <div className="cycle-complete-banner">
          <h2>🎉 한 바퀴 완료!</h2>
          <p>다시 처음부터 시작합니다</p>
        </div>
      )}

      <div className="quiz-container">
        <div className="quiz-header">
          <span className="study-log-title">{currentQuiz.studyLogTitle}</span>
          <span className="timer">{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="quiz-content">
          <h3 className="question">{currentQuiz.question}</h3>

          <form onSubmit={handleSubmit} className="answer-form">
            <textarea
              value={submittedAnswer}
              onChange={(e) => setSubmittedAnswer(e.target.value)}
              placeholder="답변을 입력하세요"
              rows="4"
              className="answer-input"
            />
            <button type="submit" className="submit-button">
              제출하기
            </button>
          </form>
        </div>
      </div>

      {showModal && (
        <StudyLogCompleteModal
          studyLog={completedStudyLog}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default QuizSolvePage
