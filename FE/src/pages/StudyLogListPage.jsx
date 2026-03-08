import { Link } from 'react-router-dom'

function StudyLogListPage() {
  return (
    <div>
      <h1>학습 기록 목록</h1>
      <Link to="/study-logs/new">새 기록 작성</Link>
      <Link to="/queue" style={{ marginLeft: '10px' }}>문제 풀기</Link>
    </div>
  )
}

export default StudyLogListPage
