import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import { getAttemptHistory } from '../api/attemptHistory'
import { getStudyLogs } from '../api/studyLog'
import './AttemptHistoryPage.css'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function groupByDate(items) {
  const groups = {}
  items.forEach(item => {
    const date = formatDate(item.attemptedAt)
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
  })
  return Object.entries(groups)
}

function AttemptItem({ item }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="attempt-item" onClick={() => setExpanded(e => !e)}>
      <div className="attempt-item__header">
        <div className="attempt-item__meta">
          <span className="attempt-item__study-log">{item.studyLogTitle}</span>
          {item.isCurrent && <span className="attempt-item__badge attempt-item__badge--current">현재 사이클</span>}
        </div>
        <div className="attempt-item__right">
          <span className="attempt-item__time">{item.elapsedSeconds}초</span>
          <span className="attempt-item__datetime">{formatDateTime(item.attemptedAt)}</span>
          <span className={`attempt-item__arrow ${expanded ? 'attempt-item__arrow--up' : ''}`}>▼</span>
        </div>
      </div>
      <p className="attempt-item__question">{item.question}</p>

      {expanded && (
        <div className="attempt-item__detail">
          <div className="attempt-item__answer-row">
            <div className="attempt-item__answer attempt-item__answer--mine">
              <span className="attempt-item__answer-label">내 답변</span>
              <p className="attempt-item__answer-text">{item.submittedAnswer || '(미입력)'}</p>
            </div>
            <div className="attempt-item__answer attempt-item__answer--correct">
              <span className="attempt-item__answer-label">정답</span>
              <p className="attempt-item__answer-text">{item.correctAnswer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AttemptHistoryPage() {
  const [items, setItems] = useState([])
  const [studyLogs, setStudyLogs] = useState([])
  const [selectedStudyLogId, setSelectedStudyLogId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getStudyLogs().then(setStudyLogs).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAttemptHistory(selectedStudyLogId || null)
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedStudyLogId])

  const grouped = groupByDate(items)

  return (
    <Layout>
      <div className="attempt-history">
        <div className="attempt-history__header">
          <h2 className="attempt-history__title">풀이 기록</h2>
          <select
            className="attempt-history__filter"
            value={selectedStudyLogId}
            onChange={e => setSelectedStudyLogId(e.target.value)}
          >
            <option value="">전체 기록</option>
            {studyLogs.map(log => (
              <option key={log.id} value={log.id}>{log.title}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="attempt-history__loading">불러오는 중...</div>
        )}

        {error && (
          <div className="attempt-history__error">오류가 발생했습니다: {error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="attempt-history__empty">
            <p>아직 풀이 기록이 없습니다.</p>
            <p>문제를 풀면 여기에 기록이 쌓입니다.</p>
          </div>
        )}

        {!loading && !error && grouped.map(([date, dateItems]) => (
          <div key={date} className="attempt-history__group">
            <div className="attempt-history__group-date">{date}</div>
            <div className="attempt-history__group-items">
              {dateItems.map(item => (
                <AttemptItem key={`${item.isCurrent ? 'c' : 'h'}-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export default AttemptHistoryPage
