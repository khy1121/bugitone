import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { signup, checkNickname } from '../../api/userApi'
import DuplicateCheckButton from '../../components/common/DuplicateCheckButton/DuplicateCheckButton'
import useKeyboardAwareInput from '../../hooks/useKeyboardAwareInput'
import {
  NICKNAME_RULE_MESSAGE,
  isValidNickname,
} from '../../utils/nicknameValidation'
import './NicknamePage.scss'

export default function NicknamePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const pageRef = useRef(null)
  const { email, password } = location.state ?? {}

  const [nickname, setNickname] = useState('')
  const [nicknameStatus, setNicknameStatus] = useState('idle')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const touched = nickname.length > 0
  const isValid = isValidNickname(nickname)
  const isInvalidFormat = touched && !isValid
  const isChecking = nicknameStatus === 'checking'
  const isDuplicate = nicknameStatus === 'taken'
  const isAvailable = nicknameStatus === 'available'
  const canCheck = touched && isValid && !isChecking
  const canSubmit = isAvailable && !submitting
  const keyboard = useKeyboardAwareInput({
    scrollRef: pageRef,
    resetScrollOnFocus: true,
  })

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
      const result = await checkNickname(nickname)
      if (result?.available === false) {
        setNicknameStatus('taken')
        return
      }
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
      if (!profile?.userId) {
        throw new Error('회원가입 응답에 사용자 정보가 없습니다.')
      }
      localStorage.setItem('userId', String(profile.userId))
      localStorage.setItem('nickname', profile.nickname ?? '')
      localStorage.setItem('email', profile.email ?? email)
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setApiError(err?.message ?? '회원가입에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const guideText = apiError
    || (isInvalidFormat
      ? NICKNAME_RULE_MESSAGE
      : isDuplicate
      ? '사용할 수 없는 닉네임입니다.'
      : isAvailable
      ? '사용할 수 있는 닉네임입니다.'
      : isChecking
      ? '중복 확인 중입니다.'
      : NICKNAME_RULE_MESSAGE)

  return (
    <div
      ref={pageRef}
      className={`nickname-onboard${touched ? ' nickname-onboard--filled' : ''}${isDuplicate || isInvalidFormat ? ' nickname-onboard--error' : ''}${isAvailable ? ' nickname-onboard--available' : ''}${keyboard.isKeyboardFocused ? ' nickname-onboard--keyboard' : ''}`}
    >
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

        <div className={`nickname-onboard__input-wrap${isDuplicate || isInvalidFormat ? ' nickname-onboard__input-wrap--error' : ''}`}>
          <input
            className="nickname-onboard__input"
            type="text"
            placeholder="닉네임을 입력해주세요."
            value={nickname}
            onChange={handleNicknameChange}
            onFocus={keyboard.handleFocus}
            onBlur={keyboard.handleBlur}
            maxLength={10}
          />
          {touched && !isDuplicate && (
            <DuplicateCheckButton
              className="nickname-onboard__check"
              active={canCheck}
              checking={isChecking}
              disabled={!canCheck}
              onClick={handleCheckNickname}
            />
          )}
        </div>

        <p className={`nickname-onboard__guide${isDuplicate || isInvalidFormat || apiError ? ' nickname-onboard__guide--error' : ''}`}>
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
