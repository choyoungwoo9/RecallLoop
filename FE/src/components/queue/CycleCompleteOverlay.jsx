import { useEffect, useRef, useState } from 'react'
import './CycleCompleteOverlay.css'

const PHASE_ORDER = ['cycle_complete', 'analyzing', 'regenerating', 'finalizing']

const PHASE_COPY = {
  cycle_complete: {
    kicker: 'Adaptive Loop Sequence',
    title: 'CYCLE COMPLETE',
    subtitle: '한 바퀴 완료',
    readouts: ['LOOP LOCKED', 'CONTROL ROOM ONLINE', 'NEXT LOOP ARMING'],
  },
  analyzing: {
    kicker: 'Response Matrix Scan',
    title: 'PATTERN ANALYSIS',
    subtitle: '이전 응답 패턴 분석 중',
    readouts: ['MEMORY TRACE', 'SIGNAL CLUSTERING', 'TEMPO SAMPLING'],
  },
  regenerating: {
    kicker: 'Quiz Regeneration',
    title: 'AI REMAPPING',
    subtitle: 'AI 문제 세트 재배치 중',
    readouts: ['DIFFICULTY SYNC', 'VARIANT WEAVING', 'QUEUE REASSEMBLY'],
  },
  finalizing: {
    kicker: 'Loop Stabilization',
    title: 'NEXT LOOP READY',
    subtitle: '다음 루프 기동 준비 완료',
    readouts: ['CALIBRATION LOCK', 'QUEUE STABLE', 'READY FOR RECALL'],
  },
}

