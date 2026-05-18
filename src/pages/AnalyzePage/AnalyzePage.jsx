import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import './AnalyzePage.scss'

const TODAY = '2026.05.11'

const QUESTIONS = [
  ['오늘 하루 있었던', '일기를 간단하게 적어주세요.'],
  ['현재 어떤 기분 상태와', '가장 가까우신가요?'],
  ['오늘은 어떤 위로를', '받고 싶으신가요?'],
]

const EMOTION_GROUPS = [
  ['신나는', '뿌듯한', '행복한', '차분한'],
  ['슬픈', '스트레스', '공허한'],
  ['피곤한', '우울', '화난'],
]

const COMFORT_OPTIONS = ['위로와 공감', '현실적 조언']
const DIARY_MIN_HEIGHT = 56
const DIARY_MAX_HEIGHT = 106

export default function AnalyzePage() {
  const navigate = useNavigate()
  const textareaRef = useRef(null)
  const [step, setStep] = useState(1)
  const [diary, setDiary] = useState('')
  const [emotions, setEmotions] = useState([])
  const [comfort, setComfort] = useState('')
  const [isDiaryFocused, setIsDiaryFocused] = useState(false)
  const [diaryHeight, setDiaryHeight] = useState(DIARY_MIN_HEIGHT)
  const [showConfirm, setShowConfirm] = useState(false)

  const canNext = useMemo(() => {
    if (step === 1) return diary.trim().length > 0
    if (step === 2) return emotions.length > 0
    return Boolean(comfort)
  }, [comfort, diary, emotions.length, step])

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (!diary) {
      setDiaryHeight(DIARY_MIN_HEIGHT)
      return
    }

    textarea.style.height = 'auto'
    const nextHeight = Math.min(
      DIARY_MAX_HEIGHT,
      Math.max(DIARY_MIN_HEIGHT, Math.ceil(textarea.scrollHeight)),
    )
    textarea.style.height = ''
    setDiaryHeight(nextHeight)
  }, [diary])

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
      state: { prompt: diary, emotions, comfort, loading: true },
    })
  }

  const handleDiaryChange = (event) => {
    setDiary(event.target.value)
  }

  const toggleEmotion = (emotion) => {
    setEmotions(current => {
      if (current.includes(emotion)) return current.filter(item => item !== emotion)
      if (current.length >= 3) return current
      return [...current, emotion]
    })
  }

  return (
    <div className="analyze">
      <button className="analyze__back" type="button" onClick={handleBack}>
        ← 나가기
      </button>

      <div className="analyze__progress" aria-label={`${step} / 3 단계`}>
        <span className={`analyze__progress-fill analyze__progress-fill--step-${step}`} />
      </div>

      <main className="analyze__body">
        <p className="analyze__date">{TODAY}</p>

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
                isDiaryFocused && 'analyze__diary--focused',
                diary && 'analyze__diary--filled',
              ].filter(Boolean).join(' ')}
              style={{ '--diary-height': `${diaryHeight}px` }}
            >
              <textarea
                ref={textareaRef}
                value={diary}
                rows={1}
                maxLength={300}
                onChange={handleDiaryChange}
                onFocus={() => setIsDiaryFocused(true)}
                onBlur={() => setIsDiaryFocused(false)}
                placeholder="일기를 입력해주세요."
              />
            </div>
            {(isDiaryFocused || diary) && <p className="analyze__counter">({diary.length}/300)</p>}
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

      <div className={`analyze__actions${step === 1 ? ' analyze__actions--single' : ''}`}>
        {step > 1 && (
          <button
            className="analyze__prev analyze__prev--active"
            type="button"
            onClick={handlePrevious}
          >
            이전
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

      {showConfirm && (
        <div className="analyze__overlay" role="dialog" aria-modal="true">
          <div className="analyze__dialog">
            <p>
              뒤로 나가시면 작성하신 내용은{'\n'}
              복원되지 않습니다.{'\n'}
              정말로 나가시겠습니까?
            </p>
            <div className="analyze__dialog-actions">
              <button type="button" onClick={() => navigate(ROUTES.CHARACTER)}>
                네, 나갈래요
              </button>
              <button type="button" onClick={() => setShowConfirm(false)}>
                아니요, 계속 쓸래요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
