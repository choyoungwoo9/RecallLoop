import { useEffect, useRef } from 'react'
import robotImage from '../../assets/alphago-robot.png'
import './FloatingRobot.css'

const DASHBOARD_SIZE = {
  mobile: 46,
  tablet: 60,
  desktop: 72,
}

const DASHBOARD_OPACITY = {
  mobile: 0.18,
  tablet: 0.22,
  desktop: 0.28,
}

const CINEMATIC_PATHS = {
  cycle_complete: {
    duration: 1800,
    frames: [
      { x: -0.22, y: 0.62, scale: 1.02, rotate: -8, flip: false },
      { x: 0.2, y: 0.56, scale: 1.08, rotate: -4, flip: false },
      { x: 0.42, y: 0.46, scale: 1.16, rotate: 2, flip: false },
      { x: 1.08, y: 0.16, scale: 0.96, rotate: 8, flip: false },
    ],
  },
  analyzing: {
    duration: 2000,
    frames: [
      { x: 0.08, y: 0.72, scale: 0.98, rotate: -6, flip: false },
      { x: 0.15, y: 0.26, scale: 1.02, rotate: -2, flip: false },
      { x: 0.32, y: 0.14, scale: 1.06, rotate: 3, flip: false },
      { x: 0.38, y: 0.48, scale: 1.01, rotate: 5, flip: true },
    ],
  },
  regenerating: {
    duration: 2000,
    frames: [
      { x: -0.14, y: 0.58, scale: 1.02, rotate: -7, flip: false },
      { x: 0.54, y: 0.34, scale: 1.14, rotate: 6, flip: false },
      { x: 0.22, y: 0.5, scale: 1.08, rotate: -4, flip: true },
      { x: 0.84, y: 0.76, scale: 0.94, rotate: 8, flip: false },
    ],
  },
  finalizing: {
    duration: 1800,
    frames: [
      { x: 0.98, y: 0.18, scale: 0.96, rotate: 6, flip: true },
      { x: 0.64, y: 0.36, scale: 1.04, rotate: 2, flip: true },
      { x: 0.36, y: 0.62, scale: 1.02, rotate: -3, flip: true },
      { x: -0.18, y: 0.56, scale: 0.9, rotate: -7, flip: true },
    ],
  },
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function lerp(start, end, progress) {
  return start + (end - start) * progress
}

function interpolateFrame(frames, progress) {
  if (frames.length === 1) {
    return frames[0]
  }

  const scaledProgress = clamp(progress, 0, 1) * (frames.length - 1)
  const index = Math.min(Math.floor(scaledProgress), frames.length - 2)
  const nextIndex = index + 1
  const frameProgress = scaledProgress - index
  const current = frames[index]
  const next = frames[nextIndex]

  return {
    x: lerp(current.x, next.x, frameProgress),
    y: lerp(current.y, next.y, frameProgress),
    scale: lerp(current.scale, next.scale, frameProgress),
    rotate: lerp(current.rotate, next.rotate, frameProgress),
    flip: frameProgress < 0.5 ? current.flip : next.flip,
  }
}

function getDashboardRobotSpec() {
  if (typeof window === 'undefined') {
    return { size: DASHBOARD_SIZE.desktop, opacity: DASHBOARD_OPACITY.desktop, speedRange: [0.22, 0.38] }
  }

  if (window.innerWidth <= 640) {
    return { size: DASHBOARD_SIZE.mobile, opacity: DASHBOARD_OPACITY.mobile, speedRange: [0.12, 0.2] }
  }

  if (window.innerWidth <= 1024) {
    return { size: DASHBOARD_SIZE.tablet, opacity: DASHBOARD_OPACITY.tablet, speedRange: [0.18, 0.28] }
  }

  return { size: DASHBOARD_SIZE.desktop, opacity: DASHBOARD_OPACITY.desktop, speedRange: [0.22, 0.38] }
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function convertRectToLocal(rect, containerRect) {
  return {
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    right: rect.right - containerRect.left,
    bottom: rect.bottom - containerRect.top,
  }
}

function overlaps(rectA, rectB) {
  return !(
    rectA.right <= rectB.left ||
    rectA.left >= rectB.right ||
    rectA.bottom <= rectB.top ||
    rectA.top >= rectB.bottom
  )
}

function FloatingRobot({
  variant = 'dashboard',
  phase = 'cycle_complete',
  active = true,
  canClose = false,
  boundsRef,
  avoidSelectors = [],
  className = '',
}) {
  const robotRef = useRef(null)
  const animationFrameRef = useRef(0)
  const stateRef = useRef(null)
  const metricsRef = useRef({ width: 0, height: 0, size: 0, avoidRects: [] })
  const resizeObserverRef = useRef(null)
  const scrollDebounceRef = useRef(0)
  const reducedMotionRef = useRef(false)
  const avoidSelectorKey = avoidSelectors.join('|')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mediaQuery.matches

    const handleChange = (event) => {
      reducedMotionRef.current = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    if (!active || !robotRef.current) {
      return undefined
    }

    const element = robotRef.current
    const container = boundsRef?.current

    if (!container) {
      return undefined
    }

    const setTransform = ({ x, y, scale, rotate, flip }) => {
      const directionScale = flip ? -1 : 1
      element.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${directionScale}) rotate(${rotate}deg) scale(${scale})`
    }

    if (variant === 'cinematic') {
      const containerRect = container.getBoundingClientRect()
      const cinematicSize = Math.min(containerRect.width * 0.24, 280)
      const reducedScale = reducedMotionRef.current ? 0.74 : 1
      const path = CINEMATIC_PATHS[phase] ?? CINEMATIC_PATHS.cycle_complete
      const startTime = performance.now()

      element.style.width = `${cinematicSize}px`
      element.style.opacity = reducedMotionRef.current ? '0.72' : '0.88'

      const animate = (now) => {
        const elapsed = now - startTime
        const progress = clamp(elapsed / path.duration, 0, 1)
        const frame = interpolateFrame(path.frames, progress)
        const idleDrift = progress >= 1 && !canClose
          ? {
              x: Math.sin(elapsed / 280) * 10,
              y: Math.cos(elapsed / 360) * 6,
              rotate: Math.sin(elapsed / 260) * 2.2,
            }
          : { x: 0, y: 0, rotate: 0 }

        setTransform({
          x: frame.x * containerRect.width + idleDrift.x,
          y: frame.y * containerRect.height + idleDrift.y,
          scale: frame.scale * reducedScale,
          rotate: clamp(frame.rotate + idleDrift.rotate, -8, 8),
          flip: frame.flip,
        })

        animationFrameRef.current = window.requestAnimationFrame(animate)
      }

      animationFrameRef.current = window.requestAnimationFrame(animate)

      return () => {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }

    const refreshMetrics = () => {
      const rect = container.getBoundingClientRect()
      const { size, opacity } = getDashboardRobotSpec()
      const avoidRects = avoidSelectors
        .flatMap((selector) => Array.from(container.querySelectorAll(selector)))
        .map((node) => node.getBoundingClientRect())
        .filter((rectItem) => rectItem.width > 0 && rectItem.height > 0)
        .map((rectItem) => convertRectToLocal(rectItem, rect))

      metricsRef.current = {
        width: rect.width,
        height: rect.height,
        size,
        avoidRects,
      }

      element.style.width = `${size}px`
      element.style.opacity = `${opacity}`
    }

    const initializeDashboardState = () => {
      refreshMetrics()
      const { width, height, size } = metricsRef.current
      const { speedRange } = getDashboardRobotSpec()
      const speedX = randomBetween(...speedRange) * (Math.random() > 0.5 ? 1 : -1)
      const speedY = randomBetween(...speedRange) * (Math.random() > 0.5 ? 1 : -1)

      stateRef.current = {
        x: randomBetween(12, Math.max(12, width - size - 12)),
        y: randomBetween(12, Math.max(12, height - size - 12)),
        vx: speedX,
        vy: speedY,
        angleBias: randomBetween(-2.4, 2.4),
        lastTime: performance.now(),
        nextBiasAt: performance.now() + randomBetween(2500, 4000),
      }
    }

    initializeDashboardState()

    const handleResize = () => {
      refreshMetrics()
    }

    const handleScroll = () => {
      window.clearTimeout(scrollDebounceRef.current)
      scrollDebounceRef.current = window.setTimeout(() => {
        refreshMetrics()
      }, 1000)
    }

    resizeObserverRef.current = new ResizeObserver(() => {
      refreshMetrics()
    })
    resizeObserverRef.current.observe(container)

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    const animateDashboard = (now) => {
      const robotState = stateRef.current
      const { width, height, size, avoidRects } = metricsRef.current

      if (!robotState || width === 0 || height === 0) {
        animationFrameRef.current = window.requestAnimationFrame(animateDashboard)
        return
      }

      if (reducedMotionRef.current) {
        const x = Math.max(12, width - size - 18)
        const y = 18 + Math.sin(now / 900) * 8
        setTransform({
          x,
          y,
          scale: 0.84,
          rotate: Math.sin(now / 1300) * 2,
          flip: false,
        })
        animationFrameRef.current = window.requestAnimationFrame(animateDashboard)
        return
      }

      const delta = clamp(now - robotState.lastTime, 8, 40)
      robotState.lastTime = now

      if (now >= robotState.nextBiasAt) {
        robotState.vx += randomBetween(-0.06, 0.06)
        robotState.vy += randomBetween(-0.06, 0.06)
        robotState.angleBias = randomBetween(-3.2, 3.2)
        robotState.nextBiasAt = now + randomBetween(2500, 4000)
      }

      robotState.x += robotState.vx * delta
      robotState.y += robotState.vy * delta

      if (robotState.x <= 8 || robotState.x >= width - size - 8) {
        robotState.vx *= -1
        robotState.x = clamp(robotState.x, 8, Math.max(8, width - size - 8))
      }

      if (robotState.y <= 8 || robotState.y >= height - size - 8) {
        robotState.vy *= -1
        robotState.y = clamp(robotState.y, 8, Math.max(8, height - size - 8))
      }

      const robotRect = {
        left: robotState.x,
        top: robotState.y,
        right: robotState.x + size,
        bottom: robotState.y + size,
      }

      avoidRects.forEach((avoidRect) => {
        if (!overlaps(robotRect, avoidRect)) {
          return
        }

        const overlapX = Math.min(robotRect.right, avoidRect.right) - Math.max(robotRect.left, avoidRect.left)
        const overlapY = Math.min(robotRect.bottom, avoidRect.bottom) - Math.max(robotRect.top, avoidRect.top)
        const pushDistance = randomBetween(8, 20)

        if (overlapX < overlapY) {
          robotState.vx *= -1
          robotState.x += robotState.x < avoidRect.left ? -pushDistance : pushDistance
        } else {
          robotState.vy *= -1
          robotState.y += robotState.y < avoidRect.top ? -pushDistance : pushDistance
        }

        robotState.vx += randomBetween(-0.05, 0.05)
        robotState.vy += randomBetween(-0.05, 0.05)
      })

      const flip = robotState.vx < 0
      const rotate = clamp((robotState.vx + robotState.vy) * 8 + robotState.angleBias, -8, 8)

      setTransform({
        x: clamp(robotState.x, 8, Math.max(8, width - size - 8)),
        y: clamp(robotState.y, 8, Math.max(8, height - size - 8)),
        scale: 1,
        rotate,
        flip,
      })

      animationFrameRef.current = window.requestAnimationFrame(animateDashboard)
    }

    animationFrameRef.current = window.requestAnimationFrame(animateDashboard)

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current)
      window.clearTimeout(scrollDebounceRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      resizeObserverRef.current?.disconnect()
    }
  }, [active, avoidSelectorKey, boundsRef, canClose, phase, variant])

  return (
    <img
      ref={robotRef}
      src={robotImage}
      alt=""
      aria-hidden="true"
      className={`floating-robot floating-robot--${variant} ${className}`.trim()}
      draggable="false"
    />
  )
}

export default FloatingRobot
