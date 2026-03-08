import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudyLog, deleteStudyLog } from '../api/studyLog'

function StudyLogDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [studyLog, setStudyLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getStudyLog(id)
      .then(data => {
        setStudyLog(data)
        setLoading(false)
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setError('학습 기록을 찾을 수 없습니다.')
        } else {
          setError('불러오기에 실패했습니다.')
        }
        setLoading(false)
      })
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      await deleteStudyLog(id)
      navigate('/')
    } catch (err) {
      setError('삭제에 실패했습니다.')
      setDeleting(false)
    }
  }

  if (loading) return <div>로딩 중...</div>
  if (error) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>
      <button onClick={() => navigate('/')} style={{ padding: '8px 16px' }}>목록으로</button>
    </div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>{studyLog.title}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '8px 16px', backgroundColor: '#9E9E9E', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            목록으로
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ padding: '8px 16px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: deleting ? 'not-allowed' : 'pointer' }}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
      <small style={{ color: '#999', display: 'block', marginBottom: '20px' }}>
        작성일: {new Date(studyLog.createdAt).toLocaleString('ko-KR')}
      </small>
      <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {studyLog.content}
      </div>
    </div>
  )
}

export default StudyLogDetailPage
