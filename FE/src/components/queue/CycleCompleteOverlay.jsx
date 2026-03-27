import { useEffect, useRef, useState } from 'react'
import './CycleCompleteOverlay.css'

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

function CycleCompleteOverlay({ open, onFinished }) {
  const [phase, setPhase] = useState('idle')
  const onFinishedRef = useRef(onFinished)

  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])

  useEffect(() => {
    if (!open) {
      setPhase('idle')
      return undefined
    }

    setPhase('enter')

    const activeTimer = window.setTimeout(() => {
      setPhase('active')
    }, 400)

    const exitTimer = window.setTimeout(() => {
      setPhase('exit')
    }, 2500)

    const finishTimer = window.setTimeout(() => {
      onFinishedRef.current?.()
    }, 3000)

    return () => {
      window.clearTimeout(activeTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(finishTimer)
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div className={`cycle-complete-overlay cycle-complete-overlay--${phase}`} role="presentation">
      <div className="cycle-complete-overlay__backdrop" />
      <div className="cycle-complete-overlay__vignette" />
      <div className="cycle-complete-overlay__haze cycle-complete-overlay__haze--top" />
      <div className="cycle-complete-overlay__haze cycle-complete-overlay__haze--bottom" />
      <div className="cycle-complete-overlay__grid" />
      <div className="cycle-complete-overlay__scanlines" />

      <div className="cycle-complete-overlay__streak cycle-complete-overlay__streak--left" />
      <div className="cycle-complete-overlay__streak cycle-complete-overlay__streak--right" />
      <div className="cycle-complete-overlay__beam cycle-complete-overlay__beam--left" />
      <div className="cycle-complete-overlay__beam cycle-complete-overlay__beam--right" />
      <div className="cycle-complete-overlay__particles" />
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
          <span className="cycle-complete-overlay__kicker">Adaptive Loop Sequence</span>
          <h2 className="cycle-complete-overlay__title">CYCLE COMPLETE</h2>
          <p className="cycle-complete-overlay__subtitle">한 바퀴 완료</p>
          <p className="cycle-complete-overlay__description">
            AI 제어실이 응답 흐름을 스캔하고 다음 루프를 재배치합니다.
          </p>

          <div className="cycle-complete-overlay__readouts" aria-hidden="true">
            <span>NEURAL ROUTING</span>
            <span>DIFFICULTY SYNC</span>
            <span>NEXT LOOP ARMING</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CycleCompleteOverlay
