import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'
import useKeyboardAwareInput from '../../hooks/useKeyboardAwareInput'
import './SignupPage.scss'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignupPage() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [emailBlurred, setEmailBlurred] = useState(false)
  const [passwordBlurred, setPasswordBlurred] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmBlurred, setConfirmBlurred] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const emailValid = emailRegex.test(email)
  const passwordValid = password.length >= 6 && password.length <= 8
  const confirmMatch = confirm === password && confirm.length > 0

  const emailError = emailBlurred && !emailValid
  const passwordError = passwordBlurred && !passwordValid
  const confirmError = confirmBlurred && !confirmMatch

  const canSubmit = emailValid && passwordValid && confirmMatch && !loading
  const keyboard = useKeyboardAwareInput({
    scrollRef: pageRef,
    resetScrollOnFocus: true,
  })

  const msgText = emailError
    ? '이메일 형식이 올바르지 않습니다.'
    : passwordError
    ? '비밀번호 형식이 올바르지 않습니다.'
    : passwordTouched && !passwordBlurred
    ? '6~8자 이내로 입력해주세요.'
    : confirmError
    ? '비밀번호가 일치하지 않습니다.'
    : apiError || ''

  const msgIsError = emailError || passwordError || confirmError || !!apiError

  const handleNext = () => {
    if (!canSubmit) return
    setLoading(true)
    setApiError('')
    window.setTimeout(() => {
      navigate(ROUTES.NICKNAME, { state: { email, password } })
    }, 900)
  }

  return (
    <div
      ref={pageRef}
      className={`signup-onboard${keyboard.isKeyboardFocused ? ' signup-onboard--keyboard' : ''}`}
    >
      <div className="signup-onboard__inner">
        <h1 className="signup-onboard__logo">DOK</h1>

        <div className="signup-onboard__form">
          <Input
            className="signup-onboard__input"
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={keyboard.handleFocus}
            onBlur={(event) => {
              setEmailBlurred(true)
              keyboard.handleBlur(event)
            }}
            error={emailError}
            autoComplete="email"
          />
          <Input
            className="signup-onboard__input"
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true) }}
            onFocus={keyboard.handleFocus}
            onBlur={(event) => {
              setPasswordBlurred(true)
              keyboard.handleBlur(event)
            }}
            error={passwordError}
            autoComplete="new-password"
          />
          <Input
            className="signup-onboard__input"
            type="password"
            placeholder="비밀번호를 확인해주세요."
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onFocus={keyboard.handleFocus}
            onBlur={(event) => {
              setConfirmBlurred(true)
              keyboard.handleBlur(event)
            }}
            error={confirmError}
            autoComplete="new-password"
          />

          <div className="signup-onboard__msg-area">
            {msgText && (
              <p className={`signup-onboard__msg${msgIsError ? ' signup-onboard__msg--error' : ''}`}>
                {msgText}
              </p>
            )}
          </div>

          <Button
            className="signup-onboard__btn"
            variant="primary"
            fullWidth
            disabled={!canSubmit}
            onClick={handleNext}
          >
            회원가입
          </Button>

          <p className="signup-onboard__login">
            이미 계정이 있으신가요?{' '}
            <button
              className="signup-onboard__login-link"
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              로그인
            </button>
          </p>
        </div>

        {loading && (
          <div className="signup-onboard__loading" role="status" aria-label="회원가입 처리 중">
            <div className="signup-onboard__spinner" aria-hidden="true" />
            <img
              className="signup-onboard__loading-character"
              src="/assets/character/LoadChar.svg"
              alt=""
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  )
}
