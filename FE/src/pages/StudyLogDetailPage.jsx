import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudyLog, deleteStudyLog } from '../api/studyLog'
import { getQuizConfigs, createQuizConfig, deleteQuizConfig, generateQuizzes } from '../api/quizConfig'
import { getQuizzesByStudyLog, deleteQuiz } from '../api/quiz'

function StudyLogDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [studyLog, setStudyLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [quizConfigs, setQuizConfigs] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [configsLoading, setConfigsLoading] = useState(false)
  const [quizzesLoading, setQuizzesLoading] = useState(false)
  const [newConfigDescription, setNewConfigDescription] = useState('')
  const [newConfigCount, setNewConfigCount] = useState(5)
  const [creatingConfig, setCreatingConfig] = useState(false)
  const [generatingQuizzes, setGeneratingQuizzes] = useState(null)

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

  const loadQuizConfigs = () => {
    setConfigsLoading(true)
    getQuizConfigs(id)
      .then(data => {
        setQuizConfigs(data)
        setConfigsLoading(false)
      })
      .catch(err => {
        console.error('QuizConfig 불러오기 실패:', err)
        setConfigsLoading(false)
      })
  }

  const loadQuizzes = () => {
    setQuizzesLoading(true)
    getQuizzesByStudyLog(id)
      .then(data => {
        setQuizzes(data)
        setQuizzesLoading(false)
      })
      .catch(err => {
        console.error('Quizzes 불러오기 실패:', err)
        setQuizzesLoading(false)
      })
  }

  useEffect(() => {
    if (studyLog) {
      loadQuizConfigs()
      loadQuizzes()
    }
  }, [studyLog])

  const handleCreateConfig = async () => {
    if (!newConfigDescription.trim()) {
      alert('설명을 입력하세요.')
      return
    }
    setCreatingConfig(true)
    try {
      await createQuizConfig(id, {
        description: newConfigDescription,
        questionCount: newConfigCount
      })
      setNewConfigDescription('')
      setNewConfigCount(5)
      loadQuizConfigs()
    } catch (err) {
      alert('QuizConfig 생성에 실패했습니다.')
    } finally {
      setCreatingConfig(false)
    }
  }

  const handleDeleteConfig = async (configId) => {
    if (!window.confirm('이 설정을 삭제하시겠습니까?')) return
    try {
      await deleteQuizConfig(configId)
      loadQuizConfigs()
      loadQuizzes()
    } catch (err) {
      alert('QuizConfig 삭제에 실패했습니다.')
    }
  }

  const handleGenerateQuizzes = async (configId) => {
    setGeneratingQuizzes(configId)
    try {
      await generateQuizzes(configId)
      loadQuizzes()
    } catch (err) {
      alert('문제 생성에 실패했습니다.')
    } finally {
      setGeneratingQuizzes(null)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('이 문제를 삭제하시겠습니까?')) return
    try {
      await deleteQuiz(quizId)
      loadQuizzes()
    } catch (err) {
      alert('문제 삭제에 실패했습니다.')
    }
  }

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
      <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa', whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '30px' }}>
        {studyLog.content}
      </div>

      <div style={{ marginBottom: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h2>문제 생성 설정</h2>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>설명</label>
            <textarea
              value={newConfigDescription}
              onChange={(e) => setNewConfigDescription(e.target.value)}
              placeholder="예: 핵심 개념을 설명하는 문제를 만들어줘"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', minHeight: '80px' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>생성할 문제 개수</label>
            <input
              type="number"
              value={newConfigCount}
              onChange={(e) => setNewConfigCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="20"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100px' }}
            />
          </div>
          <button
            onClick={handleCreateConfig}
            disabled={creatingConfig}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creatingConfig ? 'not-allowed' : 'pointer'
            }}
          >
            {creatingConfig ? '생성 중...' : '설정 추가'}
          </button>
        </div>

        {configsLoading ? (
          <div>설정 로딩 중...</div>
        ) : quizConfigs.length === 0 ? (
          <div style={{ color: '#999' }}>설정이 없습니다. 새로운 설정을 추가하세요.</div>
        ) : (
          <div>
            {quizConfigs.map(config => (
              <div key={config.id} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{config.description}</h4>
                    <small style={{ color: '#999' }}>문제 개수: {config.questionCount}</small>
                  </div>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    style={{ padding: '4px 12px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    삭제
                  </button>
                </div>
                <button
                  onClick={() => handleGenerateQuizzes(config.id)}
                  disabled={generatingQuizzes === config.id}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: generatingQuizzes === config.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {generatingQuizzes === config.id ? '생성 중...' : '문제 생성'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h2>생성된 문제</h2>
        {quizzesLoading ? (
          <div>문제 로딩 중...</div>
        ) : quizzes.length === 0 ? (
          <div style={{ color: '#999' }}>생성된 문제가 없습니다.</div>
        ) : (
          <div>
            {quizzes.map(quiz => (
              <div key={quiz.id} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 6px 0' }}>
                      <strong>Q{quiz.queueOrder}:</strong> {quiz.question}
                    </p>
                    <small style={{ color: '#999' }}>
                      {new Date(quiz.createdAt).toLocaleString('ko-KR')}
                    </small>
                  </div>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginLeft: '8px',
                      flexShrink: 0
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyLogDetailPage
