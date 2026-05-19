// Mobile viewport utility
// --vh: keyboard가 닫힌 안정적인 앱 높이
// --visual-vh: 현재 보이는 viewport 높이
// --keyboard-height: 키보드가 차지하는 높이
function setVh() {
  let stableViewportHeight = window.innerHeight

  const set = () => {
    const visualViewport = window.visualViewport
    const visualHeight = visualViewport?.height || window.innerHeight
    const visualWidth = visualViewport?.width || window.innerWidth

    const isKeyboardOpen = visualHeight < stableViewportHeight * 0.78

    if (!isKeyboardOpen) {
      stableViewportHeight = Math.max(stableViewportHeight, visualHeight, window.innerHeight)
    }

    const keyboardHeight = Math.max(0, stableViewportHeight - visualHeight)

    document.documentElement.classList.toggle('keyboard-open', isKeyboardOpen)
    document.documentElement.style.setProperty('--vh', `${stableViewportHeight * 0.01}px`)
    document.documentElement.style.setProperty('--visual-vh', `${visualHeight * 0.01}px`)
    document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
    document.documentElement.style.setProperty('--viewport-width', `${visualWidth}px`)
    document.documentElement.style.setProperty('--app-scale', '1')
  }

  set()
  window.addEventListener('resize', set)
  window.addEventListener('orientationchange', set)
  window.visualViewport?.addEventListener('resize', set)
  window.visualViewport?.addEventListener('scroll', set)
}

export default setVh
