import React, { useEffect, useState } from 'react'
import {
  applyPendingPwaUpdate,
  consumePwaUpdatedFlag,
  hasPendingPwaUpdate,
  PWA_UPDATE_READY_EVENT,
} from '../../../pwa/registerPwaUpdate'
import './PwaUpdateNotice.scss'

const UPDATED_TOAST_DURATION_MS = 3200

export default function PwaUpdateNotice() {
  const [updateReady, setUpdateReady] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updated, setUpdated] = useState(false)

  useEffect(() => {
    if (consumePwaUpdatedFlag()) {
      setUpdated(true)
    }

    if (hasPendingPwaUpdate()) {
      setUpdateReady(true)
    }

    const handleUpdateReady = () => {
      setUpdateReady(true)
      setUpdating(false)
    }

    window.addEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady)
    return () => {
      window.removeEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady)
    }
  }, [])

  useEffect(() => {
    if (!updated) return undefined

    const timer = window.setTimeout(() => {
      setUpdated(false)
    }, UPDATED_TOAST_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [updated])

  const handleApplyUpdate = () => {
    setUpdating(true)

    if (!applyPendingPwaUpdate()) {
      setUpdating(false)
      setUpdateReady(false)
    }
  }

  if (!updateReady && !updated) return null

  return (
    <div className="pwa-update-notice" aria-live="polite" aria-atomic="true">
      {updateReady && (
        <section className="pwa-update-notice__banner" role="status">
          <p>새 버전이 있어요. 지금 업데이트할까요?</p>

          <div className="pwa-update-notice__actions">
            <button
              className="pwa-update-notice__later"
              type="button"
              onClick={() => setUpdateReady(false)}
              disabled={updating}
            >
              나중에
            </button>

            <button
              className="pwa-update-notice__update"
              type="button"
              onClick={handleApplyUpdate}
              disabled={updating}
            >
              {updating ? '업데이트 중...' : '업데이트'}
            </button>
          </div>
        </section>
      )}

      {updated && (
        <p className="pwa-update-notice__toast" role="status">
          최신 버전으로 업데이트되었어요.
        </p>
      )}
    </div>
  )
}
