import React from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import './ShopPage.scss'

const DAILY_REWARDS = [
  { day: 1, coins: 1, active: true },
  { day: 2, coins: 1 },
  { day: 3, coins: 1 },
  { day: 4, coins: 1 },
  { day: 5, coins: 2 },
  { day: 6, coins: 1 },
  { day: 7, coins: 3 },
]

const PACKAGES = [
  { coins: 10, price: '900원' },
  { coins: 50, price: '4900원' },
  { coins: 100, price: '9900원' },
  { coins: 150, price: '14900원' },
  { coins: 200, price: '19900원' },
  { coins: 250, price: '24900원' },
  { coins: 300, price: '29900원' },
]

export default function ShopPage() {
  const navigate = useNavigate()
  const coinCount = 1

  return (
    <main className="shop-page">
      <div className="shop-page__inner">
        <span className="shop-page__glow" aria-hidden="true" />

        <header className="shop-header">
          <button className="shop-header__back" type="button" onClick={() => navigate('/character')}>
            ← 나가기
          </button>
          <h1 className="shop-header__title">다독코인샵</h1>
        </header>

        <section className="shop-balance" aria-label="보유 코인">
          <div className="shop-balance__card">
            <span>현재 보유한 다독코인 </span>
            <strong>{coinCount}개</strong>
          </div>
          <img
            src="/assets/shop/character.svg"
            alt=""
            className="shop-balance__character"
            aria-hidden="true"
          />
        </section>

        <div className="shop-sections">
          <section className="shop-card shop-card--event">
            <div className="shop-card__head">
              <h2 className="shop-card__title">수현님만을 위한 이벤트</h2>
              <button className="shop-link" type="button">
                이용안내
              </button>
            </div>

            <img
              src="/assets/shop/event.webp"
              alt="토독토독 똑똑! 다독 코인 20개 구매시 2개 보너스"
              className="shop-event-banner"
            />

            <div className="shop-event-item">
              <p>
                다독코인 20개 <strong>+ 2개 보너스</strong>
              </p>
              <button className="shop-buy-btn" type="button">
                1200원
              </button>
            </div>
          </section>

          <section className="shop-card shop-card--daily">
            <h2 className="shop-card__title">오늘의 코인</h2>
            <p className="shop-card__desc">하루 출석 시에 얻을 수 있는 코인이에요.</p>

            <div className="shop-daily">
              {DAILY_REWARDS.map(({ day, coins, active }) => (
                <div
                  key={day}
                  className={`shop-daily__item${active ? ' shop-daily__item--active' : ''}`}
                >
                  <span className="shop-daily__day">DAY {day}</span>
                  <span className="shop-daily__coin-stack" aria-hidden="true">
                    {Array.from({ length: coins }).map((_, index) => (
                      <img
                        key={index}
                        src="/assets/shop/coin.png"
                        alt=""
                        className="shop-daily__coin"
                      />
                    ))}
                  </span>
                  <span className="shop-daily__plus">+{coins}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="shop-card shop-card--ad">
            <div>
              <h2 className="shop-card__title">갓 획득한 코인</h2>
              <p className="shop-card__desc">광고 보는 동안 코인이 생겨요</p>
            </div>
            <button className="shop-ad-btn" type="button">
              0 / 10
            </button>
          </section>

          <section className="shop-card shop-card--packages">
            <h2 className="shop-card__title">일반 패키지</h2>
            <ul className="shop-packages">
              {PACKAGES.map(({ coins, price }) => (
                <li key={coins} className="shop-package">
                  <img src="/assets/shop/coin.png" alt="" className="shop-package__coin" />
                  <span className="shop-package__name">다독코인 {coins}개</span>
                  <button className="shop-buy-btn" type="button">
                    {price}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
