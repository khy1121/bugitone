import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { ChevronLeftIcon } from '../../assets/icons'
import { login } from '../../api/userApi'
import './LoginPage.scss'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const emailTouched = email.length > 0
  const emailValid = emailRegex.test(email)
  const emailError = emailTouched && !emailValid
  const emailSuccess = emailTouched && emailValid

  const passwordTouched = password.length > 0
  const passwordValid = password.length >= 6 && password.length <= 8

  const canSubmit = emailValid && passwordValid && !submitting

  const handleLogin = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setApiError('')
    try {
      const profile = await login({ email, password })
      localStorage.setItem('userId', String(profile.userId))
      localStorage.setItem('nickname', profile.nickname ?? '')
      navigate(ROUTES.HOME)
    } catch (err) {
      setApiError(err?.message ?? '로그인에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

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
        </div>

        <div className="auth-field">
          <input
            className="auth-field__input"
            type="password"
            placeholder="비밀번호(6~8자)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {passwordTouched && (
            <p className="auth-field__msg">6자~8자 내외로 설정해주세요.</p>
          )}
        </div>

        {apiError && <p className="auth-field__msg auth-field__msg--error">{apiError}</p>}

        <button
          className="auth-btn auth-btn--pill auth-btn--active"
          onClick={handleLogin}
          disabled={!canSubmit}
        >
          {submitting ? '로그인 중...' : '이메일로 로그인하기'}
        </button>

        <div className="auth-divider" />

        <button
          className="auth-btn auth-btn--pill"
          onClick={() => navigate(ROUTES.SIGNUP)}
        >
          이메일로 회원가입
        </button>
      </div>
    </div>
  )
}
