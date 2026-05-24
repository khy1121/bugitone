import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { validateEmotionInput } from "../../api/emotionApi";
import "./AnalyzePage.scss";

const ALERT_ICON_SRC = "/assets/alert-02.svg";

const QUESTIONS = [
  ["오늘 하루 있었던", "일기를 간단하게 적어주세요."],
  ["현재 어떤 기분 상태와", "가장 가까우신가요?"],
  ["오늘은 어떤 위로를", "받고 싶으신가요?"],
];

const EMOTION_GROUPS = [
  ["신나는", "뿌듯한", "행복한", "차분한"],
  ["슬픈", "스트레스", "공허한"],
  ["피곤한", "우울", "분노"],
];

const COMFORT_OPTIONS = ["위로와 공감", "현실적 조언"];

const DIARY_EMPTY_HEIGHT = 56;
const DIARY_MIN_HEIGHT = 56;
const DIARY_MAX_HEIGHT = 316;
const DIARY_COUNTER_SPACE = 40;
const DIARY_VIEWPORT_MARGIN = 16;
const ACTION_HEIGHT = 60;
const ACTION_BOTTOM_OFFSET = 58;

const KEYBOARD_BLUR_DELAY = 420;

const formatToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}.${month}.${date}`;
};

export default function AnalyzePage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const diaryGroupRef = useRef(null);
  const textareaRef = useRef(null);
  const blurTimerRef = useRef(null);

  const today = useMemo(() => formatToday(), []);

  const [step, setStep] = useState(1);
  const [diary, setDiary] = useState("");
  const [emotions, setEmotions] = useState([]);
  const [comfort, setComfort] = useState("");
  const [isDiaryFocused, setIsDiaryFocused] = useState(false);
  const [diaryHeight, setDiaryHeight] = useState(DIARY_EMPTY_HEIGHT);
  const [diaryMaxHeight, setDiaryMaxHeight] = useState(DIARY_MAX_HEIGHT);
  const [viewportTick, setViewportTick] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInvalidDialog, setShowInvalidDialog] = useState(false);
  const [validating, setValidating] = useState(false);

  const canNext = useMemo(() => {
    if (step === 1) return diary.trim().length > 0;
    if (step === 2) return emotions.length > 0;
    return Boolean(comfort);
  }, [comfort, diary, emotions.length, step]);

  const diaryCounterText =
    diary.length >= 300 ? `(${diary.length} / 300)` : `(${diary.length}/300)`;

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) {
        window.clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const maxHeight = getAvailableDiaryHeight();
    setDiaryMaxHeight(maxHeight);

    if (!diary) {
      setDiaryHeight(DIARY_EMPTY_HEIGHT);
      return;
    }

    textarea.style.height = "auto";

    const nextHeight = Math.min(
      maxHeight,
      Math.max(DIARY_MIN_HEIGHT, Math.ceil(textarea.scrollHeight)),
    );

    textarea.style.height = "";
    setDiaryHeight(nextHeight);
  }, [diary, isDiaryFocused, viewportTick]);

  useLayoutEffect(() => {
    if (!isDiaryFocused) return;

    scrollDiaryToBottomIfNeeded();
    scrollDiaryGroupIntoView();
  }, [diary, diaryHeight, isDiaryFocused]);

  useEffect(() => {
    if (!isDiaryFocused) return undefined;

    const scrollAfterViewportChange = () => {
      window.requestAnimationFrame(() => {
        setViewportTick((current) => current + 1);
        scrollDiaryToBottomIfNeeded();
        scrollDiaryGroupIntoView();
      });
    };

    window.addEventListener("resize", scrollAfterViewportChange);
    window.visualViewport?.addEventListener("resize", scrollAfterViewportChange);
    window.visualViewport?.addEventListener("scroll", scrollAfterViewportChange);

    return () => {
      window.removeEventListener("resize", scrollAfterViewportChange);
      window.visualViewport?.removeEventListener(
        "resize",
        scrollAfterViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        scrollAfterViewportChange,
      );
    };
  }, [isDiaryFocused]);

  const handleBack = () => {
    setShowConfirm(true);
  };

  const handlePrevious = () => {
    if (step === 1) return;
    setStep((current) => current - 1);
  };

  const handleNext = async () => {
    if (!canNext || validating) return;

    if (step < 3) {
      if (step === 1) {
        setValidating(true);

        try {
          const result = await validateEmotionInput(diary.trim());
          if (!result?.valid) {
            setShowInvalidDialog(true);
            return;
          }
        } catch (error) {
          setShowInvalidDialog(true);
          return;
        } finally {
          setValidating(false);
        }
      }

      setStep((current) => current + 1);
      return;
    }

    navigate(ROUTES.RESULT, {
      state: {
        prompt: diary,
        emotions,
        comfort,
        loading: true,
      },
    });
  };

  const handleDiaryChange = (event) => {
    setDiary(event.target.value);
    setShowInvalidDialog(false);

    window.requestAnimationFrame(() => {
      scrollDiaryToBottomIfNeeded();
      scrollDiaryGroupIntoView();
    });
  };

  const handleDiaryFocus = () => {
    if (blurTimerRef.current) {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }

    setIsDiaryFocused(true);

    window.requestAnimationFrame(() => {
      scrollDiaryGroupIntoView();
    });
  };

  const handleDiaryBlur = () => {
    if (blurTimerRef.current) {
      window.clearTimeout(blurTimerRef.current);
    }

    blurTimerRef.current = window.setTimeout(() => {
      setIsDiaryFocused(false);
      setDiaryMaxHeight(DIARY_MAX_HEIGHT);
      pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, KEYBOARD_BLUR_DELAY);
  };

  const toggleEmotion = (emotion) => {
    setEmotions((current) => {
      if (current.includes(emotion)) {
        return current.filter((item) => item !== emotion);
      }

      if (current.length >= 3) return current;

      return [...current, emotion];
    });
  };

  const scrollDiaryToBottomIfNeeded = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const hasOverflow = textarea.scrollHeight > textarea.clientHeight + 2;

    if (hasOverflow) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  const getAvailableDiaryHeight = () => {
    // blur 직후 visual viewport가 아직 키보드 높이를 반환하는 race condition 방지.
    // unfocused 상태에서는 디자인 최대값(316px) 그대로 반환 —
    // Figma 기준 textarea max bottom(342+316=658) < button top(734) 이므로 겹치지 않음.
    if (!isDiaryFocused) return DIARY_MAX_HEIGHT;

    const textarea = textareaRef.current;
    if (!textarea) return DIARY_MAX_HEIGHT;

    const diaryTop = textarea.getBoundingClientRect().top;
    const visualViewport = window.visualViewport;
    const viewportBottom = visualViewport
      ? visualViewport.offsetTop + visualViewport.height
      : window.innerHeight;
    const availableHeight =
      viewportBottom - diaryTop - DIARY_COUNTER_SPACE - DIARY_VIEWPORT_MARGIN;

    return Math.min(
      DIARY_MAX_HEIGHT,
      Math.max(DIARY_MIN_HEIGHT, Math.floor(availableHeight)),
    );
  };

  const scrollDiaryGroupIntoView = () => {
    const page = pageRef.current;
    const group = diaryGroupRef.current;
    if (!page || !group || !isDiaryFocused) return;

    const pageRect = page.getBoundingClientRect();
    const groupRect = group.getBoundingClientRect();
    const visibleBottom =
      window.visualViewport?.height ?? document.documentElement.clientHeight;
    const groupBottom = groupRect.bottom - pageRect.top;
    const targetBottom = visibleBottom - DIARY_VIEWPORT_MARGIN;

    if (groupBottom > targetBottom) {
      page.scrollTo({
        top: page.scrollTop + groupBottom - targetBottom,
        behavior: "smooth",
      });
    }
  };

  const handleRetryDiary = () => {
    setShowInvalidDialog(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <div
      ref={pageRef}
      className={[
        "analyze",
        step === 1 && diary && "analyze--has-diary",
        step === 1 && isDiaryFocused && "analyze--keyboard",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="analyze__inner">
        <button className="analyze__back" type="button" onClick={handleBack}>
          ← 나가기
        </button>

        <div className="analyze__progress" aria-label={`${step} / 3 단계`}>
          <span
            className={`analyze__progress-fill analyze__progress-fill--step-${step}`}
          />
        </div>

        <main className={`analyze__body analyze__body--step-${step}`}>
          <p className="analyze__date">{today}</p>

          <h1 className="analyze__question">
            {QUESTIONS[step - 1].map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>

          {step === 1 && (
            <>
              <p className="analyze__hint">최대 300자까지 적을 수 있어요.</p>

              <div ref={diaryGroupRef} className="analyze__diary-group">
                <div
                  className={[
                    "analyze__diary",
                    diary && "analyze__diary--filled",
                    isDiaryFocused && "analyze__diary--focused",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    "--diary-height": `${diaryHeight}px`,
                    "--diary-max-height": `${diaryMaxHeight}px`,
                  }}
                >
                  <textarea
                    ref={textareaRef}
                    value={diary}
                    rows={1}
                    maxLength={300}
                    onChange={handleDiaryChange}
                    onFocus={handleDiaryFocus}
                    onBlur={handleDiaryBlur}
                    placeholder="일기를 입력해주세요."
                  />
                </div>

                {(isDiaryFocused || diary) && (
                  <p className="analyze__counter">{diaryCounterText}</p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="analyze__hint">최대 3가지 선택할 수 있어요.</p>

              <div className="analyze__emotions">
                {EMOTION_GROUPS.map((group) => (
                  <div key={group.join("-")} className="analyze__emotion-row">
                    {group.map((emotion) => {
                      const active = emotions.includes(emotion);

                      return (
                        <button
                          key={emotion}
                          type="button"
                          className={`analyze__chip${active ? " analyze__chip--active" : ""}`}
                          disabled={!active && emotions.length >= 3}
                          onClick={() => toggleEmotion(emotion)}
                        >
                          {emotion}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="analyze__comforts">
              {COMFORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`analyze__comfort${comfort === option ? " analyze__comfort--active" : ""}`}
                  onClick={() => setComfort(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </main>

        <div
          className={[
            "analyze__actions",
            step === 1 && "analyze__actions--single",
            step === 1 && isDiaryFocused && "analyze__actions--keyboard",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {step > 1 && (
            <button
              className="analyze__prev"
              type="button"
              onClick={handlePrevious}
            >
              이전 단계로
            </button>
          )}

          <button
            className={`analyze__next${canNext ? " analyze__next--active" : ""}`}
            type="button"
            disabled={!canNext || validating}
            onClick={handleNext}
          >
            {validating ? "확인 중..." : "다음 단계로"}
          </button>
        </div>

        {step === 1 && !diary.trim() && !isDiaryFocused && (
          <p className="analyze__empty-guide">일기를 적어주세요.</p>
        )}
      </div>

      {showInvalidDialog && (
        <div className="analyze__invalid-overlay" role="dialog" aria-modal="true" aria-labelledby="analyze-invalid-title">
          <section className="analyze__invalid-dialog">
            <img className="analyze__invalid-icon" src={ALERT_ICON_SRC} alt="" aria-hidden="true" />
            <p id="analyze-invalid-title" className="analyze__invalid-message">
              일기를 분석할 수 없어요.
              <br />
              다시 한 번 작성해주세요.
            </p>
            <button className="analyze__invalid-retry" type="button" onClick={handleRetryDiary}>
              다시 시도하기
            </button>
          </section>
        </div>
      )}

      {showConfirm && (
        <div className="analyze__overlay" role="dialog" aria-modal="true">
          <div className="analyze__dialog">
            <p>
              뒤로 나가시면 작성하신 내용은{"\n"}
              복원되지 않습니다.{"\n"}
              정말로 나가시겠습니까?
            </p>

            <div className="analyze__dialog-actions">
              <button type="button" onClick={() => navigate(ROUTES.CHARACTER)}>
                네, 나갈래요
              </button>

              <button type="button" onClick={() => setShowConfirm(false)}>
                아니요, 계속 쓸래요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
