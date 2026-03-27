import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import StudyLogListPage from './pages/StudyLogListPage'
import StudyLogCreatePage from './pages/StudyLogCreatePage'
import StudyLogDetailPage from './pages/StudyLogDetailPage'
import QueueStatusPage from './pages/QueueStatusPage'
import QuizSolvePage from './pages/QuizSolvePage'
import AttemptHistoryPage from './pages/AttemptHistoryPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/study-logs" element={<StudyLogListPage />} />
      <Route path="/study-logs/new" element={<StudyLogCreatePage />} />
      <Route path="/study-logs/:id" element={<StudyLogDetailPage />} />
      <Route path="/queue" element={<QueueStatusPage />} />
      <Route path="/queue/solve" element={<QuizSolvePage />} />
      <Route path="/history" element={<AttemptHistoryPage />} />
    </Routes>
  )
}

export default App
