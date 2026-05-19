// Utility to set CSS --vh custom property to reflect the real viewport height
// This helps avoid mobile browser chrome causing 100vh to be inconsistent.
function setVh() {
  const set = () => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight
    const viewportWidth = window.visualViewport?.width || window.innerWidth
    const vh = viewportHeight * 0.01
    const scale = Math.min(viewportWidth / 393, viewportHeight / 852, 1)

    document.documentElement.style.setProperty('--vh', `${vh}px`)
    document.documentElement.style.setProperty('--app-scale', String(scale))
  }

  set()
  window.addEventListener('resize', set)
  window.addEventListener('orientationchange', set)
  window.visualViewport?.addEventListener('resize', set)
}

export default setVh
