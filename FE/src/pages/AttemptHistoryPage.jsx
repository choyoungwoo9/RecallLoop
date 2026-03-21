import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import { getAttemptHistory } from '../api/attemptHistory'
import './AttemptHistoryPage.css'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

function formatAvgSeconds(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}초`
  return `${Math.floor(seconds / 60)}분 ${Math.round(seconds % 60)}초`
}

function buildStudyLogSummaries(items) {
  const map = {}
  items.forEach(item => {
    if (!map[item.studyLogId]) {
      map[item.studyLogId] = {
        studyLogId: item.studyLogId,
        studyLogTitle: item.studyLogTitle,
        totalAttempts: 0,
        quizIds: new Set(),
        totalElapsed: 0,
        lastAttemptedAt: item.attemptedAt,
      }
    }
    const g = map[item.studyLogId]
    g.totalAttempts++
    g.quizIds.add(item.quizId)
    g.totalElapsed += item.elapsedSeconds
    if (item.attemptedAt > g.lastAttemptedAt) g.lastAttemptedAt = item.attemptedAt
  })
  return Object.values(map).map(g => ({
    ...g,
    uniqueQuizCount: g.quizIds.size,
    avgElapsedSeconds: g.totalAttempts > 0 ? g.totalElapsed / g.totalAttempts : 0,
  })).sort((a, b) => b.lastAttemptedAt.localeCompare(a.lastAttemptedAt))
}

function buildQuizStats(items, studyLogId) {
  const filtered = items.filter(i => i.studyLogId === studyLogId)
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
        attempts: [],
      }
    }
    const g = map[item.quizId]
    g.attemptCount++
    g.totalElapsed += item.elapsedSeconds
    if (item.attemptedAt > g.lastAttemptedAt) g.lastAttemptedAt = item.attemptedAt
    g.attempts.push(item)
  })
  return Object.values(map).map(g => ({
    ...g,
    avgElapsedSeconds: g.attemptCount > 0 ? g.totalElapsed / g.attemptCount : 0,
    attempts: g.attempts.sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt)),
  })).sort((a, b) => b.lastAttemptedAt.localeCompare(a.lastAttemptedAt))
}

function StudyLogCard({ summary, onClick }) {
  return (
    <div className="history-card" onClick={onClick}>
      <h3 className="history-card__title">{summary.studyLogTitle}</h3>
      <div className="history-card__stats">
        <div className="history-card__stat">
          <span className="history-card__stat-label">문제 수</span>
          <span className="history-card__stat-value">{summary.uniqueQuizCount}개</span>
        </div>
        <div className="history-card__stat">
          <span className="history-card__stat-label">총 풀이</span>
          <span className="history-card__stat-value">{summary.totalAttempts}회</span>
        </div>
        <div className="history-card__stat">
          <span className="history-card__stat-label">평균 소요</span>
          <span className="history-card__stat-value">{formatAvgSeconds(summary.avgElapsedSeconds)}</span>
        </div>
        <div className="history-card__stat">
          <span className="history-card__stat-label">마지막 풀이</span>
          <span className="history-card__stat-value">{formatDate(summary.lastAttemptedAt)}</span>
        </div>
      </div>
    </div>
  )
}

function QuizRow({ quizStat }) {
  const [expanded, setExpanded] = useState(false)
  const latest = quizStat.attempts[0]

  return (
    <div className="quiz-row" onClick={() => setExpanded(e => !e)}>
      <div className="quiz-row__main">
        <p className="quiz-row__question">{quizStat.question}</p>
        <div className="quiz-row__meta">
          <span className="quiz-row__meta-item">{quizStat.attemptCount}회 풀이</span>
          <span className="quiz-row__meta-item">평균 {formatAvgSeconds(quizStat.avgElapsedSeconds)}</span>
          <span className="quiz-row__meta-item">최근 {formatDate(quizStat.lastAttemptedAt)}</span>
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

function AttemptHistoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStudyLogId, setSelectedStudyLogId] = useState(null)

  useEffect(() => {
    getAttemptHistory()
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const summaries = buildStudyLogSummaries(items)
  const selectedSummary = summaries.find(s => s.studyLogId === selectedStudyLogId)
  const quizStats = selectedStudyLogId ? buildQuizStats(items, selectedStudyLogId) : []

  if (loading) {
    return (
      <Layout>
        <div className="attempt-history__loading">불러오는 중...</div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="attempt-history__error">오류가 발생했습니다: {error}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="attempt-history">
        {selectedStudyLogId === null ? (
          <>
            <div className="attempt-history__header">
              <h2 className="attempt-history__title">풀이 기록</h2>
              <p className="attempt-history__subtitle">학습 기록을 클릭해 문제별 이력을 확인하세요</p>
            </div>

            {summaries.length === 0 ? (
              <div className="attempt-history__empty">
                <p>아직 풀이 기록이 없습니다.</p>
                <p>문제를 풀면 여기에 기록이 쌓입니다.</p>
              </div>
            ) : (
              <div className="history-cards">
                {summaries.map(s => (
                  <StudyLogCard
                    key={s.studyLogId}
                    summary={s}
                    onClick={() => setSelectedStudyLogId(s.studyLogId)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="attempt-detail__header">
              <button className="attempt-detail__back" onClick={() => setSelectedStudyLogId(null)}>
                ← 뒤로가기
              </button>
              <h2 className="attempt-detail__title">{selectedSummary?.studyLogTitle}</h2>
              <span className="attempt-detail__count">{quizStats.length}개 문제</span>
            </div>

            <div className="quiz-list">
              {quizStats.length === 0 ? (
                <div className="attempt-history__empty">이 기록의 풀이 이력이 없습니다.</div>
              ) : (
                quizStats.map(qs => (
                  <QuizRow key={qs.quizId} quizStat={qs} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default AttemptHistoryPage
