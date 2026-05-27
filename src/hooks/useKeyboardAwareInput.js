import { useCallback, useEffect, useRef, useState } from 'react'

export const KEYBOARD_BLUR_DELAY = 420
export const KEYBOARD_INPUT_LOCK_CLASS = 'keyboard-input-lock'

const KEYBOARD_LOCK_RELEASE_POLL_MS = 16
let viewportLockCount = 0

const isKeyboardOpen = () => (
  typeof document !== 'undefined'
  && document.documentElement.classList.contains('keyboard-open')
)

const isMobileViewport = () => (
  typeof window !== 'undefined'
  && window.matchMedia?.('(max-width: 767px)').matches
)

const addViewportLock = (className) => {
  if (typeof document === 'undefined') return
  viewportLockCount += 1
  document.documentElement.classList.add(className)
}

const removeViewportLock = (className) => {
  if (typeof document === 'undefined') return
  viewportLockCount = Math.max(0, viewportLockCount - 1)

  if (viewportLockCount === 0) {
    document.documentElement.classList.remove(className)
  }
}

export default function useKeyboardAwareInput({
  scrollRef,
  targetRef,
  enabled = true,
  margin = 16,
  blurDelay = KEYBOARD_BLUR_DELAY,
  resetScrollOnBlur = false,
  resetScrollOnFocus = false,
  scrollOnFocus = false,
  lockViewport = true,
  lockClassName = KEYBOARD_INPUT_LOCK_CLASS,
  counterIOSScroll = true,
  onFocus,
  onBlur,
  onBlurSettled,
} = {}) {
  const blurTimerRef = useRef(null)
  const frameRef = useRef(null)
  const scrollResetTimersRef = useRef([])
  const focusedRef = useRef(false)
  const viewportLockedRef = useRef(false)
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false)

  // Default to focus-state + viewport lock only. Screens can opt into scroll correction.

  const clearBlurTimer = useCallback(() => {
    if (!blurTimerRef.current) return
    window.clearTimeout(blurTimerRef.current)
    blurTimerRef.current = null
  }, [])

  const cancelScheduledScroll = useCallback(() => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const clearScrollResetTimers = useCallback(() => {
    scrollResetTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    scrollResetTimersRef.current = []
  }, [])

  const resetScrollPosition = useCallback(() => {
    if (!resetScrollOnFocus || typeof window === 'undefined') return

    scrollRef?.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [resetScrollOnFocus, scrollRef])

  const scheduleScrollPositionReset = useCallback(() => {
    if (!resetScrollOnFocus || typeof window === 'undefined') return

    clearScrollResetTimers()
    window.requestAnimationFrame(resetScrollPosition)

    ;[60, 140, 280, 420].forEach((delay) => {
      const timer = window.setTimeout(resetScrollPosition, delay)
      scrollResetTimersRef.current.push(timer)
    })
  }, [clearScrollResetTimers, resetScrollOnFocus, resetScrollPosition])

  const lockVisualViewport = useCallback(() => {
    if (!enabled || !lockViewport || viewportLockedRef.current) return
    addViewportLock(lockClassName)
    viewportLockedRef.current = true
  }, [enabled, lockClassName, lockViewport])

  const releaseVisualViewport = useCallback(() => {
    if (!viewportLockedRef.current) return
    removeViewportLock(lockClassName)
    viewportLockedRef.current = false
  }, [lockClassName])

  const finishBlur = useCallback(() => {
    releaseVisualViewport()
    setIsKeyboardFocused(false)

    if (resetScrollOnBlur) {
      scrollRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }

    onBlurSettled?.()
  }, [onBlurSettled, releaseVisualViewport, resetScrollOnBlur, scrollRef])

  const scheduleBlurSettle = useCallback(() => {
    clearBlurTimer()

    if (!lockViewport) {
      blurTimerRef.current = window.setTimeout(() => {
        blurTimerRef.current = null
        finishBlur()
      }, blurDelay)
      return
    }

    const startedAt = Date.now()

    const trySettle = () => {
      blurTimerRef.current = null

      if (focusedRef.current) return

      const timedOut = Date.now() - startedAt >= blurDelay

      if (!isKeyboardOpen() || timedOut) {
        finishBlur()
        return
      }

      // Wait until visualViewport reports the keyboard as closed, then unlock
      // on the next frame so browser-bar and bottom UI settle together.
      blurTimerRef.current = window.setTimeout(trySettle, KEYBOARD_LOCK_RELEASE_POLL_MS)
    }

    blurTimerRef.current = window.setTimeout(trySettle, 0)
  }, [blurDelay, clearBlurTimer, finishBlur, lockViewport])

  const scrollTargetIntoView = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return

    const target = targetRef?.current
    if (!target) return

    const viewport = window.visualViewport
    const visualTop = viewport?.offsetTop ?? 0
    const visualHeight = viewport?.height ?? document.documentElement.clientHeight
    const visibleTop = visualTop + margin
    const visibleBottom = visualTop + visualHeight - margin
    const targetRect = target.getBoundingClientRect()
    const scrollContainer = scrollRef?.current

    if (scrollContainer) {
      if (targetRect.bottom > visibleBottom) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollTop + targetRect.bottom - visibleBottom,
          behavior: 'smooth',
        })
        return
      }

      if (targetRect.top < visibleTop) {
        scrollContainer.scrollTo({
          top: Math.max(0, scrollContainer.scrollTop - (visibleTop - targetRect.top)),
          behavior: 'smooth',
        })
      }

      return
    }

    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [enabled, margin, scrollRef, targetRef])

  const scheduleScrollTargetIntoView = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return

    cancelScheduledScroll()
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null
      scrollTargetIntoView()
    })
  }, [cancelScheduledScroll, enabled, scrollTargetIntoView])

  const handleFocus = useCallback((event) => {
    if (!enabled) {
      onFocus?.(event)
      return
    }

    focusedRef.current = true
    clearBlurTimer()
    lockVisualViewport()

    setIsKeyboardFocused(true)
    onFocus?.(event)

    if (lockViewport && counterIOSScroll && isMobileViewport()) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      })
    }

    if (resetScrollOnFocus) {
      scheduleScrollPositionReset()
    }

    if (scrollOnFocus) {
      scheduleScrollTargetIntoView()
    }
  }, [
    clearBlurTimer,
    counterIOSScroll,
    enabled,
    lockViewport,
    lockVisualViewport,
    onFocus,
    resetScrollOnFocus,
    resetScrollPosition,
    scheduleScrollPositionReset,
    scheduleScrollTargetIntoView,
    scrollOnFocus,
  ])

  const handleBlur = useCallback((event) => {
    onBlur?.(event)

    if (!enabled) return

    focusedRef.current = false
    clearScrollResetTimers()
    scheduleBlurSettle()
  }, [clearScrollResetTimers, enabled, onBlur, scheduleBlurSettle])

  useEffect(() => {
    if (!enabled || !isKeyboardFocused || (!scrollOnFocus && !resetScrollOnFocus)) {
      return undefined
    }

    const handleViewportChange = () => {
      if (scrollOnFocus) {
        scheduleScrollTargetIntoView()
      }

      if (resetScrollOnFocus) {
        scheduleScrollPositionReset()
      }
    }

    window.addEventListener('resize', handleViewportChange)
    window.visualViewport?.addEventListener('resize', handleViewportChange)
    window.visualViewport?.addEventListener('scroll', handleViewportChange)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.visualViewport?.removeEventListener('resize', handleViewportChange)
      window.visualViewport?.removeEventListener('scroll', handleViewportChange)
    }
  }, [
    enabled,
    isKeyboardFocused,
    resetScrollOnFocus,
    scheduleScrollPositionReset,
    scheduleScrollTargetIntoView,
    scrollOnFocus,
  ])

  useEffect(() => {
    return () => {
      clearBlurTimer()
      clearScrollResetTimers()
      cancelScheduledScroll()
      releaseVisualViewport()
    }
  }, [cancelScheduledScroll, clearBlurTimer, clearScrollResetTimers, releaseVisualViewport])

  return {
    isKeyboardFocused,
    handleFocus,
    handleBlur,
    releaseVisualViewport,
    scrollTargetIntoView,
    scheduleScrollTargetIntoView,
  }
}
