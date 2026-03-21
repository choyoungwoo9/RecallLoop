import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import { getAttemptHistory } from '../api/attemptHistory'
import './AttemptHistoryPage.css'

// ─── 유틸 함수 (StudyLogDetailPage에서도 재사용) ─────────────────────────

export function formatAvgSeconds(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}초`
  return `${Math.floor(seconds / 60)}분 ${Math.round(seconds % 60)}초`
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

// 학습 기록 ID 기준 문제별 통계 집계
export function buildQuizStats(items, studyLogId) {
  const filtered = studyLogId ? items.filter(i => i.studyLogId === studyLogId) : items
  const map = {}
  filtered.forEach(item => {
    if (!map[item.quizId]) {
      map[item.quizId] = {
        quizId: item.quizId,
        question: item.question,
        correctAnswer: item.correctAnswer,
        attemptCount: 0,
        totalElapsed: 0,
        lastAttemptedAt: item.attemptedAt,
        latestAttempt: item,
      }
    }
    const g = map[item.quizId]
    g.attemptCount++
    g.totalElapsed += item.elapsedSeconds
    if (item.attemptedAt > g.lastAttemptedAt) {
      g.lastAttemptedAt = item.attemptedAt
      g.latestAttempt = item
    }
  })
  return Object.values(map).map(g => ({
    ...g,
    avgElapsedSeconds: g.attemptCount > 0 ? g.totalElapsed / g.attemptCount : 0,
  })).sort((a, b) => b.lastAttemptedAt.localeCompare(a.lastAttemptedAt))
}

// ─── QuizRow 컴포넌트 (StudyLogDetailPage에서도 재사용) ────────────────────

export function QuizRow({ quizStat }) {
  const [expanded, setExpanded] = useState(false)
  const latest = quizStat.latestAttempt

  return (
    <div className="quiz-row" onClick={() => setExpanded(e => !e)}>
      <div className="quiz-row__main">
        <p className="quiz-row__question">{quizStat.question}</p>
        <div className="quiz-row__meta">
          <span className="quiz-row__meta-item">{quizStat.attemptCount}회 풀이</span>
          <span className="quiz-row__meta-item">평균 {formatAvgSeconds(quizStat.avgElapsedSeconds)}</span>
          <span className="quiz-row__meta-item">최근 {formatDateShort(quizStat.lastAttemptedAt)}</span>
          <span className={`quiz-row__arrow ${expanded ? 'quiz-row__arrow--up' : ''}`}>▼</span>
        </div>
      </div>
      {expanded && latest && (
        <div className="quiz-row__detail">
          <div className="quiz-row__answer-row">
            <div className="quiz-row__answer quiz-row__answer--mine">
              <span className="quiz-row__answer-label">내 최근 답변</span>
              <p className="quiz-row__answer-text">{latest.submittedAnswer || '(미입력)'}</p>
              <span className="quiz-row__answer-time">{latest.elapsedSeconds}초</span>
            </div>
            <div className="quiz-row__answer quiz-row__answer--correct">
              <span className="quiz-row__answer-label">정답</span>
              <p className="quiz-row__answer-text">{quizStat.correctAnswer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 사이클 그룹핑 ──────────────────────────────────────────────────────

function truncateToMinute(dateStr) {
  // "2026-03-21T14:35:22.xxx" → "2026-03-21T14:35"
  return dateStr ? dateStr.substring(0, 16) : null
}

function groupByCycle(items) {
  const currentItems = items.filter(i => i.isCurrent)
  const historyItems = items.filter(i => !i.isCurrent)

  // 이전 사이클들: migratedAt 분 단위로 그룹핑
  const cycleMap = {}
  historyItems.forEach(item => {
    const key = truncateToMinute(item.migratedAt)
    if (!cycleMap[key]) {
      cycleMap[key] = { key, migratedAt: item.migratedAt, items: [] }
    }
    cycleMap[key].items.push(item)
  })

  const pastCycles = Object.values(cycleMap).sort((a, b) =>
    b.migratedAt.localeCompare(a.migratedAt)
  )

  const result = []
  if (currentItems.length > 0) {
    result.push({ label: '현재 사이클', isCurrent: true, items: currentItems })
  }
  pastCycles.forEach((cycle, idx) => {
    const date = new Date(cycle.migratedAt)
    const label = `${date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} 완료 (사이클 ${pastCycles.length - idx})`
    result.push({ label, isCurrent: false, items: cycle.items })
  })

  return result
}

// ─── CycleAttemptItem ─────────────────────────────────────────────────

function CycleAttemptItem({ item }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="cycle-item" onClick={() => setExpanded(e => !e)}>
      <div className="cycle-item__main">
        <span className="cycle-item__study-log">{item.studyLogTitle}</span>
        <p className="cycle-item__question">{item.question}</p>
        <div className="cycle-item__meta">
          <span className="cycle-item__time">{item.elapsedSeconds}초</span>
          <span className={`cycle-item__arrow ${expanded ? 'cycle-item__arrow--up' : ''}`}>▼</span>
        </div>
      </div>
      {expanded && (
        <div className="quiz-row__detail">
          <div className="quiz-row__answer-row">
            <div className="quiz-row__answer quiz-row__answer--mine">
              <span className="quiz-row__answer-label">내 답변</span>
              <p className="quiz-row__answer-text">{item.submittedAnswer || '(미입력)'}</p>
            </div>
            <div className="quiz-row__answer quiz-row__answer--correct">
              <span className="quiz-row__answer-label">정답</span>
              <p className="quiz-row__answer-text">{item.correctAnswer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CycleSection ────────────────────────────────────────────────────

function CycleSection({ cycle, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="cycle-section">
      <div className="cycle-section__header" onClick={() => setOpen(o => !o)}>
        <div className="cycle-section__title-row">
          {cycle.isCurrent && <span className="cycle-section__badge cycle-section__badge--current">진행 중</span>}
          <span className="cycle-section__label">{cycle.label}</span>
        </div>
        <div className="cycle-section__right">
          <span className="cycle-section__count">{cycle.items.length}문제</span>
          <span className={`cycle-section__arrow ${open ? 'cycle-section__arrow--up' : ''}`}>▼</span>
        </div>
      </div>
      {open && (
        <div className="cycle-section__body">
          {cycle.items.map(item => (
            <CycleAttemptItem key={`${item.isCurrent ? 'c' : 'h'}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 페이지 ─────────────────────────────────────────────────────────

function AttemptHistoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAttemptHistory()
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const cycles = groupByCycle(items)

  if (loading) {
    return <Layout><div className="attempt-history__loading">불러오는 중...</div></Layout>
  }
  if (error) {
    return <Layout><div className="attempt-history__error">오류가 발생했습니다: {error}</div></Layout>
  }

  return (
    <Layout>
      <div className="attempt-history">
        <div className="attempt-history__header">
          <h2 className="attempt-history__title">풀이 기록</h2>
          <p className="attempt-history__subtitle">사이클 단위로 지금까지의 풀이를 확인하세요</p>
        </div>

        {cycles.length === 0 ? (
          <div className="attempt-history__empty">
            <p>아직 풀이 기록이 없습니다.</p>
            <p>문제를 풀면 여기에 기록이 쌓입니다.</p>
          </div>
        ) : (
          <div className="cycle-list">
            {cycles.map((cycle, idx) => (
              <CycleSection key={cycle.label} cycle={cycle} defaultOpen={idx === 0} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AttemptHistoryPage
