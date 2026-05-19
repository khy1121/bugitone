import React from 'react'
import './Textarea.scss'

export default function Textarea({
  value,
  defaultValue,
  placeholder = '일기를 입력해주세요.',
  disabled = false,
  error = false,
  rows = 6,
  className = '',
  ...rest
}) {
  const hasValue = value !== undefined
    ? String(value).length > 0
    : defaultValue !== undefined && String(defaultValue).length > 0

  const classNames = [
    'textarea',
    hasValue ? 'textarea--filled' : '',
    error ? 'textarea--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <textarea
      className={classNames}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      {...rest}
    />
  )
}