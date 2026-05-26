import React from 'react'
import './ChatLoadingDots.scss'

export default function ChatLoadingDots({
  className = '',
  label = '응답을 작성하는 중',
}) {
  const classNames = ['chat-loading-dots', className].filter(Boolean).join(' ')

  return (
    <span className={classNames} role="status" aria-label={label}>
      <span className="chat-loading-dots__dot" />
      <span className="chat-loading-dots__dot" />
      <span className="chat-loading-dots__dot" />
    </span>
  )
}
