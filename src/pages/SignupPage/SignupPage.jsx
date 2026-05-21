import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { ChevronLeftIcon } from '../../assets/icons'
import './SignupPage.scss'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const emailTouched = email.length > 0
  const emailValid = emailRegex.test(email)
  const emailError = emailTouched && !emailValid
  const emailSuccess = emailTouched && emailValid

  const passwordTouched = password.length > 0
  const passwordValid = password.length >= 6 && password.length <= 8

  const confirmTouched = confirm.length > 0
  const confirmMatch = confirm === password
  const confirmError = confirmTouched && !confirmMatch
  const confirmValid = confirmTouched && confirmMatch

  const canSubmit = emailValid && passwordValid && confirmValid

  return (
    <div className="auth-page">
      <header className="auth-header">
        <button className="auth-header__back" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ChevronLeftIcon size={24} color="#999" />
        </button>
        <span className="auth-header__title">시작하기</span>
      </header>

      <div className="auth-body">
        <div className="auth-field">
          <input
            className="auth-field__input"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          {emailError && (
            <p className="auth-field__msg auth-field__msg--error">이메일 형식이 올바르지 않습니다.</p>
          )}
          {emailSuccess && (
            <p className="auth-field__msg auth-field__msg--success">사용할 수 있는 이메일입니다.</p>
          )}
        </div>

        <div className="auth-field">
          <input
            className="auth-field__input"
            type="password"
            placeholder="비밀번호(6~8자)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {passwordTouched && (
            <p className="auth-field__msg">6자~8자 내외로 설정해주세요.</p>
          )}
        </div>

        <div className="auth-field">
          <input
            className="auth-field__input"
            type="password"
            placeholder="비밀번호 확인"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {confirmError && (
            <p className="auth-field__msg auth-field__msg--error">비밀번호가 일치하지 않아요.</p>
          )}
        </div>

        <button
          className={`auth-btn auth-btn--pill${canSubmit ? ' auth-btn--active' : ''}`}
          disabled={!canSubmit}
          onClick={() => navigate(ROUTES.NICKNAME, { state: { email, password } })}
        >
          이메일로 회원가입
        </button>

        <div className="auth-divider" />

        <button
          className="auth-btn auth-btn--pill"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          이메일로 로그인하기
        </button>
      </div>
    </div>
  )
}
