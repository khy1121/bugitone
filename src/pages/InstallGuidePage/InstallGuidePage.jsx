import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '../../assets/icons'
import './InstallGuidePage.scss'

const INSTALL_GUIDE_SECTIONS = [
  {
    id: 'android',
    badge: 'AOS',
    title: '안드로이드',
    description: 'Chrome에서 NADOK을 홈 화면 앱으로 설치할 수 있어요.',
    steps: [
      'Chrome 브라우저로 NADOK에 접속해요.',
      '설치 안내 배너가 보이면 설치를 눌러요.',
      '배너가 없다면 오른쪽 위 메뉴를 열고 앱 설치 또는 홈 화면에 추가를 선택해요.',
      '확인 창에서 설치를 누르면 홈 화면에 NADOK 아이콘이 생겨요.',
    ],
    tip: '삼성 인터넷도 홈 화면에 추가 메뉴를 지원하지만, Chrome 기준으로 설치하는 것을 권장해요.',
  },
  {
    id: 'ios',
    badge: 'iOS',
    title: 'iOS',
    description: 'iPhone과 iPad는 Safari에서 홈 화면에 직접 추가해야 해요.',
    steps: [
      'Safari 브라우저로 NADOK에 접속해요.',
      '하단 공유 버튼을 눌러요.',
      '메뉴에서 홈 화면에 추가를 선택해요.',
      '이름이 NADOK으로 보이는지 확인하고 추가를 누르면 설치가 끝나요.',
    ],
    tip: 'iOS에서는 Chrome이 아니라 Safari로 접속해야 홈 화면에 추가할 수 있어요.',
  },
  {
    id: 'desktop',
    badge: 'PC',
    title: '데스크탑',
    description: 'Chrome 또는 Edge에서 독립 실행 앱처럼 설치할 수 있어요.',
    steps: [
      'Chrome 또는 Edge로 NADOK에 접속해요.',
      '주소창 오른쪽의 설치 아이콘을 눌러요.',
      '설치 아이콘이 없다면 브라우저 메뉴에서 앱 설치를 선택해요.',
      '설치를 확인하면 시작 메뉴, Dock 또는 작업 표시줄에서 NADOK을 열 수 있어요.',
    ],
    tip: '설치 후에는 일반 브라우저 탭보다 더 넓은 화면에서 앱처럼 사용할 수 있어요.',
  },
]

const installPromptSubscribers = new Set()

function getCachedInstallPrompt() {
  if (typeof window === 'undefined') return null
  return window.__nadokPwaInstallPrompt ?? null
}

function setCachedInstallPrompt(prompt) {
  if (typeof window === 'undefined') return

  window.__nadokPwaInstallPrompt = prompt
  installPromptSubscribers.forEach((subscriber) => subscriber(prompt))
}

function subscribeInstallPrompt(subscriber) {
  installPromptSubscribers.add(subscriber)
  subscriber(getCachedInstallPrompt())

  return () => {
    installPromptSubscribers.delete(subscriber)
  }
}

if (
  typeof window !== 'undefined' &&
  !window.__nadokPwaInstallPromptListenerReady
) {
  window.__nadokPwaInstallPromptListenerReady = true
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    setCachedInstallPrompt(event)
  })
  window.addEventListener('appinstalled', () => {
    setCachedInstallPrompt(null)
  })
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent || ''
  const platform = navigator.platform || ''

  return (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isStandalonePwa() {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true
  )
}

function InstallNoticeModal({ title, description, onClose }) {
  return (
    <div className="install-guide__overlay install-guide__overlay--center">
      <div
        className="install-guide__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        <span className="install-guide__modal-mark" aria-hidden="true">
          PWA
        </span>
        <h2 id="install-modal-title">{title}</h2>
        <p>{description}</p>
        <button
          type="button"
          className="install-guide__modal-btn"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  )
}

