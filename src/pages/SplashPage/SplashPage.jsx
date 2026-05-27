import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import './SplashPage.scss'

const LOGO_TEXT = 'DOK'
const SUBTITLE_TEXT = '펼치는 순간, 나를 다독이다'

const renderTypingText = (text, startDelay = 0, stepDelay = 0.1) =>
  Array.from(text).map((char, index) => (
    <span
      key={`${char}-${index}`}
      className="splash__write-char"
      style={{ '--char-delay': `${startDelay + index * stepDelay}s` }}
      aria-hidden="true"
    >
      {char}
    </span>
  ))

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.body.classList.add('splash-page-active')

    return () => {
      document.body.classList.remove('splash-page-active')
    }
  }, [])

  return (
    <div className="splash">
      <div className="splash__inner">
        <div className="splash__logo-group">
          <h1 className="splash__title" aria-label={LOGO_TEXT}>
            <span className="splash__title-base" aria-hidden="true">
              {LOGO_TEXT}
            </span>
            <span className="splash__title-shine" aria-hidden="true">
              {LOGO_TEXT}
            </span>
          </h1>
          <p className="splash__subtitle" aria-label={SUBTITLE_TEXT}>
            {renderTypingText(SUBTITLE_TEXT, 2.05, 0.095)}
          </p>
        </div>
        <button className="splash__btn" onClick={() => navigate(ROUTES.LOGIN)}>
          시작하기
        </button>
      </div>
    </div>
  )
}
