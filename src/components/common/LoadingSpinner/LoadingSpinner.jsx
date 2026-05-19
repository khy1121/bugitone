import React from 'react'
import './LoadingSpinner.scss'

export default function LoadingSpinner({
  size = 80,
  label = '로딩 중',
  className = '',
}) {
  const classNames = ['loading-spinner', className].filter(Boolean).join(' ')

  return (
    <div
      className={classNames}
      role="status"
      aria-label={label}
      style={{ '--loading-size': `${size}px` }}
    >
      <span className="loading-spinner__ring" />
    </div>
  )
}