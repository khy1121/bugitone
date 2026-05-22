import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { signup, checkNickname } from '../../api/userApi'
import './NicknamePage.scss'

const nicknameRegex = /^[가-힣a-z0-9]{3,10}$/

export default function NicknamePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, password } = location.state ?? {}

  const [nickname, setNickname] = useState('')
  const [nicknameStatus, setNicknameStatus] = useState('idle')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const touched = nickname.length > 0
  const isValid = nicknameRegex.test(nickname)
  const isChecking = nicknameStatus === 'checking'
  const isDuplicate = nicknameStatus === 'taken'
  const isAvailable = nicknameStatus === 'available'
  const canCheck = touched && isValid && !isChecking
  const canSubmit = isAvailable && !submitting

  useEffect(() => {
    if (!email || !password) {
      navigate(ROUTES.SIGNUP, { replace: true })
    }
  }, [email, password, navigate])

  const handleNicknameChange = (e) => {
    setNickname(e.target.value)
    setNicknameStatus('idle')
    setApiError('')
  }

  const handleCheckNickname = async () => {
    if (!canCheck) return

    setNicknameStatus('checking')
    setApiError('')
    try {
      await checkNickname(nickname)
      setNicknameStatus('available')
    } catch {
      setNicknameStatus('taken')
    }
  }

  const handleSignup = async () => {
    if (!canSubmit) return

    setSubmitting(true)
    setApiError('')
    try {
      const profile = await signup({ email, password, nickname })
      localStorage.setItem('userId', String(profile.userId))
      localStorage.setItem('nickname', profile.nickname ?? '')
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setApiError(err?.message ?? '회원가입에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const guideText = apiError
    || (isDuplicate
      ? '사용할 수 없는 닉네임입니다.'
      : isAvailable
      ? '사용할 수 있는 닉네임입니다.'
      : isChecking
      ? '중복 확인 중입니다.'
      : '3~10 사이의 한글, 영어, 소문자, 숫자로만 입력해주세요.')

  return (
    <div className={`nickname-onboard${touched ? ' nickname-onboard--filled' : ''}${isDuplicate ? ' nickname-onboard--error' : ''}${isAvailable ? ' nickname-onboard--available' : ''}`}>
      <div className="nickname-onboard__inner">
        <header className="nickname-onboard__header">
          <button
            className="nickname-onboard__back"
            type="button"
            onClick={() => navigate(-1)}
          >
            ← 나가기
          </button>
          <h1 className="nickname-onboard__header-title">회원가입</h1>
        </header>

        <h2 className="nickname-onboard__title">
          <span>반가워요 👋</span>
          <span>당신을 어떻게 부르면 될까요?</span>
        </h2>

        <div className={`nickname-onboard__input-wrap${isDuplicate ? ' nickname-onboard__input-wrap--error' : ''}`}>
          <input
            className="nickname-onboard__input"
            type="text"
            placeholder="닉네임을 입력해주세요."
            value={nickname}
            onChange={handleNicknameChange}
            maxLength={10}
          />
          {touched && !isDuplicate && (
            <button
              className={`nickname-onboard__check${canCheck ? ' nickname-onboard__check--active' : ''}`}
              type="button"
              disabled={!canCheck}
              onClick={handleCheckNickname}
            >
              {isChecking ? '확인중' : '중복확인'}
            </button>
          )}
        </div>

        <p className={`nickname-onboard__guide${isDuplicate || apiError ? ' nickname-onboard__guide--error' : ''}`}>
          {guideText}
        </p>

        <button
          className={`nickname-onboard__btn${canSubmit ? ' nickname-onboard__btn--active' : ''}`}
          type="button"
          disabled={!canSubmit}
          onClick={handleSignup}
        >
          {submitting ? '가입 중...' : '가입하기'}
        </button>

        <p className="nickname-onboard__hint">닉네임을 적어주세요.</p>
      </div>
    </div>
  )
}
