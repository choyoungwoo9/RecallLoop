import Button from './Button'
import Modal from './Modal'
import './ConfirmModal.css'

function ConfirmModal({
  isOpen,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} size="sm">
      <div className="confirm-modal">
        <h2 className="confirm-modal__title">{title}</h2>
        <p className="confirm-modal__message">{message}</p>
        <div className="confirm-modal__actions">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
