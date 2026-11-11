import { useEffect } from 'react'

const KEYBOARD_MIN_HEIGHT = 120
// 데스크탑 핸드폰 프레임 전체 높이(_reset.scss의 $device-height)와 위아래 여백
const DEVICE_FRAME_HEIGHT = 880
const DEVICE_STAGE_PADDING = 48
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

export default function useVisualViewportHeight() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let stableViewportHeight = window.innerHeight
    let frameId = 0
    const settleTimers = []

    const applyViewportVars = () => {
      frameId = 0

      const viewport = window.visualViewport
      const visualHeight = Math.round(viewport?.height ?? window.innerHeight)
      const visualWidth = Math.round(viewport?.width ?? window.innerWidth)
      const visualOffsetTop = Math.max(0, Math.round(viewport?.offsetTop ?? 0))

      if (visualHeight > stableViewportHeight) {
        stableViewportHeight = visualHeight
      }

      const keyboardHeight = Math.max(0, stableViewportHeight - visualHeight)
      const isKeyboardOpen = keyboardHeight > KEYBOARD_MIN_HEIGHT

      if (!isKeyboardOpen) {
        stableViewportHeight = Math.max(stableViewportHeight, visualHeight, window.innerHeight)
      }

      const root = document.documentElement

      // iOS 100vh is unstable with the keyboard; keep app sizing tied to visualViewport.
      root.classList.toggle('keyboard-open', isKeyboardOpen)
      root.style.setProperty('--vh', `${stableViewportHeight * 0.01}px`)
      root.style.setProperty('--visual-vh', `${visualHeight * 0.01}px`)
      root.style.setProperty('--app-height', `${stableViewportHeight}px`)
      root.style.setProperty('--visual-height', `${visualHeight}px`)
      root.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
      root.style.setProperty('--visual-offset-top', `${visualOffsetTop}px`)
      root.style.setProperty('--viewport-width', `${visualWidth}px`)
      root.style.setProperty('--app-scale', '1')

      // 데스크탑에서 화면 높이가 프레임보다 낮으면 핸드폰 프레임 전체를 축소
      const isDesktop = window.matchMedia(DESKTOP_MEDIA_QUERY).matches
      const deviceScale = isDesktop
        ? Math.max(0.5, Math.min(1, (window.innerHeight - DEVICE_STAGE_PADDING) / DEVICE_FRAME_HEIGHT))
        : 1
      root.style.setProperty('--device-scale', deviceScale.toFixed(4))
    }

    const scheduleApply = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(applyViewportVars)
    }

    const scheduleKeyboardSettleApply = () => {
      scheduleApply()

      ;[60, 140, 280, 420].forEach((delay) => {
        const timer = window.setTimeout(scheduleApply, delay)
        settleTimers.push(timer)
      })
    }

    applyViewportVars()
    window.addEventListener('resize', scheduleApply)
    window.addEventListener('orientationchange', scheduleApply)
    window.visualViewport?.addEventListener('resize', scheduleApply)
    window.visualViewport?.addEventListener('scroll', scheduleApply)
    document.addEventListener('focusin', scheduleKeyboardSettleApply, true)
    document.addEventListener('focusout', scheduleKeyboardSettleApply, true)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      settleTimers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('resize', scheduleApply)
      window.removeEventListener('orientationchange', scheduleApply)
      window.visualViewport?.removeEventListener('resize', scheduleApply)
      window.visualViewport?.removeEventListener('scroll', scheduleApply)
      document.removeEventListener('focusin', scheduleKeyboardSettleApply, true)
      document.removeEventListener('focusout', scheduleKeyboardSettleApply, true)
    }
  }, [])
}
