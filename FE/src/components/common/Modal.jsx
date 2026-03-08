import { useEffect } from 'react'
import './Modal.css'
import Button from './Button'

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeButton = true,
  size = 'md',
  className
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  const classNames = [
    'modal',
    `modal--${size}`,
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div className={classNames} onClick={(e) => e.stopPropagation()}>
        {closeButton && (
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
          </div>
        )}

        <div className="modal__body">
          {children}
        </div>

        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
