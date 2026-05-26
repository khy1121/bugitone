import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import './SplashPage.scss'

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
          <h1 className="splash__title">DOK</h1>
          <p className="splash__subtitle">펼치는 순간, 나를 다독이다</p>
        </div>
        <button className="splash__btn" onClick={() => navigate(ROUTES.LOGIN)}>
          시작하기
        </button>
      </div>
    </div>
  )
}
