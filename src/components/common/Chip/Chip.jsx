import React from 'react'
import './Chip.scss'

export default function Chip({
  children,
  selected = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const classNames = [
    'chip',
    selected ? 'chip--selected' : 'chip--default',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classNames}
      type={type}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}