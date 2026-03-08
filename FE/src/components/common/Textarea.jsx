import './Textarea.css'

function Textarea({
  label,
  error,
  hint,
  size = 'md',
  disabled = false,
  rows = 4,
  className,
  ...props
}) {
  const classNames = [
    'textarea__wrapper',
    `textarea__wrapper--${size}`,
    error && 'textarea__wrapper--error',
    disabled && 'textarea__wrapper--disabled',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames}>
      {label && (
        <label className="textarea__label">
          {label}
          {props.required && <span className="textarea__required">*</span>}
        </label>
      )}
      <textarea
        className="textarea__field"
        disabled={disabled}
        rows={rows}
        {...props}
      />
      {error && <span className="textarea__error">{error}</span>}
      {hint && <span className="textarea__hint">{hint}</span>}
    </div>
  )
}

export default Textarea
