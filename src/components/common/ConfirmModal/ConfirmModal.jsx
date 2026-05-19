import React from 'react'
import Button from '../Button/Button'
import './ConfirmModal.scss'

export default function ConfirmModal({
  open = false,
  icon,
  title,
  description,
  highlightText,
  cancelText = '취소',
  confirmText = '확인',
  onCancel,
  onConfirm,
  confirmVariant = 'solid',
  cancelVariant = 'outline',
  singleButton = false,
  className = '',
}) {
  if (!open) return null

  const classNames = ['confirm-modal', className].filter(Boolean).join(' ')

  return (
    <div className="confirm-modal-backdrop" role="presentation">
      <section
        className={classNames}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'confirm-modal-title' : undefined}
      >
        {icon && <div className="confirm-modal__icon">{icon}</div>}

        {title && (
          <h2 id="confirm-modal-title" className="confirm-modal__title">
            {title}
          </h2>
        )}

        {description && (
          <p className="confirm-modal__description">
            {highlightText ? (
              <>
                {description.split(highlightText)[0]}
                <strong>{highlightText}</strong>
                {description.split(highlightText)[1]}
              </>
            ) : (
              description
            )}
          </p>
        )}

        <div
          className={`confirm-modal__actions ${
            singleButton ? 'confirm-modal__actions--single' : ''
          }`}
        >
          {!singleButton && (
            <Button
              variant={cancelVariant}
              size="lg"
              className="confirm-modal__button"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          )}

          <Button
            variant={confirmVariant}
            size="lg"
            className="confirm-modal__button"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </section>
    </div>
  )
}