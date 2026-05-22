import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { login } from '../../api/userApi'
import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'
import './LoginPage.scss'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailBlurred, setEmailBlurred] = useState(false)
  const [passwordBlurred, setPasswordBlurred] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const emailValid = emailRegex.test(email)
  const passwordValid = password.length >= 6 && password.length <= 8

  // 포커스를 벗어난 후에만 빨간 에러 표시
  const emailError = emailBlurred && !emailValid
  const passwordError = passwordBlurred && !passwordValid

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

  // 메시지 우선순위: 이메일 에러 > 비밀번호 에러 > 비밀번호 입력 힌트 > API 에러
  const msgText = emailError
    ? '이메일 형식이 올바르지 않습니다.'
    : passwordError
    ? '비밀번호가 올바르지 않습니다.'
    : passwordTouched && !passwordBlurred
    ? '6~8자 이내로 입력해주세요.'
    : apiError || ''

  const msgIsError = emailError || passwordError || !!apiError
  const msgType = msgIsError ? 'error' : 'hint'

  return (
    <div className="onboard-login">
      <div className="onboard-login__inner">
        <h1 className="onboard-login__logo">DOK</h1>

        <div className="onboard-login__form">
          <Input
            className="onboard-login__input"
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setEmailBlurred(true)}
            error={emailError}
            autoComplete="email"
          />
          <Input
            className="onboard-login__input"
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              setPasswordTouched(true)
            }}
            onBlur={() => setPasswordBlurred(true)}
            error={passwordError}
            autoComplete="current-password"
          />

          {/* Figma: 고정 48px 메시지 영역 — 이메일 에러 > 비밀번호 힌트 */}
          <div className="onboard-login__msg-area">
            {msgText && (
              <p className={`onboard-login__msg${msgType === 'error' ? ' onboard-login__msg--error' : ''}`}>
                {msgText}
              </p>
            )}
          </div>

          <Button
            className="onboard-login__btn"
            variant="primary"
            fullWidth
            disabled={!canSubmit}
            onClick={handleLogin}
          >
            {submitting ? '로그인 중...' : '로그인'}
          </Button>

          <p className="onboard-login__signup">
            회원이 아니신가요?{' '}
            <button
              className="onboard-login__signup-link"
              type="button"
              onClick={() => navigate(ROUTES.SIGNUP)}
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
