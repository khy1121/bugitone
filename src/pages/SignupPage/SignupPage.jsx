import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'
import { checkEmail } from '../../api/userApi'
import useKeyboardAwareInput from '../../hooks/useKeyboardAwareInput'
import './SignupPage.scss'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SIGNUP_EMAIL_ERROR_MESSAGES = {
  400: '이메일을 다시 확인해주세요.',
  409: '이미 사용 중인 이메일입니다.',
}

function getSignupEmailErrorMessage(error) {
  return SIGNUP_EMAIL_ERROR_MESSAGES[error?.status]
    || error?.message
    || '이메일 중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.'
}

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
    ? '이메일 형식으로 입력해주세요. 예: abc123@gmail.com'
    : passwordError
    ? '비밀번호는 6~8자로 입력해주세요.'
    : passwordTouched && !passwordBlurred
    ? '비밀번호는 6~8자 이내로 입력해주세요.'
    : confirmError
    ? '비밀번호가 서로 일치하지 않아요.'
    : apiError || ''

  const msgIsError = emailError || passwordError || confirmError || !!apiError

  const handleNext = async () => {
    if (!canSubmit) return
    setLoading(true)
    setApiError('')

    try {
      const result = await checkEmail(email.trim())

      if (result?.available === false) {
        setEmailBlurred(true)
        setApiError('이미 사용 중인 이메일입니다.')
        setLoading(false)
        return
      }

      navigate(ROUTES.NICKNAME, { state: { email: email.trim(), password } })
    } catch (error) {
      setEmailBlurred(true)
      setApiError(getSignupEmailErrorMessage(error))
      setLoading(false)
    }
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
            className="signup-onboard__input"
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordTouched(true)
            }}
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
