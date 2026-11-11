// 모바일에서 앱 전체를 화면 폭에 맞춰 비례 확대·축소하는 배율 (393px 디자인 = 1)
// useVisualViewportHeight가 --app-scale로 설정하며, 데스크탑 핸드폰 프레임에서는 항상 1입니다.
export const DESIGN_WIDTH = 393
// 최소 배율: 가장 작은 글자(12px)가 약 11px 아래로 내려가지 않도록 함
export const MIN_APP_SCALE = 0.92
// 최대 배율: 태블릿 등 넓은 화면에서 지나치게 커지지 않도록 함
export const MAX_APP_SCALE = 1.2

export function computeAppScale(viewportWidth, isDesktop) {
  if (isDesktop || !viewportWidth) return 1
  return Math.min(MAX_APP_SCALE, Math.max(MIN_APP_SCALE, viewportWidth / DESIGN_WIDTH))
}

// 화면 좌표(getBoundingClientRect, visualViewport, 마우스 좌표)는 실제 px이고
// 앱 안의 스크롤 위치·CSS 값은 디자인 px이므로, 실제 px 차이를 디자인 px로 바꿀 때 나눔
export function getAppScale() {
  if (typeof window === 'undefined') return 1
  const value = parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue('--app-scale'),
  )
  return Number.isFinite(value) && value > 0 ? value : 1
}

export function toDesignPx(screenPx) {
  return screenPx / getAppScale()
}
