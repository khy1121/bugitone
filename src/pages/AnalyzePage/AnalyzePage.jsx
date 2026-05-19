import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import './AnalyzePage.scss'

const QUESTIONS = [
  ['오늘 하루 있었던', '일기를 간단하게 적어주세요.'],
  ['현재 어떤 기분 상태와', '가장 가까우신가요?'],
  ['오늘은 어떤 위로를', '받고 싶으신가요?'],
]

const EMOTION_GROUPS = [
  ['신나는', '뿌듯한', '행복한', '차분한'],
  ['슬픈', '스트레스', '공허한'],
  ['피곤한', '우울', '분노'],
]

const COMFORT_OPTIONS = ['위로와 공감', '현실적 조언']

const DIARY_EMPTY_HEIGHT = 56
const DIARY_FOCUSED_MIN_HEIGHT = 56
const DIARY_FILLED_MIN_HEIGHT = 108
const DIARY_MAX_HEIGHT = 316

const formatToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const date = String(today.getDate()).padStart(2, '0')
  return `${year}.${month}.${date}`
}

export default function AnalyzePage() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const textareaRef = useRef(null)
  const actionsRef = useRef(null)
  const keyboardScrollTimersRef = useRef([])

  const today = useMemo(() => formatToday(), [])

  const [step, setStep] = useState(1)
  const [diary, setDiary] = useState('')
  const [emotions, setEmotions] = useState([])
  const [comfort, setComfort] = useState('')
  const [isDiaryFocused, setIsDiaryFocused] = useState(false)
  const [diaryHeight, setDiaryHeight] = useState(DIARY_EMPTY_HEIGHT)
  const [showConfirm, setShowConfirm] = useState(false)

  const canNext = useMemo(() => {
    if (step === 1) return diary.trim().length > 0
    if (step === 2) return emotions.length > 0
    return Boolean(comfort)
  }, [comfort, diary, emotions.length, step])

  const diaryCounterText = diary.length >= 300
    ? `(${diary.length} / 300)`
    : `(${diary.length}/300)`

  const clearKeyboardScrollTimers = () => {
    keyboardScrollTimersRef.current.forEach(timer => window.clearTimeout(timer))
    keyboardScrollTimersRef.current = []
  }

  const getScrollFrame = () => pageRef.current?.closest('.app-frame')

  const alignActionsAboveKeyboard = () => {
    const frame = getScrollFrame()
    const actions = actionsRef.current

    if (!frame || !actions) return

    const actionBottom = actions.offsetTop + actions.offsetHeight
    const targetTop = Math.max(0, actionBottom - frame.clientHeight + 24)

    frame.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    })
  }

  const scheduleKeyboardScroll = () => {
    clearKeyboardScrollTimers()

    keyboardScrollTimersRef.current = [80, 180, 320, 520].map(delay =>
      window.setTimeout(alignActionsAboveKeyboard, delay),
    )
  }

  const resetKeyboardScroll = () => {
    clearKeyboardScrollTimers()

    const timer = window.setTimeout(() => {
      getScrollFrame()?.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }, 220)

    keyboardScrollTimersRef.current = [timer]
  }

  useEffect(() => () => clearKeyboardScrollTimers(), [])

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (!diary) {
      setDiaryHeight(DIARY_EMPTY_HEIGHT)
      return
    }

    textarea.style.height = 'auto'

    const minHeight = isDiaryFocused
      ? DIARY_FOCUSED_MIN_HEIGHT
      : DIARY_FILLED_MIN_HEIGHT

    const nextHeight = Math.min(
      DIARY_MAX_HEIGHT,
      Math.max(minHeight, Math.ceil(textarea.scrollHeight)),
    )

    textarea.style.height = ''
    setDiaryHeight(nextHeight)
  }, [diary, isDiaryFocused])

  const handleBack = () => {
    setShowConfirm(true)
  }

  const handlePrevious = () => {
    if (step === 1) return
    setStep(current => current - 1)
  }

  const handleNext = () => {
    if (!canNext) return

    if (step < 3) {
      setStep(current => current + 1)
      return
    }

    navigate(ROUTES.RESULT, {
      state: {
        prompt: diary,
        emotions,
        comfort,
        loading: true,
      },
    })
  }

  const handleDiaryChange = (event) => {
    setDiary(event.target.value)
  }

  const handleDiaryFocus = () => {
    setIsDiaryFocused(true)
    scheduleKeyboardScroll()
  }

  const handleDiaryBlur = () => {
    setIsDiaryFocused(false)
    resetKeyboardScroll()
  }

  const toggleEmotion = (emotion) => {
    setEmotions(current => {
      if (current.includes(emotion)) {
        return current.filter(item => item !== emotion)
      }

      if (current.length >= 3) return current

      return [...current, emotion]
    })
  }

  return (
    <div ref={pageRef} className="analyze">
      <button
        className="analyze__back"
        type="button"
        onClick={handleBack}
      >
        ← 나가기
      </button>

      <div className="analyze__progress" aria-label={`${step} / 3 단계`}>
        <span className={`analyze__progress-fill analyze__progress-fill--step-${step}`} />
      </div>

      <main className="analyze__body">
        <p className="analyze__date">{today}</p>

        <h1 className="analyze__question">
          {QUESTIONS[step - 1].map(line => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        {step === 1 && (
          <>
            <p className="analyze__hint">최대 300자까지 적을 수 있어요.</p>

            <div
              className={[
                'analyze__diary',
                diary && 'analyze__diary--filled',
                isDiaryFocused && 'analyze__diary--focused',
              ].filter(Boolean).join(' ')}
              style={{ '--diary-height': `${diaryHeight}px` }}
            >
              <textarea
                ref={textareaRef}
                value={diary}
                rows={1}
                maxLength={300}
                onChange={handleDiaryChange}
                onFocus={handleDiaryFocus}
                onBlur={handleDiaryBlur}
                placeholder="일기를 입력해주세요."
              />
            </div>

            {(isDiaryFocused || diary) && (
              <p className="analyze__counter">{diaryCounterText}</p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p className="analyze__hint">최대 3가지 선택할 수 있어요.</p>

            <div className="analyze__emotions">
              {EMOTION_GROUPS.map(group => (
                <div key={group.join('-')} className="analyze__emotion-row">
                  {group.map(emotion => {
                    const active = emotions.includes(emotion)

                    return (
                      <button
                        key={emotion}
                        type="button"
                        className={`analyze__chip${active ? ' analyze__chip--active' : ''}`}
                        disabled={!active && emotions.length >= 3}
                        onClick={() => toggleEmotion(emotion)}
                      >
                        {emotion}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="analyze__comforts">
            {COMFORT_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                className={`analyze__comfort${comfort === option ? ' analyze__comfort--active' : ''}`}
                onClick={() => setComfort(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </main>

      <div
        ref={actionsRef}
        className={[
          'analyze__actions',
          step === 1 && 'analyze__actions--single',
          step === 1 && isDiaryFocused && 'analyze__actions--keyboard',
        ].filter(Boolean).join(' ')}
      >
        {step > 1 && (
          <button
            className="analyze__prev"
            type="button"
            onClick={handlePrevious}
          >
            이전 단계로
          </button>
        )}

        <button
          className={`analyze__next${canNext ? ' analyze__next--active' : ''}`}
          type="button"
          disabled={!canNext}
          onClick={handleNext}
        >
          다음 단계로
        </button>
      </div>

      {step === 1 && !diary.trim() && !isDiaryFocused && (
        <p className="analyze__empty-guide">일기를 적어주세요.</p>
      )}

      {showConfirm && (
        <div className="analyze__overlay" role="dialog" aria-modal="true">
          <div className="analyze__dialog">
            <p>
              뒤로 나가시면 작성하신 내용은{'\n'}
              복원되지 않습니다.{'\n'}
              정말로 나가시겠습니까?
            </p>

            <div className="analyze__dialog-actions">
              <button
                type="button"
                onClick={() => navigate(ROUTES.CHARACTER)}
              >
                네, 나갈래요
              </button>

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
              >
                아니요, 계속 쓸래요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
