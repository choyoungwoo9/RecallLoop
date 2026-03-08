import './StudyLogCompleteModal.css'

function StudyLogCompleteModal({ studyLog, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>🎓 학습 완주!</h2>
        <p className="modal-message">
          <strong>{studyLog.title}</strong>의 모든 문제를 완주했습니다!
        </p>
        <div className="modal-buttons">
          <button
            onClick={() => onClose('view')}
            className="btn btn-primary"
          >
            학습 기록 보기
          </button>
          <button
            onClick={() => onClose('continue')}
            className="btn btn-secondary"
          >
            계속 풀기
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudyLogCompleteModal
