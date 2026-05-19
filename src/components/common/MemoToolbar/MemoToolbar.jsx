import React from 'react'
import {
  PencilIcon,
  StarIcon,
  HandwritingIcon,
  HighlighterIcon,
  TrashIcon,
} from '../../../assets/icons'
import './MemoToolbar.scss'

const TOOL_ITEMS = [
  {
    key: 'write',
    label: '글쓰기',
    Icon: PencilIcon,
  },
  {
    key: 'favorite',
    label: '즐겨찾기',
    Icon: StarIcon,
  },
  {
    key: 'handwriting',
    label: '손글씨',
    Icon: HandwritingIcon,
  },
  {
    key: 'highlight',
    label: '형광펜',
    Icon: HighlighterIcon,
  },
  {
    key: 'trash',
    label: '휴지통',
    Icon: TrashIcon,
  },
]

export default function MemoToolbar({
  active = 'write',
  favorite = false,
  onSelect,
  className = '',
}) {
  const classNames = ['memo-toolbar', className].filter(Boolean).join(' ')

  return (
    <nav className={classNames} aria-label="메모 도구">
      {TOOL_ITEMS.map((item) => {
        const isActive = item.key === active
        const Icon = item.Icon

        const iconColor = isActive ? '#F8BC0A' : '#282723'
        const textColor = isActive ? '#F8BC0A' : '#282723'

        return (
          <button
            key={item.key}
            className={`memo-toolbar__item ${isActive ? 'memo-toolbar__item--active' : ''}`}
            type="button"
            onClick={() => onSelect?.(item.key)}
            aria-pressed={isActive}
          >
            <span className="memo-toolbar__icon" style={{ color: iconColor }}>
              {item.key === 'favorite' ? (
                <Icon size={24} color={iconColor} filled={favorite || isActive} />
              ) : (
                <Icon size={item.key === 'handwriting' ? 26 : 24} color={iconColor} />
              )}
            </span>

            <span className="memo-toolbar__label" style={{ color: textColor }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}