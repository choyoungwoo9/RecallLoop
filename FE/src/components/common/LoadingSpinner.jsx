import './LoadingSpinner.css'

function LoadingSpinner({ size = 'md', text = '로딩 중...' }) {
  return (
    <div className={`spinner__container spinner__container--${size}`}>
      <div className={`spinner spinner--${size}`}></div>
      {text && <p className="spinner__text">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
