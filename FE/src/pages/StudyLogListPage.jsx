import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStudyLogs } from '../api/studyLog'

function StudyLogListPage() {
  const [studyLogs, setStudyLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getStudyLogs()
      .then(data => {
        setStudyLogs(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error}</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>학습 기록 목록</h1>
        <div>
          <button
            onClick={() => navigate('/study-logs/new')}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            새 기록 작성
          </button>
          <Link to="/queue" style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>문제 풀기</Link>
        </div>
      </div>
      {studyLogs.length === 0 ? (
        <p>학습 기록이 없습니다. 새 기록을 작성해보세요!</p>
      ) : (
        <div>
          {studyLogs.map(log => (
            <div
              key={log.id}
              onClick={() => navigate(`/study-logs/${log.id}`)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0' }}>{log.title}</h3>
              <p style={{ margin: '0 0 8px 0', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.content}</p>
              <small style={{ color: '#999' }}>{new Date(log.createdAt).toLocaleDateString('ko-KR')}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudyLogListPage
