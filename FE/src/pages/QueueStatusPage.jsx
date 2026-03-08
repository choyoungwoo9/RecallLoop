import { Link } from 'react-router-dom'

function QueueStatusPage() {
  return (
    <div>
      <h1>Queue 현황</h1>
      <Link to="/">홈으로</Link>
      <Link to="/queue/solve" style={{ marginLeft: '10px' }}>문제 풀기</Link>
    </div>
  )
}

export default QueueStatusPage