export default function InstallGuidePage({ onBack }) {
  const navigate = useNavigate()
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(() =>
    getCachedInstallPrompt(),
  )
  const [installModal, setInstallModal] = useState(null)

  useEffect(() => {
    const handleAppInstalled = () => {
      setInstallModal({
        title: '설치가 완료됐어요',
        description: '홈 화면이나 앱 목록에서 NADOK 아이콘을 눌러 바로 열 수 있어요.',
      })
    }

    const unsubscribeInstallPrompt =
      subscribeInstallPrompt(setDeferredInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      unsubscribeInstallPrompt()
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    navigate(-1)
  }

  const handleInstallClick = async () => {
    if (isStandalonePwa()) {
      setInstallModal({
        title: '이미 설치되어 있어요',
        description: '현재 NADOK이 앱 화면으로 실행 중이에요. 홈 화면이나 앱 목록에서도 확인할 수 있어요.',
      })
      return
    }

    if (isIosDevice()) {
      setInstallModal({
        title: 'iOS는 자동 설치를 지원하지 않아요',
        description: 'Safari에서 공유 버튼을 누른 뒤 홈 화면에 추가를 선택해 주세요. iPhone과 iPad는 이 방식으로만 PWA를 설치할 수 있어요.',
      })
      return
    }

    if (!deferredInstallPrompt) {
      setInstallModal({
        title: '브라우저 설치 버튼을 사용할 수 없어요',
        description: 'Chrome 또는 Edge에서 접속했는지 확인해 주세요. 설치 아이콘이 보이지 않으면 브라우저 메뉴의 앱 설치를 선택해 주세요.',
      })
      return
    }

    try {
      await deferredInstallPrompt.prompt()
      const choice = await deferredInstallPrompt.userChoice
      setCachedInstallPrompt(null)

      if (choice?.outcome === 'accepted') {
        setInstallModal({
          title: '설치가 시작됐어요',
          description: '설치가 끝나면 홈 화면, 시작 메뉴 또는 작업 표시줄에서 NADOK을 열 수 있어요.',
        })
      } else {
        setInstallModal({
          title: '설치가 취소됐어요',
          description: '다시 설치하려면 브라우저 주소창의 설치 아이콘이나 메뉴의 앱 설치를 선택해 주세요.',
        })
      }
    } catch {
      setInstallModal({
        title: '설치를 시작하지 못했어요',
        description: '브라우저 메뉴에서 앱 설치를 직접 선택하거나, 페이지를 새로고침한 뒤 다시 시도해 주세요.',
      })
    }
  }

  return (
    <div className="install-guide">
      <div className="install-guide__header">
        <button
          className="install-guide__back"
          type="button"
          onClick={handleBack}
          aria-label="뒤로"
        >
          <ChevronLeftIcon size={24} color="#282723" />
        </button>
        <h1 className="install-guide__header-title">앱 설치 방법</h1>
      </div>

      <div className="install-guide__scroll">
        <section className="install-guide__hero">
          <span className="install-guide__hero-badge">PWA</span>
          <h2>NADOK을 앱처럼 설치하기</h2>
          <p>
            앱스토어를 거치지 않고 브라우저에서 홈 화면이나 시작 메뉴에
            바로 추가할 수 있어요.
          </p>
        </section>

        <div className="install-guide__list">
          {INSTALL_GUIDE_SECTIONS.map((section) => (
            <article key={section.id} className="install-guide__card">
              <div className="install-guide__card-head">
                <span className="install-guide__card-badge">
                  {section.badge}
                </span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </div>

              <ol className="install-guide__steps">
                {section.steps.map((step, index) => (
                  <li key={step} className="install-guide__step">
                    <span
                      className="install-guide__step-number"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="install-guide__step-text">{step}</span>
                  </li>
                ))}
              </ol>

              <p className="install-guide__tip">{section.tip}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="install-guide__action">
        <button
          type="button"
          className="install-guide__action-btn"
          onClick={handleInstallClick}
        >
          바로 설치하기
        </button>
      </div>

      {installModal && (
        <InstallNoticeModal
          title={installModal.title}
          description={installModal.description}
          onClose={() => setInstallModal(null)}
        />
      )}
    </div>
  )
}
