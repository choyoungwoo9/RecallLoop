import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../api/dashboard'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import FloatingRobot from '../components/common/FloatingRobot'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './DashboardPage.css'

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0초'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainSeconds = seconds % 60

  if (hours > 0) return `${hours}시간 ${minutes}분`
  if (minutes > 0) return `${minutes}분 ${remainSeconds}초`
  return `${remainSeconds}초`
}

function formatCompactDuration(seconds) {
  if (!seconds || seconds <= 0) return '0분'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${Math.max(1, minutes)}m`
}

function StatCard({ label, value, accent }) {
  return (
    <Card className={`dashboard__stat-card dashboard__stat-card--${accent}`}>
      <span className="dashboard__stat-label">{label}</span>
      <strong className="dashboard__stat-value">{value}</strong>
    </Card>
  )
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const sceneRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch((err) => {
        console.error('대시보드 로드 실패:', err)
        setError('대시보드를 불러오지 못했습니다.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="dashboard__feedback dashboard__feedback--error">{error}</div>
      </Layout>
    )
  }

  const overview = dashboard?.overview ?? {}
  const currentCycle = dashboard?.currentCycle ?? {}
  const nextQuiz = dashboard?.nextQuiz
  const activity7d = dashboard?.activity7d ?? []
  const evaluation = dashboard?.evaluationBreakdown ?? {}
  const quality = dashboard?.qualityBreakdown ?? {}
  const topStudyLogs = dashboard?.topStudyLogs ?? []
  const difficulty = dashboard?.difficultyBreakdown ?? {}
  const maxActivity = Math.max(...activity7d.map((item) => item.solvedCount), 1)
  const hasAnyData = (overview.totalAttempts ?? 0) > 0 || (overview.studyLogCount ?? 0) > 0
  const remainingCount = Math.max(0, (currentCycle.totalCount ?? 0) - (currentCycle.completedCount ?? 0))

  return (
    <Layout>
      <div className="dashboard__robot-scene" ref={sceneRef} aria-hidden="true">
        <FloatingRobot
          variant="dashboard"
          boundsRef={sceneRef}
          avoidSelectors={['.layout__header', '.layout__main']}
          queryScope="document"
          sizeMultiplier={1.08}
          speedMultiplier={0.86}
          opacityOverride={1}
          className="dashboard__floating-robot dashboard__floating-robot--alpha"
        />
        <FloatingRobot
          variant="dashboard"
          boundsRef={sceneRef}
          avoidSelectors={['.layout__header', '.layout__main']}
          queryScope="document"
          sizeMultiplier={0.96}
          speedMultiplier={0.72}
          opacityOverride={1}
          className="dashboard__floating-robot dashboard__floating-robot--beta"
        />
        <FloatingRobot
          variant="dashboard"
          boundsRef={sceneRef}
          avoidSelectors={['.layout__header', '.layout__main']}
          queryScope="document"
          sizeMultiplier={1.14}
          speedMultiplier={0.94}
          opacityOverride={1}
          className="dashboard__floating-robot dashboard__floating-robot--gamma"
        />
      </div>

      <div className="dashboard">

        <section className="dashboard__hero">
          <div className="dashboard__hero-copy">
            <span className="dashboard__eyebrow">Recall Loop Dashboard</span>
            <h2 className="dashboard__title">학습 리듬을 한 화면에서 확인하세요</h2>
            <p className="dashboard__subtitle">
              반복 루프, 학습 시간, 오늘의 학습량, 문제 난이도 흐름까지 지금 상태를 바로 읽을 수 있게 정리했습니다.
            </p>
          </div>

          <div className="dashboard__hero-stats">
            <StatCard label="총 루프 횟수" value={`${overview.totalLoops ?? 0}회`} accent="loop" />
            <StatCard label="총 학습 시간" value={formatDuration(overview.totalStudySeconds ?? 0)} accent="time" />
            <StatCard label="오늘 푼 문제 수" value={`${overview.todaySolvedCount ?? 0}문제`} accent="today" />
            <StatCard label="오늘 학습 시간" value={formatDuration(overview.todayStudySeconds ?? 0)} accent="focus" />
          </div>
        </section>

        <section className="dashboard__quick-grid">
          <Card className="dashboard__summary-card">
            <span className="dashboard__summary-label">총 풀이 수</span>
            <strong className="dashboard__summary-value">{overview.totalAttempts ?? 0}</strong>
          </Card>
          <Card className="dashboard__summary-card">
            <span className="dashboard__summary-label">고유 문제 수</span>
            <strong className="dashboard__summary-value">{overview.uniqueSolvedQuizCount ?? 0}</strong>
          </Card>
          <Card className="dashboard__summary-card">
            <span className="dashboard__summary-label">활성 문제 수</span>
            <strong className="dashboard__summary-value">{overview.activeQuizCount ?? 0}</strong>
          </Card>
          <Card className="dashboard__summary-card">
            <span className="dashboard__summary-label">학습 기록 수</span>
            <strong className="dashboard__summary-value">{overview.studyLogCount ?? 0}</strong>
          </Card>
          <Card className="dashboard__summary-card">
            <span className="dashboard__summary-label">평균 풀이 시간</span>
            <strong className="dashboard__summary-value">{formatDuration(overview.avgSecondsPerAttempt ?? 0)}</strong>
          </Card>
          <Card className="dashboard__summary-card">
            <span className="dashboard__summary-label">연속 학습일</span>
            <strong className="dashboard__summary-value">{overview.currentStreakDays ?? 0}일</strong>
          </Card>
        </section>

        <section className="dashboard__main-grid">
          <Card className="dashboard__panel dashboard__panel--cycle">
            <div className="dashboard__panel-header">
              <div>
                <span className="dashboard__panel-kicker">Current Cycle</span>
                <h3 className="dashboard__panel-title">이번 사이클 진행</h3>
              </div>
              <span className="dashboard__panel-badge">{currentCycle.progressPercent ?? 0}%</span>
            </div>

            <div className="dashboard__cycle-progress">
              <div className="dashboard__cycle-ring">
                <svg viewBox="0 0 120 120" className="dashboard__cycle-svg">
                  <circle className="dashboard__cycle-bg" cx="60" cy="60" r="52" />
                  <circle
                    className="dashboard__cycle-fill"
                    cx="60"
                    cy="60"
                    r="52"
                    style={{ '--progress': currentCycle.progressPercent ?? 0 }}
                  />
                </svg>
                <div className="dashboard__cycle-ring-text">
                  <strong>{currentCycle.completedCount ?? 0}/{currentCycle.totalCount ?? 0}</strong>
                  <span>완료</span>
                </div>
              </div>

              <div className="dashboard__cycle-copy">
                <p className="dashboard__cycle-text">
                  현재 사이클은 {currentCycle.completedCount ?? 0}문제를 풀었고, 전체 {currentCycle.totalCount ?? 0}문제 중 {remainingCount}문제가 남아 있습니다.
                </p>
                {nextQuiz ? (
                  <div className="dashboard__next-quiz">
                    <span className="dashboard__next-quiz-label">다음 문제</span>
                    <p className="dashboard__next-quiz-question">{nextQuiz.question}</p>
                    <small className="dashboard__next-quiz-meta">
                      {nextQuiz.studyLogTitle} · Lv.{nextQuiz.difficulty}
                    </small>
                  </div>
                ) : (
                  <div className="dashboard__next-quiz dashboard__next-quiz--empty">
                    학습 기록과 문제를 만들면 다음 문제가 여기 표시됩니다.
                  </div>
                )}
                <div className="dashboard__actions dashboard__cycle-actions">
                  <Button variant="primary" size="lg" onClick={() => navigate('/queue/solve')}>
                    문제 풀기
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate('/study-logs')}>
                    학습 기록 보기
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="dashboard__panel dashboard__panel--activity">
            <div className="dashboard__panel-header">
              <div>
                <span className="dashboard__panel-kicker">Last 7 Days</span>
                <h3 className="dashboard__panel-title">최근 7일 활동</h3>
              </div>
            </div>
            <div className="dashboard__activity-chart">
              {activity7d.map((item) => (
                <div key={item.date} className="dashboard__activity-item">
                  <div className="dashboard__activity-bar-wrap">
                    <div
                      className="dashboard__activity-bar"
                      style={{ height: `${Math.max(12, (item.solvedCount / maxActivity) * 100)}%` }}
                    />
                  </div>
                  <strong className="dashboard__activity-value">{item.solvedCount}</strong>
                  <span className="dashboard__activity-date">{item.date.slice(5).replace('-', '.')}</span>
                  <span className="dashboard__activity-time">{formatCompactDuration(item.studySeconds)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="dashboard__panel">
            <div className="dashboard__panel-header">
              <div>
                <span className="dashboard__panel-kicker">Signals</span>
                <h3 className="dashboard__panel-title">난이도 평가 분포</h3>
              </div>
            </div>
            <div className="dashboard__metric-list">
              <div className="dashboard__metric-row">
                <span>어려워요</span>
                <strong>{evaluation.tooHard ?? 0}</strong>
              </div>
              <div className="dashboard__metric-row">
                <span>적당해요</span>
                <strong>{evaluation.ok ?? 0}</strong>
              </div>
              <div className="dashboard__metric-row">
                <span>쉬워요</span>
                <strong>{evaluation.tooEasy ?? 0}</strong>
              </div>
              <div className="dashboard__metric-row dashboard__metric-row--alert">
                <span>별로에요 누적</span>
                <strong>{quality.dislikedCount ?? 0}</strong>
              </div>
            </div>
          </Card>

          <Card className="dashboard__panel">
            <div className="dashboard__panel-header">
              <div>
                <span className="dashboard__panel-kicker">Queue Mix</span>
                <h3 className="dashboard__panel-title">현재 난이도 분포</h3>
              </div>
            </div>
            <div className="dashboard__difficulty-grid">
              <div className="dashboard__difficulty-card dashboard__difficulty-card--easy">
                <span>쉬움</span>
                <strong>{difficulty.easy ?? 0}</strong>
              </div>
              <div className="dashboard__difficulty-card dashboard__difficulty-card--medium">
                <span>보통</span>
                <strong>{difficulty.medium ?? 0}</strong>
              </div>
              <div className="dashboard__difficulty-card dashboard__difficulty-card--hard">
                <span>어려움</span>
                <strong>{difficulty.hard ?? 0}</strong>
              </div>
            </div>
          </Card>
        </section>

        <section className="dashboard__bottom-grid">
          <Card className="dashboard__panel dashboard__panel--toplogs">
            <div className="dashboard__panel-header">
              <div>
                <span className="dashboard__panel-kicker">Focus Areas</span>
                <h3 className="dashboard__panel-title">많이 푼 학습 기록</h3>
              </div>
            </div>

            {topStudyLogs.length === 0 ? (
              <div className="dashboard__empty-panel">
                아직 누적된 풀이가 없습니다. 학습 기록을 만들고 문제를 풀기 시작해보세요.
              </div>
            ) : (
              <div className="dashboard__toplogs">
                {topStudyLogs.map((item, index) => (
                  <button
                    key={item.studyLogId}
                    type="button"
                    className="dashboard__toplog"
                    onClick={() => navigate(`/study-logs/${item.studyLogId}`)}
                  >
                    <span className="dashboard__toplog-rank">#{index + 1}</span>
                    <div className="dashboard__toplog-body">
                      <strong className="dashboard__toplog-title">{item.title}</strong>
                      <span className="dashboard__toplog-meta">
                        {item.attemptCount}회 풀이 · {formatDuration(item.studySeconds)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="dashboard__panel dashboard__panel--cta">
            <div className="dashboard__panel-header">
              <div>
                <span className="dashboard__panel-kicker">Workspace</span>
                <h3 className="dashboard__panel-title">다음 액션</h3>
              </div>
            </div>

            <div className="dashboard__cta-stack">
              <p className="dashboard__cta-text">
                {hasAnyData
                  ? '기록을 정리하거나 새 문제를 생성해서 다음 루프를 준비하세요.'
                  : '먼저 학습 기록을 만들고 문제를 생성하면 이 대시보드가 자동으로 채워집니다.'}
              </p>
              <div className="dashboard__actions dashboard__actions--stack dashboard__cta-actions">
                <Button variant="primary" size="lg" onClick={() => navigate('/study-logs/new')}>
                  새 학습 기록 작성
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/study-logs')}>
                  기록 목록 열기
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  )
}

export default DashboardPage
