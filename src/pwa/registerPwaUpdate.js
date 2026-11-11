import { registerSW } from 'virtual:pwa-register'

export const PWA_UPDATE_READY_EVENT = 'nadok:pwa-update-ready'
export const PWA_UPDATED_FLAG = 'nadok:pwa-updated'

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

let pendingUpdateSW = null

export function hasPendingPwaUpdate() {
  return typeof pendingUpdateSW === 'function'
}

export function applyPendingPwaUpdate() {
  if (!hasPendingPwaUpdate()) return false

  window.sessionStorage.setItem(PWA_UPDATED_FLAG, 'true')
  pendingUpdateSW(true)
  return true
}

export function consumePwaUpdatedFlag() {
  if (window.sessionStorage.getItem(PWA_UPDATED_FLAG) !== 'true') {
    return false
  }

  window.sessionStorage.removeItem(PWA_UPDATED_FLAG)
  return true
}

function announceUpdateReady(updateSW) {
  pendingUpdateSW = updateSW
  window.dispatchEvent(new CustomEvent(PWA_UPDATE_READY_EVENT))
}

function checkForServiceWorkerUpdate() {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker
    .getRegistration()
    .then((registration) => registration?.update())
    .catch(() => {})
}

export default function registerPwaUpdate() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  let updateSW = () => {}

  updateSW = registerSW({
    // 페이지 load 이후 등록: 첫 방문 때 서비스워커가 전체 파일(약 2.3MB)을 미리 받는 작업이
    // 지금 보고 있는 화면의 JS·이미지 다운로드와 경쟁하지 않게 함
    immediate: false,
    onNeedRefresh() {
      announceUpdateReady(updateSW)
    },
    onRegisteredSW(_, registration) {
      if (!registration) return

      window.setInterval(() => {
        registration.update()
      }, UPDATE_CHECK_INTERVAL_MS)
    },
    onRegisterError(error) {
      console.warn('PWA registration failed:', error)
    },
  })

  window.addEventListener('focus', checkForServiceWorkerUpdate)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForServiceWorkerUpdate()
    }
  })
}
