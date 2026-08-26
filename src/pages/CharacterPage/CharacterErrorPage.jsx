import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import './CharacterErrorPage.scss'

const DEFAULT_MESSAGE = '네트워크 환경 문제로 다음 화면으로 이동할 수 없어요.'

export default function CharacterErrorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const message = location.state?.message || DEFAULT_MESSAGE
  const retryTo = location.state?.retryTo || ROUTES.CHARACTER

  return (
    <div className="character-error">
      <button type="button" onClick={() => navigate(ROUTES.CHARACTER)}>
        뒤로
      </button>
      <div className="character-error__content">
        <h1>오류</h1>
        <p>{message}</p>
        <button
          type="button"
          className="character-error__retry"
          onClick={() => navigate(retryTo, { replace: true })}
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
