import { useCallback, useEffect, useRef } from 'react'
import { getAppScale } from '../utils/appScale'

const DRAG_THRESHOLD_PX = 5

/**
 * 가로 스크롤 목록을 마우스로 끌어서 넘길 수 있게 합니다.
 * 터치는 브라우저 기본 스크롤을 그대로 쓰고, 마우스(pointerType === 'mouse')만 처리합니다.
 * 드래그 후 손을 뗄 때 카드 안 버튼이 눌리지 않도록 클릭을 한 번 막습니다.
 *
 * 사용: const dragRef = useDragScroll(); <div ref={dragRef} className="...">
 * 드래그 중에는 요소에 `is-dragging` 클래스가 붙습니다.
 */
export default function useDragScroll() {
  const cleanupRef = useRef(null)

  const attach = useCallback((element) => {
    cleanupRef.current?.()
    cleanupRef.current = null
    if (!element) return

    let pointerId = null
    let startX = 0
    let startScrollLeft = 0
    let dragging = false
    let suppressClick = false
    let savedSnapType = ''
    let scale = 1

    const endDrag = () => {
      if (pointerId === null) return
      if (dragging) {
        element.releasePointerCapture?.(pointerId)
        element.classList.remove('is-dragging')
        element.style.scrollSnapType = savedSnapType
        suppressClick = true
      }
      pointerId = null
      dragging = false
    }

    const handlePointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      pointerId = event.pointerId
      startX = event.clientX
      startScrollLeft = element.scrollLeft
      scale = getAppScale()
      dragging = false
      suppressClick = false
    }

    const handlePointerMove = (event) => {
      if (event.pointerId !== pointerId) return
      const deltaX = event.clientX - startX

      if (!dragging) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD_PX) return
        dragging = true
        // 버튼 클릭이 정상 동작하도록 실제로 끌기 시작한 뒤에만 포인터를 붙잡음
        element.setPointerCapture?.(pointerId)
        element.classList.add('is-dragging')
        // scroll-snap이 켜져 있으면 끄는 도중 위치가 튀므로 드래그하는 동안만 끔
        savedSnapType = element.style.scrollSnapType
        element.style.scrollSnapType = 'none'
      }

      event.preventDefault()
      // 마우스 이동(실제 px)을 앱 안 스크롤 위치(디자인 px)로 변환
      element.scrollLeft = startScrollLeft - deltaX / scale
    }

    const handleClickCapture = (event) => {
      if (!suppressClick) return
      suppressClick = false
      event.preventDefault()
      event.stopPropagation()
    }

    // 이미지 기본 드래그(고스트 이미지) 방지
    const handleDragStart = (event) => event.preventDefault()

    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', endDrag)
    element.addEventListener('pointercancel', endDrag)
    element.addEventListener('lostpointercapture', endDrag)
    element.addEventListener('click', handleClickCapture, true)
    element.addEventListener('dragstart', handleDragStart)

    cleanupRef.current = () => {
      element.removeEventListener('pointerdown', handlePointerDown)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerup', endDrag)
      element.removeEventListener('pointercancel', endDrag)
      element.removeEventListener('lostpointercapture', endDrag)
      element.removeEventListener('click', handleClickCapture, true)
      element.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  useEffect(() => () => cleanupRef.current?.(), [])

  return attach
}
