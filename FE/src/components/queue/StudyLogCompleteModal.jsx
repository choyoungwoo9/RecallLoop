import { useState, useEffect } from 'react'
import { getQuizzesByStudyLog } from '../../api/quiz'
import './StudyLogCompleteModal.css'

function StudyLogCompleteModal({ studyLog, onClose }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState(null)

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true)
        const data = await getQuizzesByStudyLog(studyLog.id)
        setQuizzes(data || [])
      } catch (error) {
        console.error('문제 로드 실패:', error)
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    }

    if (studyLog?.id) {
      loadQuizzes()
    }
  }, [studyLog])

  const toggleQuiz = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="modal-overlay">
      <div className="study-complete-modal">
        <div className="modal-header">
          <h2 className="modal-title">완주 축하합니다! 🎓</h2>
          <p className="modal-subtitle">
            <strong>{studyLog.title}</strong>의 모든 문제를 완주했습니다
          </p>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>문제를 불러오는 중...</p>
            </div>
          ) : quizzes.length > 0 ? (
            <div className="quiz-summary">
              <div className="summary-header">
                <span className="summary-label">생성된 문제</span>
                <span className="summary-count">{quizzes.length}개</span>
              </div>

              <div className="quiz-list">
                {quizzes.map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className={`quiz-item ${expandedIndex === index ? 'expanded' : ''}`}
                  >
                    <div
                      className="quiz-item-header"
                      onClick={() => toggleQuiz(index)}
                    >
                      <div className="quiz-number">Q{index + 1}</div>
                      <div className="quiz-question">{quiz.question}</div>
                      <div className="expand-icon">
                        {expandedIndex === index ? '▼' : '▶'}
                      </div>
                    </div>

                    {expandedIndex === index && (
                      <div className="quiz-item-content">
                        <div className="answer-section">
                          <div className="answer-label">정답</div>
                          <div className="answer-text">{quiz.answer}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>생성된 문제가 없습니다</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={() => onClose('continue')}
            className="btn btn-secondary"
          >
            계속 풀기
          </button>
          <button
            onClick={() => onClose('view')}
            className="btn btn-primary"
          >
            상세 기록 보기
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudyLogCompleteModal
