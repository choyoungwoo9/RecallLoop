import { useEffect, useState } from 'react'
import { getQueueStatus } from '../../api/queue'
import './QueueProgressBar.css'

function QueueProgressBar() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await getQueueStatus()
        setStatus(data)
      } catch (error) {
        console.error('Queue 상태 로드 실패:', error)
      }
    }

    loadStatus()
    const interval = setInterval(loadStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  if (!status) {
    return <div className="queue-progress-bar">로딩 중...</div>
  }

  return (
    <div className="queue-progress-bar">
      <div className="progress-info">
        <span className="progress-label">이번 사이클</span>
        <span className="progress-text">
          {status.completedCount} / {status.totalCount} 완료
        </span>
      </div>
      <div className="progress-container">
        <div
          className="progress-fill"
          style={{ width: `${status.progressPercent}%` }}
        />
      </div>
      <div className="progress-percent">{status.progressPercent}%</div>
    </div>
  )
}

export default QueueProgressBar
