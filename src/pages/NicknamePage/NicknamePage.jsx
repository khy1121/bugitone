import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { ChevronLeftIcon } from '../../assets/icons'
import { signup, checkNickname } from '../../api/userApi'
import './NicknamePage.scss'

const nicknameRegex = /^[가-힣a-z0-9]{3,10}$/

export default function NicknamePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, password } = location.state ?? {}

  const [nickname, setNickname] = useState('')
  const [nicknameStatus, setNicknameStatus] = useState('idle') // idle | checking | available | taken
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const touched = nickname.length > 0
  const isValid = nicknameRegex.test(nickname)
  const canCheck = isValid && nicknameStatus !== 'checking'
  const canSubmit = isValid && nicknameStatus === 'available' && !submitting

  // 이메일/비밀번호 없이 직접 접근 차단
  useEffect(() => {
    if (!email || !password) {
      navigate(ROUTES.SIGNUP, { replace: true })
    }
  }, [email, password, navigate])

  const handleCheck = async () => {
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

  // 닉네임 변경 시 중복 확인 상태 초기화
  const handleNicknameChange = (e) => {
    setNickname(e.target.value)
    setNicknameStatus('idle')
    setApiError('')
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

  const statusMsg = () => {
    if (!touched) return ''
    if (!isValid) return '3~10자, 한글·영어 소문자·숫자만 가능해요.'
    if (nicknameStatus === 'checking') return '확인 중...'
    if (nicknameStatus === 'available') return '사용할 수 있는 닉네임이에요.'
    if (nicknameStatus === 'taken') return '이미 사용 중인 닉네임이에요.'
    return '중복 확인을 해주세요.'
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <button className="auth-header__back" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ChevronLeftIcon size={24} color="#999" />
        </button>
      </header>

      <div className="auth-body nickname-body">
        <label className="nickname-label">닉네임</label>

        <div className="nickname-row">
          <input
            className="auth-field__input"
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={handleNicknameChange}
            maxLength={10}
          />
          <button
            className={`nickname-check-btn${canCheck ? ' nickname-check-btn--active' : ''}`}
            type="button"
            disabled={!canCheck}
            onClick={handleCheck}
          >
            중복 확인
          </button>
        </div>

        {touched && (
          <p className={`auth-field__msg${nicknameStatus === 'available' ? ' auth-field__msg--success' : nicknameStatus === 'taken' ? ' auth-field__msg--error' : ''}`}>
            {statusMsg()}
          </p>
        )}

        {apiError && <p className="auth-field__msg auth-field__msg--error">{apiError}</p>}

        <div className="nickname-spacer" />

        <button
          className={`auth-btn auth-btn--pill${canSubmit ? ' auth-btn--active' : ''}`}
          disabled={!canSubmit}
          onClick={handleSignup}
        >
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </div>
    </div>
  )
}
