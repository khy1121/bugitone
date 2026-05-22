import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import './SignupPage.scss'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)

  const emailTouched = email.length > 0
  const emailValid = emailRegex.test(email)
  const emailError = emailTouched && !emailValid

  const passwordTouched = password.length > 0
  const passwordValid = password.length >= 6 && password.length <= 8
  const passwordError = passwordTouched && !passwordValid && !passwordFocused

  const confirmTouched = confirm.length > 0
  const confirmMatch = confirm === password
  const confirmError = confirmTouched && !confirmMatch
  const confirmValid = confirmTouched && confirmMatch

  const canSubmit = emailValid && passwordValid && confirmValid
  const helperText = passwordError
    ? '비밀번호 형식이 올바르지 않습니다.'
    : confirmError
    ? '비밀번호가 일치하지 않습니다.'
    : passwordFocused && passwordTouched
    ? '6~8자 이내로 입력해주세요.'
    : ''
  const helperIsError = passwordError || confirmError

  const handleNext = () => {
    if (!canSubmit || loading) return

    setLoading(true)
    window.setTimeout(() => {
      navigate(ROUTES.NICKNAME, { state: { email, password } })
    }, 900)
  }

  return (
    <div className="signup-onboard">
      <div className="signup-onboard__inner">
        <h1 className="signup-onboard__logo">NADOK</h1>

        <form className="signup-onboard__form" onSubmit={(e) => e.preventDefault()}>
          <input
            className={`signup-onboard__input${emailTouched ? ' signup-onboard__input--filled' : ''}${emailError ? ' signup-onboard__input--error' : ''}`}
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className={`signup-onboard__input${passwordTouched ? ' signup-onboard__input--filled' : ''}${passwordError ? ' signup-onboard__input--error' : ''}`}
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            autoComplete="new-password"
          />
          <input
            className={`signup-onboard__input${confirmTouched ? ' signup-onboard__input--filled' : ''}${confirmError ? ' signup-onboard__input--error' : ''}`}
            type="password"
            placeholder="비밀번호를 확인해주세요."
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />

          {helperText && (
            <p className={`signup-onboard__msg${helperIsError ? ' signup-onboard__msg--error' : ''}`}>
              {helperText}
            </p>
          )}

          <button
            className="signup-onboard__btn"
            type="button"
            disabled={!canSubmit}
            onClick={handleNext}
          >
            회원가입
          </button>

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
        </form>

        <div className="signup-onboard__home-indicator" aria-hidden="true" />

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
