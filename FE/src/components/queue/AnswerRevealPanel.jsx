import { useState } from 'react'
import { evaluateAttempt } from '../../api/queue'
import './AnswerRevealPanel.css'

function AnswerRevealPanel({ submittedAnswer, attemptId, onEvaluate }) {
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState(null)

  const handleEvaluate = async (evaluation) => {
    setEvaluating(true)
    setError(null)
    try {
      await evaluateAttempt(attemptId, evaluation)
      onEvaluate(evaluation)
    } catch (err) {
      console.error('평가 저장 실패:', err)
      setError('평가 저장에 실패했습니다')
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="answer-reveal-panel">
      <div className="answer-reveal__content">
        <div className="answer-reveal__submitted">
          <h3 className="answer-reveal__label">내 답변</h3>
          <div className="answer-reveal__text">{submittedAnswer}</div>
        </div>

        <div className="answer-reveal__divider" />

        <div className="answer-reveal__evaluation">
          <h3 className="answer-reveal__label">이 문제가 어땠나요?</h3>
          <p className="answer-reveal__description">
            자신의 학습 수준에 맞는 평가를 선택해주세요
          </p>

          {error && <div className="answer-reveal__error">{error}</div>}

          <div className="answer-reveal__buttons">
            <button
              type="button"
              className="btn btn-hard"
              onClick={() => handleEvaluate('TOO_HARD')}
              disabled={evaluating}
            >
              어려워요
            </button>
            <button
              type="button"
              className="btn btn-ok"
              onClick={() => handleEvaluate('OK')}
              disabled={evaluating}
            >
              적당해요
            </button>
            <button
              type="button"
              className="btn btn-easy"
              onClick={() => handleEvaluate('TOO_EASY')}
              disabled={evaluating}
            >
              쉬워요
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnswerRevealPanel
