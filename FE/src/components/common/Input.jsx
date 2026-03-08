import './Input.css'

function Input({
  label,
  error,
  hint,
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const classNames = [
    'input__wrapper',
    `input__wrapper--${size}`,
    error && 'input__wrapper--error',
    disabled && 'input__wrapper--disabled',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames}>
      {label && (
        <label className="input__label">
          {label}
          {props.required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        className="input__field"
        disabled={disabled}
        {...props}
      />
      {error && <span className="input__error">{error}</span>}
      {hint && <span className="input__hint">{hint}</span>}
    </div>
  )
}

export default Input
