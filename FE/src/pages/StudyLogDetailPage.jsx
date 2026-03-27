import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudyLog, deleteStudyLog } from '../api/studyLog'
import { getQuizConfigs, createQuizConfig, deleteQuizConfig, generateQuizzes } from '../api/quizConfig'
import { getQuizzesByStudyLog, deleteQuiz } from '../api/quiz'
import { getAttemptHistory } from '../api/attemptHistory'
import { buildQuizStats, QuizRow } from './AttemptHistoryPage'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Textarea from '../components/common/Textarea'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Tabs from '../components/common/Tabs'
import ConfirmModal from '../components/common/ConfirmModal'
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
  const [newConfigDescription, setNewConfigDescription] = useState('핵심 개념 정리')
  const [newConfigCount, setNewConfigCount] = useState(5)
  const [creatingConfig, setCreatingConfig] = useState(false)
  const [generatingQuizzes, setGeneratingQuizzes] = useState(null)
  const [activeTab, setActiveTab] = useState('content')
  const [attemptItems, setAttemptItems] = useState([])
  const [attemptsLoaded, setAttemptsLoaded] = useState(false)
  const [attemptsLoading, setAttemptsLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    variant: 'danger',
    action: null
  })

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
      setConfirmModal({
        isOpen: true,
        title: '입력 오류',
        message: '설명을 입력하세요.',
        confirmText: '확인',
        cancelText: '',
        variant: 'info',
        action: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      })
      return
    }
    setCreatingConfig(true)
    try {
      await createQuizConfig(id, {
        description: newConfigDescription,
        questionCount: newConfigCount
      })
      setNewConfigDescription('핵심 개념 정리')
      setNewConfigCount(5)
      loadQuizConfigs()
    } catch (err) {
      setConfirmModal({
        isOpen: true,
        title: '오류',
        message: 'QuizConfig 생성에 실패했습니다.',
        confirmText: '확인',
        cancelText: '',
        variant: 'info',
        action: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      })
    } finally {
      setCreatingConfig(false)
    }
  }

  const handleDeleteConfig = (configId) => {
    setConfirmModal({
      isOpen: true,
      title: '설정 삭제',
      message: '이 설정을 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
      action: async () => {
        try {
          await deleteQuizConfig(configId)
          loadQuizConfigs()
          loadQuizzes()
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        } catch (err) {
          setConfirmModal({
            isOpen: true,
            title: '오류',
            message: 'QuizConfig 삭제에 실패했습니다.',
            confirmText: '확인',
            cancelText: '',
            variant: 'info',
            action: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
          })
        }
      }
    })
  }

  const handleGenerateQuizzes = async (configId) => {
    setGeneratingQuizzes(configId)
    try {
      await generateQuizzes(configId)
      loadQuizzes()
      setConfirmModal({
        isOpen: true,
        title: '성공',
        message: '문제가 생성되었습니다.',
        confirmText: '확인',
        cancelText: '',
        variant: 'success',
        action: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
          setActiveTab('quizzes')
        }
      })
    } catch (err) {
      setConfirmModal({
        isOpen: true,
        title: '오류',
        message: '문제 생성에 실패했습니다.',
        confirmText: '확인',
        cancelText: '',
        variant: 'info',
        action: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      })
    } finally {
      setGeneratingQuizzes(null)
    }
  }

  const handleDeleteQuiz = (quizId) => {
    setConfirmModal({
      isOpen: true,
      title: '문제 삭제',
      message: '이 문제를 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
      action: async () => {
        try {
          await deleteQuiz(quizId)
          loadQuizzes()
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        } catch (err) {
          setConfirmModal({
            isOpen: true,
            title: '오류',
            message: '문제 삭제에 실패했습니다.',
            confirmText: '확인',
            cancelText: '',
            variant: 'info',
            action: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
          })
        }
      }
    })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'attempts' && !attemptsLoaded) {
      setAttemptsLoading(true)
      getAttemptHistory(id)
        .then(data => {
          setAttemptItems(data)
          setAttemptsLoaded(true)
        })
        .catch(() => {})
        .finally(() => setAttemptsLoading(false))
    }
  }

  const handleDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: '학습 기록 삭제',
      message: '정말 이 학습 기록을 삭제하시겠습니까? 연관된 모든 문제도 함께 삭제됩니다.',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
      action: async () => {
        setDeleting(true)
        try {
          await deleteStudyLog(id)
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
          navigate('/study-logs')
        } catch (err) {
          setError('삭제에 실패했습니다.')
          setDeleting(false)
          setConfirmModal({
            isOpen: true,
            title: '오류',
            message: '삭제에 실패했습니다.',
            confirmText: '확인',
            cancelText: '',
            variant: 'info',
            action: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
          })
        }
      }
    })
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
        <Button onClick={() => navigate('/study-logs')}>목록으로</Button>
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
              작성일: {new Date(studyLog.createdAt).toLocaleString('ko-KR')}
            </small>
          </div>
          <div className="study-log-detail__actions">
            <Button
              variant="secondary"
              onClick={() => navigate('/study-logs')}
            >
              ← 목록으로
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              삭제
            </Button>
          </div>
        </div>

        <Tabs
          tabs={[
            {
              id: 'content',
              label: '학습 내용',
              icon: null,
              content: (
                <Card className="study-log-detail__content-card">
                  <div className="study-log-detail__content">
                    {studyLog.content}
                  </div>
                </Card>
              )
            },
            {
              id: 'quizzes',
              label: '생성된 문제',
              icon: null,
              content: (
                <>
                  {quizzesLoading ? (
                    <LoadingSpinner size="sm" text="문제 로딩 중..." />
                  ) : quizzes.length === 0 ? (
                    <div className="study-log-detail__empty">
                      <p>생성된 문제가 없습니다. 아래 탭에서 설정을 추가하여 문제를 생성하세요.</p>
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
                </>
              )
            },
            {
              id: 'attempts',
              label: '풀이 기록',
              icon: null,
              content: (
                <>
                  {attemptsLoading ? (
                    <LoadingSpinner size="sm" text="풀이 기록 불러오는 중..." />
                  ) : attemptsLoaded && attemptItems.length === 0 ? (
                    <div className="attempt-tab__empty">아직 이 기록의 풀이 이력이 없습니다.</div>
                  ) : (
                    <div className="attempt-tab">
                      {buildQuizStats(attemptItems, Number(id)).map(qs => (
                        <QuizRow key={qs.quizId} quizStat={qs} />
                      ))}
                    </div>
                  )}
                </>
              )
            },
            {
              id: 'settings',
              label: '문제 생성 설정',
              icon: null,
              content: (
                <>
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
                                {config.questionCount}개 문제
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
                            문제 생성
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )
            }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          variant={confirmModal.variant}
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          loading={deleting || creatingConfig}
        />
      </div>
    </Layout>
  )
}

export default StudyLogDetailPage
