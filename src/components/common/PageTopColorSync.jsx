import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

// 모바일 브라우저(사파리 등)는 화면 맨 위 상태바 영역을 페이지 바깥으로 보고
// <meta name="theme-color">와 html/body 배경색으로 칠합니다.
// 페이지마다 맨 위 색이 달라서, 현재 화면 맨 위 색에 맞춰 두 값을 바꿔 줍니다.

// 배경이 이미지라 색을 자동으로 읽을 수 없는 화면: 이미지 맨 위 영역의 평균 색
const IMAGE_PAGE_TOP_COLORS = {
  [ROUTES.MAIN]: '#ba9d5a', // onboardMain.webp
  [ROUTES.HOME]: '#fdfaf2', // library_main.webp
  [ROUTES.SEARCH]: '#fdfaf2',
  [ROUTES.CHARACTER]: '#fef4d9', // character/bg.webp
  [ROUTES.CHAT]: '#fef8e2', // chat_bg2.webp
}

const DEFAULT_TOP_COLOR = '#fefefe'
const MOBILE_MEDIA_QUERY = '(max-width: 767px)'

function isTransparent(color) {
  return !color || color === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(color)
}

// 화면 맨 위 가운데 요소부터 부모로 올라가며 처음 만나는 배경색
function detectTopColor() {
  let element = document.elementFromPoint(window.innerWidth / 2, 1)
  while (element && element !== document.documentElement) {
    const style = window.getComputedStyle(element)
    if (style.backgroundImage !== 'none') return null
    if (!isTransparent(style.backgroundColor)) return style.backgroundColor
    element = element.parentElement
  }
  return null
}

function applyTopColor(color) {
  document.documentElement.style.setProperty('--page-top-color', color)
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  if (meta.content !== color) meta.content = color
}

export default function PageTopColorSync() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) return undefined

    const imageColor = IMAGE_PAGE_TOP_COLORS[pathname]
    if (imageColor) {
      applyTopColor(imageColor)
      return undefined
    }

    // 화면이 바뀌는 동안(지연 로딩, 로딩 → 결과 화면 등) 다시 읽음
    let timer = 0
    const update = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => applyTopColor(detectTopColor() || DEFAULT_TOP_COLOR), 120)
    }
    update()
    const root = document.getElementById('root')
    const observer = new MutationObserver(update)
    if (root) observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname])

  return null
}
