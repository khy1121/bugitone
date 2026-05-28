import React from 'react'
import './PasswordVisibilityButton.scss'

export default function PasswordVisibilityButton({
  visible,
  className = '',
  ...rest
}) {
  const classNames = [
    'password-visibility-button',
    visible ? 'password-visibility-button--visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classNames}
      type="button"
      aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
      aria-pressed={visible}
      {...rest}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.5 12C4.2 8.7 7.4 6.5 12 6.5C16.6 6.5 19.8 8.7 21.5 12C19.8 15.3 16.6 17.5 12 17.5C7.4 17.5 4.2 15.3 2.5 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12"
          r="2.8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        {!visible && (
          <path
            d="M4.5 19.5L19.5 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  )
}
