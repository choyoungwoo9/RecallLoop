import { useNavigate } from 'react-router-dom'
import Card from '../common/Card'
import './StudyLogCard.css'

function StudyLogCard({ studyLog }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/study-logs/${studyLog.id}`)
  }

  const createdDate = new Date(studyLog.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <Card
      hoverable
      clickable
      onClick={handleClick}
      className="study-log-card"
    >
      <div className="study-log-card__content">
        <h3 className="study-log-card__title">{studyLog.title}</h3>

        <p className="study-log-card__description">
          {studyLog.content.substring(0, 100)}
          {studyLog.content.length > 100 ? '...' : ''}
        </p>

        <div className="study-log-card__footer">
          <span className="study-log-card__date">{createdDate}</span>
          <span className="study-log-card__meta">
            {studyLog.quizCount ? `${studyLog.quizCount}개 문제` : '0개 문제'}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default StudyLogCard
