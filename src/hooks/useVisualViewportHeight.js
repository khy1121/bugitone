import { useEffect } from 'react'
import { computeAppScale } from '../utils/appScale'

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

      // 입력 중(키보드가 올라올 수 있는 상태)에만 이전 높이를 유지하고,
      // 그 외에는 실제 보이는 높이를 따라감. 예전처럼 '지금까지 본 가장 큰 높이'를 계속 유지하면
      // 카카오톡 인앱 브라우저·사파리에서 툴바가 나중에 나타나 화면이 줄어들 때
      // 앱이 줄지 않아 하단(시작하기 버튼, 하단 메뉴)이 툴바 아래로 가려짐.
      const activeElement = document.activeElement
      const isEditableFocused = Boolean(
        activeElement &&
          (activeElement.isContentEditable ||
            /^(INPUT|TEXTAREA|SELECT)$/.test(activeElement.tagName)),
      )

      if (!isEditableFocused) {
        stableViewportHeight = Math.round(window.innerHeight)
      } else if (visualHeight > stableViewportHeight) {
        stableViewportHeight = visualHeight
      }

      const keyboardHeight = isEditableFocused ? Math.max(0, stableViewportHeight - visualHeight) : 0
      const isKeyboardOpen = keyboardHeight > KEYBOARD_MIN_HEIGHT

      const root = document.documentElement
      const isDesktop = window.matchMedia(DESKTOP_MEDIA_QUERY).matches
      // 모바일: 화면 폭에 맞춰 앱 전체를 비례 확대·축소 (393px = 1, 0.92 ~ 1.2)
      const appScale = computeAppScale(window.innerWidth, isDesktop)
      const toDesign = (px) => px / appScale

      // 실제 px: 앱 바깥(body, #root)과 앱 프레임 크기 계산에 사용
      root.classList.toggle('keyboard-open', isKeyboardOpen)
      root.style.setProperty('--app-scale', appScale.toFixed(4))
      root.style.setProperty('--app-height', `${stableViewportHeight}px`)
      root.style.setProperty('--app-visual-height', `${visualHeight}px`)
      // 디자인 px: 앱 안의 화면(페이지 CSS)에서 사용 — 배율로 나눠 둠
      root.style.setProperty('--vh', `${toDesign(stableViewportHeight) * 0.01}px`)
      root.style.setProperty('--visual-vh', `${toDesign(visualHeight) * 0.01}px`)
      root.style.setProperty('--visual-height', `${toDesign(visualHeight)}px`)
      root.style.setProperty('--keyboard-height', `${toDesign(keyboardHeight)}px`)
      root.style.setProperty('--visual-offset-top', `${toDesign(visualOffsetTop)}px`)
      root.style.setProperty('--viewport-width', `${toDesign(visualWidth)}px`)
      root.style.setProperty('--app-vw', `${toDesign(window.innerWidth) * 0.01}px`)

      // 데스크탑에서 화면 높이가 프레임보다 낮으면 핸드폰 프레임 전체를 축소
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
