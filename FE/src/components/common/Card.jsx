import './Card.css'

function Card({
  children,
  className,
  hoverable = false,
  clickable = false,
  onClick,
  ...props
}) {
  const classNames = [
    'card',
    hoverable && 'card--hoverable',
    clickable && 'card--clickable',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
