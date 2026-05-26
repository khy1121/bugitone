import React from 'react'
import './MemoToolbar.scss'

export const MEMO_TOOL_ITEMS = [
  { key: 'heading1', label: '제목', icon: 'H1' },
  { key: 'heading2', label: '부제목', icon: 'H2' },
  { key: 'underline', label: '밑줄', icon: 'U' },
  { key: 'bulletList', label: '글머리', icon: 'list' },
  { key: 'blockquote', label: '인용', icon: 'quote' },
  { key: 'bold', label: '진하게', icon: '가' },
  { key: 'horizontalRule', label: '수평선', icon: 'line' },
]

function ToolIcon({ type }) {
  if (type === 'list') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 6h10M8 12h10M8 18h10" />
        <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
      </svg>
    )
  }

  if (type === 'quote') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 8c-2.4 1.2-3.6 3-3.6 5.4 0 1.9 1 3.2 2.7 3.2 1.4 0 2.4-1 2.4-2.4 0-1.3-.9-2.2-2.1-2.3.1-1.1.8-2.1 2-2.9L9 8Z" />
        <path d="M17 8c-2.4 1.2-3.6 3-3.6 5.4 0 1.9 1 3.2 2.7 3.2 1.4 0 2.4-1 2.4-2.4 0-1.3-.9-2.2-2.1-2.3.1-1.1.8-2.1 2-2.9L17 8Z" />
      </svg>
    )
  }

  if (type === 'line') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h16" />
      </svg>
    )
  }

  return <span className={`memo-toolbar__text-icon memo-toolbar__text-icon--${type}`}>{type}</span>
}

export default function MemoToolbar({
  items = MEMO_TOOL_ITEMS,
  activeItems = [],
  onAction,
  className = '',
  disabled = false,
}) {
  const activeSet = new Set(activeItems.filter(Boolean))
  const classNames = ['memo-toolbar', className].filter(Boolean).join(' ')

  return (
    <nav className={classNames} aria-label="메모 서식 도구">
      {items.map((item) => {
        const isActive = activeSet.has(item.key)

        return (
          <button
            key={item.key}
            className={`memo-toolbar__item${isActive ? ' memo-toolbar__item--active' : ''}`}
            type="button"
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault()
              onAction?.(item.key)
            }}
            aria-label={item.label}
            aria-pressed={isActive}
          >
            <span className="memo-toolbar__icon">
              <ToolIcon type={item.icon} />
            </span>
            <span className="memo-toolbar__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
