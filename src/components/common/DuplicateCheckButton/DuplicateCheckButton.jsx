import React from 'react'
import './DuplicateCheckButton.scss'

export default function DuplicateCheckButton({
  active = false,
  checking = false,
  children,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) {
  const isActive = active && !disabled
  const classNames = [
    'duplicate-check-button',
    isActive ? 'duplicate-check-button--active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classNames}
      type={type}
      disabled={disabled}
      aria-busy={checking || undefined}
      {...rest}
    >
      {children ?? (checking ? '확인중' : '중복확인')}
    </button>
  )
}