function RobotSilhouette({ side }) {
  return (
    <svg
      className={`cycle-complete-overlay__robot-svg cycle-complete-overlay__robot-svg--${side}`}
      viewBox="0 0 320 420"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`robotGlow-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8bf5ff" />
          <stop offset="50%" stopColor="#67a8ff" />
          <stop offset="100%" stopColor="#59f1c7" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#robotGlow-${side})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M92 360l30-110 38-30 40 28 30 112" opacity="0.86" />
        <path d="M126 156l34-32 34 32v54l-34 28-34-28z" />
        <path d="M120 172h80" opacity="0.7" />
        <path d="M146 96h28l18 26h-64z" opacity="0.8" />
        <path d="M142 210v72" opacity="0.7" />
        <path d="M178 210v72" opacity="0.7" />
        <path d="M98 252h-44l-18 32 26 18 46-26" opacity="0.65" />
        <path d="M222 252h44l18 32-26 18-46-26" opacity="0.65" />
        <path d="M114 350l-36 38" opacity="0.55" />
        <path d="M206 350l36 38" opacity="0.55" />
        <circle cx="160" cy="172" r="12" fill={`url(#robotGlow-${side})`} stroke="none" />
        <path d="M146 68l14-24 14 24" opacity="0.65" />
      </g>
    </svg>
  )
}

function DataSlashes() {
  return (
    <div className="cycle-complete-overlay__slashes" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}

function CycleCompleteOverlay({ open, phase, message, canClose, onFinished }) {
  const [visualState, setVisualState] = useState('idle')
  const [minimumElapsed, setMinimumElapsed] = useState(false)
  const onFinishedRef = useRef(onFinished)
  const phaseCopy = PHASE_COPY[phase] ?? PHASE_COPY.cycle_complete

  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])

  useEffect(() => {
    if (!open) {
      setVisualState('idle')
      setMinimumElapsed(false)
      return undefined
    }

    setVisualState('enter')
    setMinimumElapsed(false)

    const enterTimer = window.setTimeout(() => {
      setVisualState('active')
    }, 400)

    const minimumTimer = window.setTimeout(() => {
      setMinimumElapsed(true)
    }, 6000)

    return () => {
      window.clearTimeout(enterTimer)
      window.clearTimeout(minimumTimer)
    }
  }, [open])

  useEffect(() => {
    if (!open || !canClose || !minimumElapsed || visualState === 'exit') {
      return undefined
    }

    setVisualState('exit')

    const finishTimer = window.setTimeout(() => {
      onFinishedRef.current?.()
    }, 500)

    return () => {
      window.clearTimeout(finishTimer)
    }
  }, [canClose, minimumElapsed, open, visualState])

  if (!open) {
    return null
  }

  return (
    <div
      className={`cycle-complete-overlay cycle-complete-overlay--${visualState} cycle-complete-overlay--scene-${phase} ${canClose ? 'cycle-complete-overlay--ready' : ''}`}
      role="presentation"
    >
      <div className="cycle-complete-overlay__backdrop" />
      <div className="cycle-complete-overlay__vignette" />
      <div className="cycle-complete-overlay__haze cycle-complete-overlay__haze--top" />
      <div className="cycle-complete-overlay__haze cycle-complete-overlay__haze--bottom" />
      <div className="cycle-complete-overlay__grid" />
      <div className="cycle-complete-overlay__scanlines" />
      <div className="cycle-complete-overlay__particles" />
      <div className="cycle-complete-overlay__streak cycle-complete-overlay__streak--left" />
      <div className="cycle-complete-overlay__streak cycle-complete-overlay__streak--right" />
      <div className="cycle-complete-overlay__beam cycle-complete-overlay__beam--left" />
      <div className="cycle-complete-overlay__beam cycle-complete-overlay__beam--right" />
      <DataSlashes />

      <div className="cycle-complete-overlay__robot cycle-complete-overlay__robot--left">
        <RobotSilhouette side="left" />
      </div>
      <div className="cycle-complete-overlay__robot cycle-complete-overlay__robot--right">
        <RobotSilhouette side="right" />
      </div>

      <div className="cycle-complete-overlay__center">
        <div className="cycle-complete-overlay__hud">
          <div className="cycle-complete-overlay__ring cycle-complete-overlay__ring--outer" />
          <div className="cycle-complete-overlay__ring cycle-complete-overlay__ring--middle" />
          <div className="cycle-complete-overlay__ring cycle-complete-overlay__ring--inner" />
          <div className="cycle-complete-overlay__core">
            <svg viewBox="0 0 160 160" className="cycle-complete-overlay__core-svg" aria-hidden="true">
              <defs>
                <linearGradient id="cycle-core-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe07d" />
                  <stop offset="35%" stopColor="#8bf5ff" />
                  <stop offset="100%" stopColor="#4e7cff" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="72" fill="rgba(8, 22, 46, 0.58)" stroke="rgba(139, 245, 255, 0.24)" />
              <circle cx="80" cy="80" r="52" fill="none" stroke="url(#cycle-core-gradient)" strokeWidth="6" opacity="0.8" />
              <path d="M54 86l20-20 16 16 24-24" fill="none" stroke="url(#cycle-core-gradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M48 112h64" stroke="rgba(139, 245, 255, 0.5)" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="cycle-complete-overlay__reticle cycle-complete-overlay__reticle--top" />
          <div className="cycle-complete-overlay__reticle cycle-complete-overlay__reticle--bottom" />
        </div>

        <div className="cycle-complete-overlay__copy">
          <span className="cycle-complete-overlay__kicker">{phaseCopy.kicker}</span>
          <h2 className="cycle-complete-overlay__title">{phaseCopy.title}</h2>
          <p className="cycle-complete-overlay__subtitle">{phaseCopy.subtitle}</p>
          <p className="cycle-complete-overlay__description">{message}</p>

          <div className="cycle-complete-overlay__timeline" aria-hidden="true">
            {PHASE_ORDER.map((step) => (
              <span
                key={step}
                className={`cycle-complete-overlay__timeline-step ${step === phase ? 'cycle-complete-overlay__timeline-step--active' : ''} ${PHASE_ORDER.indexOf(step) < PHASE_ORDER.indexOf(phase) ? 'cycle-complete-overlay__timeline-step--passed' : ''}`}
              />
            ))}
          </div>

          <div className="cycle-complete-overlay__readouts" aria-hidden="true">
            {phaseCopy.readouts.map((readout) => (
              <span key={readout}>{readout}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CycleCompleteOverlay
