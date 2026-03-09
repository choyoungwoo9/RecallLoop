import { useState, useEffect } from 'react'
import { getCompletionSummary } from '../../api/completionSummary'
import './CompletionQuizzesModal.css'

function CompletionQuizzesModal({ studyLog, isCycleComplete, onAction }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState(null)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true)
        const summary = await getCompletionSummary(studyLog.id)
        setData(summary)
      } catch (error) {
        console.error('완주 요약 로드 실패:', error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    if (studyLog?.id) {
      loadSummary()
    }
  }, [studyLog])

  const toggleQuiz = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="completion-modal">
          <div className="loading-state">
            <div className="spinner" />
            <p>완주 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const quizzes = data?.quizzes || []

  return (
    <div className="modal-overlay">
      <div className="completion-modal">
        <div className="modal-header">
          {isCycleComplete ? (
            <>
              <h2 className="modal-title">완주 축하합니다! 🎓</h2>
              <p className="modal-subtitle">
                한 바퀴를 모두 돌았습니다. 계속해서 복습하세요!
              </p>
            </>
          ) : (
            <>
              <h2 className="modal-title">모든 문제 완주!</h2>
              <p className="modal-subtitle">
                <strong>{studyLog.title}</strong>의 모든 문제를 풀었습니다
              </p>
            </>
          )}
        </div>

        <div className="modal-panels">
          {/* 왼쪽 패널: 문제 비교 */}
          <div className="panel-left">
            {quizzes.length > 0 ? (
              <div className="quiz-comparison">
                <div className="summary-header">
                  <span className="summary-label">풀이한 문제</span>
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
                          <div className="answer-comparison">
                            <div className="your-answer">
                              <div className="answer-label your">내 답변</div>
                              <div className="answer-text">
                                {quiz.submittedAnswer}
                              </div>
                              {quiz.elapsedSeconds > 0 && (
                                <div className="elapsed-time">
                                  소요 시간: {Math.floor(quiz.elapsedSeconds / 60)}분 {quiz.elapsedSeconds % 60}초
                                </div>
                              )}
                            </div>

                            <div className="divider" />

                            <div className="correct-answer">
                              <div className="answer-label correct">정답</div>
                              <div className="answer-text">
                                {quiz.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>풀이한 문제가 없습니다</p>
              </div>
            )}
          </div>

          {/* 오른쪽 패널: 학습 기록 정보 */}
          <div className="panel-right">
            <div className="study-log-summary">
              <h2 className="study-title">{studyLog.title}</h2>

              <div className="divider-right" />

              <p className="completion-message">
                축하합니다! 이 학습 기록의 모든 문제를 완주했습니다. 계속해서 다른 기록을 학습하거나, 이 기록을 다시 복습해보세요.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => onAction('continue')}
            className="btn btn-secondary"
          >
            계속 풀기
          </button>
          <button
            onClick={() => onAction('navigate')}
            className="btn btn-primary"
          >
            기록 상세 보기
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompletionQuizzesModal
