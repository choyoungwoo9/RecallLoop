import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStudyLog } from '../api/studyLog'

function StudyLogCreatePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createStudyLog({ title: title.trim(), content: content.trim() })
      navigate('/')
    } catch (err) {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>새 학습 기록 작성</h1>
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="학습 제목을 입력하세요"
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="학습 내용을 입력하세요"
            rows={10}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '10px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ padding: '10px 24px', backgroundColor: '#9E9E9E', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default StudyLogCreatePage
