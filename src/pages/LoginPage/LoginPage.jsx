import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { login } from '../../api/userApi'
import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'
import PasswordVisibilityButton from '../../components/common/PasswordVisibilityButton/PasswordVisibilityButton'
import useKeyboardAwareInput from '../../hooks/useKeyboardAwareInput'
import { isAuthenticated, storeUserProfile } from '../../utils/authStorage'
import './LoginPage.scss'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LOGIN_ERROR_MESSAGES = {
  401: '이메일 또는 비밀번호가 맞지 않아요.',
  404: '가입된 계정을 찾을 수 없어요.',
}

function getLoginErrorMessage(error) {
  return LOGIN_ERROR_MESSAGES[error?.status]
    || error?.message
    || '로그인에 실패했어요. 잠시 후 다시 시도해주세요.'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailBlurred, setEmailBlurred] = useState(false)
  const [passwordBlurred, setPasswordBlurred] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const emailValid = emailRegex.test(email)
  const passwordValid = password.length >= 6 && password.length <= 8

  // 포커스를 벗어난 후에만 빨간 에러 표시
  const emailError = emailBlurred && !emailValid
  const passwordError = passwordBlurred && !passwordValid

  const canSubmit = emailValid && passwordValid && !submitting
  const keyboard = useKeyboardAwareInput({
    scrollRef: pageRef,
    resetScrollOnFocus: true,
  })

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(ROUTES.HOME, { replace: true })
    }
  }, [navigate])

  const handleLogin = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setApiError('')
    try {
      const profile = await login({ email, password })
      if (!profile?.userId) {
        throw new Error('로그인 응답에 사용자 정보가 없습니다.')
      }
      storeUserProfile(profile, { email })
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setApiError(getLoginErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // 메시지 우선순위: 이메일 에러 > 비밀번호 에러 > 비밀번호 입력 힌트 > API 에러
  const msgText = emailError
    ? '이메일 형식으로 입력해주세요. 예: abc123@gmail.com'
    : passwordError
    ? '비밀번호는 6~8자로 입력해주세요.'
    : passwordTouched && !passwordBlurred
    ? '비밀번호는 6~8자 이내로 입력해주세요.'
    : apiError || ''

  const msgIsError = emailError || passwordError || !!apiError
  const msgType = msgIsError ? 'error' : 'hint'

  return (
    <div
      ref={pageRef}
      className={`onboard-login${keyboard.isKeyboardFocused ? ' onboard-login--keyboard' : ''}`}
    >
      <div className="onboard-login__inner">
        <h1 className="onboard-login__logo">DOK</h1>

        <div className="onboard-login__form">
          <Input
            className="onboard-login__input"
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setApiError('')
            }}
            onFocus={keyboard.handleFocus}
            onBlur={(event) => {
              setEmailBlurred(true)
              keyboard.handleBlur(event)
            }}
            error={emailError || !!apiError}
            autoComplete="email"
          />
          <Input
            className="onboard-login__input onboard-login__input--password"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              setPasswordTouched(true)
              setApiError('')
            }}
            onFocus={keyboard.handleFocus}
            onBlur={(event) => {
              setPasswordBlurred(true)
              keyboard.handleBlur(event)
            }}
            error={passwordError || !!apiError}
            autoComplete="current-password"
          />
          <PasswordVisibilityButton
            className="onboard-login__password-toggle"
            visible={passwordVisible}
            onClick={() => setPasswordVisible((current) => !current)}
            disabled={submitting}
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

          <button
            className="onboard-login__install-link"
            type="button"
            onClick={() => navigate(ROUTES.INSTALL_GUIDE)}
          >
            앱 설치 방법
          </button>
        </div>
      </div>
    </div>
  )
}
