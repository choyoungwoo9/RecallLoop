import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStudyLog } from '../api/studyLog'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Textarea from '../components/common/Textarea'
import Card from '../components/common/Card'
import './StudyLogCreatePage.css'

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
    <Layout>
      <div className="study-log-create">
        <Card>
          <div className="study-log-create__header">
            <h2 className="study-log-create__title">새 학습 기록 작성</h2>
            <p className="study-log-create__subtitle">학습한 내용을 정리하세요</p>
          </div>

          {error && (
            <div className="study-log-create__error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="study-log-create__form">
            <Input
              label="제목"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="학습 제목을 입력하세요"
              required
              size="md"
            />

            <Textarea
              label="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공부한 내용을 상세히 입력하세요"
              required
              rows={12}
              size="lg"
            />

            <div className="study-log-create__actions">
              <Button
                type="submit"
                variant="success"
                size="lg"
                loading={submitting}
                disabled={submitting}
              >
                💾 저장
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate('/')}
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}

export default StudyLogCreatePage
