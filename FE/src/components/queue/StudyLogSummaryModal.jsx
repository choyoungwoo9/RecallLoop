import './StudyLogSummaryModal.css'

function StudyLogSummaryModal({ studyLog, onAction }) {
  return (
    <div className="modal-overlay">
      <div className="summary-modal">
        <div className="modal-header">
          <button className="back-button" onClick={() => onAction('back')}>
            ← 돌아가기
          </button>
        </div>

        <div className="modal-body">
          <div className="study-log-summary">
            <h2 className="study-title">{studyLog.title}</h2>

            <div className="divider" />

            <p className="completion-message">
              축하합니다! 이 학습 기록의 모든 문제를 완주했습니다. 계속해서 다른 기록을 학습하거나, 이 기록을 다시 복습해보세요.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => onAction('back')}
            className="btn btn-secondary"
          >
            문제 다시 보기
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

export default StudyLogSummaryModal
