import React from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import { ROUTES } from '../../constants/routes'
import './CharacterPage.scss'

export default function CharacterPage() {
  const navigate = useNavigate()

  return (
    <main className="char-landing">
      <section className="char-landing__text">
        <h1 className="char-landing__title">오늘 하루는 어떤가요?</h1>
        <p className="char-landing__subtitle">
          오늘 감정을 들려주면<br />
          어울리는 캐릭터를 찾아드릴게요.
        </p>
      </section>

      <div className="char-landing__stage" aria-hidden="true">
        <span className="char-landing__ripple char-landing__ripple--outer" />
        <span className="char-landing__ripple char-landing__ripple--middle" />
        <span className="char-landing__ripple char-landing__ripple--inner" />
        <span className="char-landing__glow" />

        <img
          className="char-landing__character"
          src="/assets/character/character.svg"
          alt=""
        />
      </div>

      <button
        className="char-landing__cta"
        type="button"
        variant="glass"
        onClick={() => navigate(ROUTES.ANALYZE)}
      >
        캐릭터 찾기
      </button>

      <BottomNav active="character" className="bottom-nav--character-landing" />
    </main>
  )
}