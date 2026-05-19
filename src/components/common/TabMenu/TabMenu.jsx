import React from 'react'
import './TabMenu.scss'

const DEFAULT_TABS = [
  { key: 'bookInfo', label: '책 정보' },
  { key: 'chat', label: '가독이 챗' },
  { key: 'memo', label: '메모' },
]

export default function TabMenu({
  tabs = DEFAULT_TABS,
  activeKey = 'bookInfo',
  onChange,
  className = '',
}) {
  const classNames = ['tab-menu', className].filter(Boolean).join(' ')

  return (
    <div className={classNames} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey

        return (
          <button
            key={tab.key}
            className={`tab-menu__item ${isActive ? 'tab-menu__item--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.key)}
          >
            <span className="tab-menu__label">{tab.label}</span>
            {isActive && <span className="tab-menu__indicator" />}
          </button>
        )
      })}
    </div>
  )
}