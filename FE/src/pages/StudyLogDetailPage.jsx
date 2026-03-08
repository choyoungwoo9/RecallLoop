import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudyLog, deleteStudyLog } from '../api/studyLog'
import { getQuizConfigs, createQuizConfig, deleteQuizConfig, generateQuizzes } from '../api/quizConfig'
import { getQuizzesByStudyLog, deleteQuiz } from '../api/quiz'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Textarea from '../components/common/Textarea'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './StudyLogDetailPage.css'

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

  if (loading) return (
    <Layout>
      <LoadingSpinner />
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="study-log-detail__error">
        <div className="study-log-detail__error-message">❌ {error}</div>
        <Button onClick={() => navigate('/')}>목록으로</Button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="study-log-detail">
        <div className="study-log-detail__header">
          <div className="study-log-detail__title-section">
            <h1 className="study-log-detail__title">{studyLog.title}</h1>
            <small className="study-log-detail__date">
              📅 작성일: {new Date(studyLog.createdAt).toLocaleString('ko-KR')}
            </small>
          </div>
          <div className="study-log-detail__actions">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
            >
              ← 목록으로
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              🗑️ 삭제
            </Button>
          </div>
        </div>

        <Card className="study-log-detail__content-card">
          <div className="study-log-detail__content">
            {studyLog.content}
          </div>
        </Card>

        <div className="study-log-detail__section">
          <h2 className="study-log-detail__section-title">🎯 생성된 문제</h2>

          {quizzesLoading ? (
            <LoadingSpinner size="sm" text="문제 로딩 중..." />
          ) : quizzes.length === 0 ? (
            <div className="study-log-detail__empty">
              <p>생성된 문제가 없습니다. 아래에서 설정을 추가하여 문제를 생성하세요.</p>
            </div>
          ) : (
            <div className="study-log-detail__quizzes">
              {quizzes.map((quiz, index) => (
                <Card key={quiz.id} className="study-log-detail__quiz-card">
                  <div className="study-log-detail__quiz-header">
                    <div className="study-log-detail__quiz-number">Q{index + 1}</div>
                    <p className="study-log-detail__quiz-text">{quiz.question}</p>
                  </div>
                  <div className="study-log-detail__quiz-footer">
                    <small className="study-log-detail__quiz-date">
                      {new Date(quiz.createdAt).toLocaleString('ko-KR')}
                    </small>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="study-log-detail__section">
          <h2 className="study-log-detail__section-title">⚙️ 문제 생성 설정</h2>

          <Card className="study-log-detail__config-form-card">
            <div className="study-log-detail__form-group">
              <Textarea
                label="설명"
                value={newConfigDescription}
                onChange={(e) => setNewConfigDescription(e.target.value)}
                placeholder="예: 핵심 개념을 설명하는 문제를 만들어줘"
                rows={4}
                size="md"
              />
            </div>

            <div className="study-log-detail__form-group">
              <Input
                label="생성할 문제 개수"
                type="number"
                value={newConfigCount}
                onChange={(e) => setNewConfigCount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
                size="sm"
              />
            </div>

            <Button
              variant="info"
              size="md"
              onClick={handleCreateConfig}
              loading={creatingConfig}
              disabled={creatingConfig}
            >
              설정 추가
            </Button>
          </Card>

          {configsLoading ? (
            <LoadingSpinner size="sm" text="설정 로딩 중..." />
          ) : quizConfigs.length === 0 ? (
            <div className="study-log-detail__empty">
              <p>설정이 없습니다. 새로운 설정을 추가하세요.</p>
            </div>
          ) : (
            <div className="study-log-detail__configs">
              {quizConfigs.map(config => (
                <Card key={config.id} className="study-log-detail__config-card">
                  <div className="study-log-detail__config-header">
                    <div>
                      <h4 className="study-log-detail__config-description">{config.description}</h4>
                      <small className="study-log-detail__config-count">
                        📝 {config.questionCount}개 문제
                      </small>
                    </div>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleDeleteConfig(config.id)}
                    >
                      삭제
                    </Button>
                  </div>
                  <Button
                    variant="success"
                    size="md"
                    className="study-log-detail__generate-btn"
                    onClick={() => handleGenerateQuizzes(config.id)}
                    loading={generatingQuizzes === config.id}
                    disabled={generatingQuizzes === config.id}
                  >
                    🤖 문제 생성
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default StudyLogDetailPage
