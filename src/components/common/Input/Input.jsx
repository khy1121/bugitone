import React from 'react'
import './Input.scss'

export default function Input({
  type = 'text',
  value,
  defaultValue,
  placeholder = '일기를 입력해주세요.',
  disabled = false,
  error = false,
  className = '',
  ...rest
}) {
  const hasValue = value !== undefined
    ? String(value).length > 0
    : defaultValue !== undefined && String(defaultValue).length > 0

  const classNames = [
    'input',
    hasValue ? 'input--filled' : '',
    error ? 'input--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <input
      className={classNames}
      type={type}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      {...rest}
    />
  )
}