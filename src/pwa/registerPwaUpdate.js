import { registerSW } from 'virtual:pwa-register'

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000
const UPDATE_NOTIFICATION_TITLE = 'NADOK 업데이트'
const UPDATE_NOTIFICATION_OPTIONS = {
  body: '새 버전이 적용됩니다.',
  icon: '/icons/icon-192.png',
  badge: '/icons/icon-192.png',
  tag: 'nadok-app-update',
  renotify: true,
}

function notifyUpdateAvailable() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  navigator.serviceWorker
    ?.getRegistration()
    .then((registration) => {
      if (registration?.showNotification) {
        return registration.showNotification(
          UPDATE_NOTIFICATION_TITLE,
          UPDATE_NOTIFICATION_OPTIONS,
        )
      }

      return new Notification(UPDATE_NOTIFICATION_TITLE, UPDATE_NOTIFICATION_OPTIONS)
    })
    .catch(() => {})
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

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      notifyUpdateAvailable()
      updateSW(true)
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
