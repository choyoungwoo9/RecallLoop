import { Link } from 'react-router-dom'

function QuizSolvePage() {
  return (
    <div>
      <h1>문제 풀기</h1>
      <Link to="/queue">Queue 현황</Link>
    </div>
  )
}

export default QuizSolvePage
