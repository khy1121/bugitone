// Utility to set CSS --vh custom property to reflect the real viewport height
// This helps avoid mobile browser chrome causing 100vh to be inconsistent.
function setVh() {
  let stableViewportHeight = window.innerHeight

  const set = () => {
    const visualViewportHeight = window.visualViewport?.height || window.innerHeight
    const visualViewportWidth = window.visualViewport?.width || window.innerWidth
    const isKeyboardOpen = visualViewportHeight < stableViewportHeight * 0.75

    if (!isKeyboardOpen) {
      stableViewportHeight = Math.max(stableViewportHeight, visualViewportHeight)
    }

    const vh = visualViewportHeight * 0.01
    const scaleHeight = isKeyboardOpen ? stableViewportHeight : visualViewportHeight
    const scale = Math.min(visualViewportWidth / 393, scaleHeight / 852, 1)
    const visualFrameHeight = scale > 0
      ? visualViewportHeight / scale
      : visualViewportHeight

    document.documentElement.classList.toggle('keyboard-open', isKeyboardOpen)
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    document.documentElement.style.setProperty('--visual-vh', `${visualViewportHeight}px`)
    document.documentElement.style.setProperty('--visual-frame-height', `${visualFrameHeight}px`)
    document.documentElement.style.setProperty('--app-scale', String(scale))
  }

  set()
  window.addEventListener('resize', set)
  window.addEventListener('orientationchange', set)
  window.visualViewport?.addEventListener('resize', set)
}

export default setVh
