import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import Loading from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./ResultPage.scss";

const LOAD_CHAR_SRC = "/assets/character/LoadChar.svg";
const LITTLE_PRINCE_SRC = "/assets/character/LittlePrince.svg";
const PRINCE_SHADOW_SRC = "/assets/character/PrinceShadow.svg";
const COIN_SRC = "/assets/shop/coin.png";
const REGENERATE_COIN_COST = 2;

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}.${month}.${date}`;
};

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    emotions = ["공허함", "우울", "무기력"],
    comfort = "위로와 공감",
    loading: initialLoading = true,
    userName: stateUserName = "",
  } = location.state || {};

  const [loading, setLoading] = useState(initialLoading);
  const [coinBanner, setCoinBanner] = useState(null);

  const displayName = useMemo(() => {
    const savedNickname = window.localStorage.getItem("nickname") || "";
    return stateUserName || savedNickname || "김수현";
  }, [stateUserName]);

  const [coinCount, setCoinCount] = useState(() => {
    const savedCoinCount =
      window.localStorage.getItem("coinCount") ||
      window.localStorage.getItem("coins");

    const parsedCoinCount = Number.parseInt(savedCoinCount || "1", 10);
    return Number.isNaN(parsedCoinCount) ? 1 : parsedCoinCount;
  });

  useEffect(() => {
    if (!loading) return undefined;

    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [loading]);

  const moodTags = useMemo(() => {
    const normalized =
      emotions.length > 0 ? emotions : ["공허함", "우울", "무기력"];

    return normalized.slice(0, 3);
  }, [emotions]);

  const handleBack = () => {
    navigate(ROUTES.CHARACTER);
  };

  const handleRetry = () => {
    setCoinBanner("confirm");
  };

  const handleSaveImage = () => {
    console.log("이미지 저장하기");
  };

  const handleRegenerate = (event) => {
    event.stopPropagation();

    if (coinCount < REGENERATE_COIN_COST) {
      setCoinBanner("shortage");
      return;
    }

    const nextCoinCount = Math.max(coinCount - REGENERATE_COIN_COST, 0);
    setCoinCount(nextCoinCount);
    window.localStorage.setItem("coinCount", String(nextCoinCount));
    navigate(ROUTES.ANALYZE);
  };

  const handleBuyCoin = (event) => {
    event.stopPropagation();
    navigate(ROUTES.SHOP);
  };

  if (loading) {
    return (
      <main className="result-loading">
        <div className="result-loading__inner">
          <button
            className="result-loading__back-btn"
            type="button"
            onClick={handleBack}
          >
            ← 나가기
          </button>

          <p className="result-loading__date">{getCurrentDate()}</p>

          <h1 className="result-loading__title">
            오늘의 당신을
            <br />
            정독하고 있어요.......
          </h1>

          <div className="result-loading__visual" aria-hidden="true">
            <div className="result-loading__spinner-wrap">
              <Loading
                size={190}
                label="오늘의 당신을 정독하는 중"
                className="result-loading__spinner"
              />

              <img
                className="result-loading__character"
                src={LOAD_CHAR_SRC}
                alt=""
              />
            </div>
          </div>

          <p className="result-loading__quote">
            모든 게 낯설게 느껴지는 오늘, 앨리스도 처음엔
            <br />
            아무것도 이해하지 못한 채 그 세계에 뛰어들었어요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="result">
      <div className="result__content">
        <header className="result__header">
          <button
            className="result__back"
            type="button"
            onClick={handleBack}
          >
            ← 나가기
          </button>

          <button className="result__share" type="button" aria-label="공유하기">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 15V4"
                stroke="#42403A"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8.5 7.5L12 4L15.5 7.5"
                stroke="#42403A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12.5V18.5C5 19.3284 5.67157 20 6.5 20H17.5C18.3284 20 19 19.3284 19 18.5V12.5"
                stroke="#42403A"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <section className="result__intro">
          <h1>{displayName}님은...</h1>
          <p>{displayName}님의 상태를 정독한 결과에요.</p>
        </section>

        <section className="result__book-card">
          <h2>어른이 된 어린왕자</h2>
          <p className="result__book-meta">어린왕자 ㅣ 앙투안 드 생텍쥐페리</p>

          <div className="result__book-visual">
            <img
              className="result__book-shadow"
              src={PRINCE_SHADOW_SRC}
              alt=""
              aria-hidden="true"
            />

            <img
              className="result__book-image"
              src={LITTLE_PRINCE_SRC}
              alt="어른이 된 어린왕자"
            />
          </div>

          <div className="result__quote-box">
            <span className="result__quote-side result__quote-side--left" />
            <p>
              “ 중요한 것은 눈에 보이지 않아.
              <br />
              마음으로 보아야 해”
            </p>
            <span className="result__quote-side result__quote-side--right" />
          </div>
        </section>

        <section className="result__mood-card">
          <h2>{displayName}님의 기분 상태</h2>

          <div className="result__chips">
            {moodTags.map((tag) => (
              <span key={tag}># {tag}</span>
            ))}
          </div>
        </section>

        <section className="result__piece">
          <div className="result__piece-heading">
            <img src={LOAD_CHAR_SRC} alt="" aria-hidden="true" />
            <h2>오늘의 조각</h2>
          </div>

          <div className="result__piece-card">
            <p>
              뿌듯함과 지침이 동시에 느껴지는 오늘,
              <br />
              어린 왕자처럼 작은 것들의 소중함을 알면서도
              <br />
              그 무게에 지쳐있는 당신과 닮았어요.
            </p>
          </div>
        </section>

        <div className="result__actions">
          <button className="result__retry" type="button" onClick={handleRetry}>
            다시 생성하기
          </button>

          <button
            className="result__save"
            type="button"
            onClick={handleSaveImage}
          >
            이미지 저장하기
          </button>
        </div>
      </div>

      {coinBanner && (
        <div
          className="result-coin-banner"
          role="presentation"
          onClick={() => setCoinBanner(null)}
        >
          <section
            className="result-coin-banner__sheet"
            aria-label={
              coinBanner === "confirm" ? "다시 생성하기" : "코인이 부족해요"
            }
          >
            <img
              className="result-coin-banner__coin"
              src={COIN_SRC}
              alt=""
              aria-hidden="true"
            />

            <h2>
              {coinBanner === "confirm" ? "다시 생성하기" : "코인이 부족해요"}
            </h2>

            <p
              className={
                coinBanner === "shortage"
                  ? "result-coin-banner__desc result-coin-banner__desc--danger"
                  : "result-coin-banner__desc"
              }
            >
              {coinBanner === "confirm"
                ? `(다독 코인 ${REGENERATE_COIN_COST}개 필요)`
                : `(잔액 : ${coinCount}개 / 필요 갯수: ${REGENERATE_COIN_COST}개)`}
            </p>

            <div
              className={`result-coin-banner__actions${
                coinBanner === "shortage"
                  ? " result-coin-banner__actions--single"
                  : ""
              }`}
            >
              <button
                className={`result-coin-banner__button ${
                  coinBanner === "shortage"
                    ? "result-coin-banner__button--primary"
                    : "result-coin-banner__button--muted"
                }`}
                type="button"
                onClick={handleBuyCoin}
              >
                코인 구매하기
              </button>

              {coinBanner === "confirm" && (
                <button
                  className="result-coin-banner__button result-coin-banner__button--primary"
                  type="button"
                  onClick={handleRegenerate}
                >
                  네, 지불할게요!
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
