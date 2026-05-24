import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/common/BottomNav/BottomNav";
import Chip from "../../components/common/Chip/Chip";
import { mockBooks } from "../../data/mockBooks";
import { ChevronRightIcon, ChevronLeftIcon } from "../../assets/icons";
import { ROUTES } from "../../constants/routes";
import { updateUser, checkNickname } from "../../api/userApi";
import "./MyPage.scss";

const CURRENT_MONTH = new Date().getMonth() + 1;
const EMOTIONS = ["#뿌듯함", "#지침", "#설렘"];
const ACTIVE_EMOTIONS = new Set(["#뿌듯함", "#지침"]);
const LIBRARY_CATEGORIES = ["다 읽은 책", "읽고 있는 책", "찜한 책"];

const CAT_TABS = [
  { id: "all", label: "전체", status: null },
  { id: "read", label: "읽은 책", status: "다 읽은 책" },
  { id: "reading", label: "읽고 있는 책", status: "읽고 있는 책" },
  { id: "wishlist", label: "읽고 싶은 책", status: "찜한 책" },
];

const CATEGORY_TO_TAB = {
  "다 읽은 책": "read",
  "읽고 있는 책": "reading",
  "찜한 책": "wishlist",
};

function getBooksWithInfo() {
  return mockBooks.map((book) => {
    const saved = JSON.parse(
      localStorage.getItem(`bookInfo_${book.id}`) || "null",
    );
    const extra = JSON.parse(
      localStorage.getItem(`bookExtra_${book.id}`) || "null",
    );
    return {
      ...book,
      status: saved?.status ?? book.status,
      startDate: saved?.startDate || book.startDate || "",
      endDate: saved?.endDate || book.endDate || "",
      rating: extra?.rating ?? book.rating ?? 0,
      currentPage: extra?.currentPage ?? book.currentPage ?? 0,
    };
  });
}

// ── 계정 뷰 아이콘 (SVG 파일 참조) ─────────────────────────────────────────

function LibraryRowIcon({ status }) {
  if (status === "다 읽은 책") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
          stroke="black"
          stroke-width="1.3"
        />
        <path
          d="M8 12.5L10.5 15L16 9"
          stroke="#282723"
          stroke-width="1.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    );
  }
  if (status === "읽고 있는 책") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12.1816"
          cy="12.1819"
          r="10"
          stroke="#282723"
          stroke-width="1.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.1816 8.18188V12.6819"
          stroke="#282723"
          stroke-width="1.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.1816 16.1699V16.1799"
          stroke="#282723"
          stroke-width="1.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.1816 8.18188V12.6819"
          stroke="#282723"
          stroke-width="1.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.1816 16.1699V16.1799"
          stroke="#282723"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
        stroke="#282723"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      className="mypage__back"
      type="button"
      onClick={onClick}
      aria-label="뒤로"
    >
      <ChevronLeftIcon size={24} color="#282723" />
    </button>
  );
}

function StarRating({ rating }) {
  return (
    <div className="mypage__stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`mypage__star${i <= rating ? " mypage__star--on" : ""}`}
        >
          {i <= rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function ProgressBar({ currentPage, totalPages }) {
  const total = totalPages || 1;
  const pct = Math.min(100, Math.round((currentPage / total) * 100));
  return (
    <div className="mypage__progress">
      <div className="mypage__progress__track">
        <div className="mypage__progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="mypage__progress__labels">
        <span>{pct}%</span>
        <span>
          {currentPage} / {totalPages}p
        </span>
      </div>
    </div>
  );
}

// ── 메인뷰 ──────────────────────────────────────────────────────────────────

function MainView({ onReport, onAccount, onLibrary, onMemo }) {
  const books = getBooksWithInfo();
  const countByStatus = (status) =>
    books.filter((b) => b.status === status).length;
  const nickname = localStorage.getItem("nickname") ?? "";
  const userId = localStorage.getItem("userId") ?? "";

  return (
    <div className="mypage mypage--main">
      <div className="mypage__header">
        <h1 className="mypage__header-title">마이</h1>
      </div>

      <div className="mypage__scroll-content">
        {/* ── 내 계정 ── */}
        <p className="mypage__section-label">내 계정</p>
        <button
          type="button"
          className="mypage__card mypage__card--account"
          onClick={onAccount}
        >
          <div className="mypage__avatar" aria-hidden="true" />
          <div className="mypage__card-info">
            <span className="mypage__user-name">{nickname || "닉네임"}</span>
            <span className="mypage__user-id">@{userId || "userId"}</span>
          </div>
          <span className="mypage__arrow">
            <ChevronRightIcon size={20} color="#8e8b7e" />
          </span>
        </button>

        {/* ── 내 기록 ── */}
        <p className="mypage__section-label">내 기록</p>
        <button
          type="button"
          className="mypage__card mypage__card--report"
          onClick={onReport}
        >
          <div className="mypage__card-report-text">
            <span className="mypage__report-title">이번 달 나의 이야기</span>
            <span className="mypage__report-sub">{CURRENT_MONTH}월 리포트</span>
          </div>
          <div className="mypage__char-bubbles" aria-hidden="true">
            <div className="mypage__char-bubble mypage__char-bubble--1" />
            <div className="mypage__char-bubble mypage__char-bubble--2" />
            <div className="mypage__char-bubble mypage__char-bubble--3" />
            <span className="mypage__char-more">+2</span>
          </div>
          <span className="mypage__arrow">
            <ChevronRightIcon size={20} color="#8e8b7e" />
          </span>
        </button>
        <button
          type="button"
          className="mypage__card mypage__card--memo"
          onClick={onMemo}
        >
          <div className="mypage__card-report-text">
            <span className="mypage__report-title">나의 메모</span>
            <span className="mypage__report-sub">지금까지의 메모</span>
          </div>
          <span className="mypage__arrow">
            <ChevronRightIcon size={20} color="#8e8b7e" />
          </span>
        </button>

        {/* ── 내 서재 ── */}
        <p className="mypage__section-label">내 서재</p>
        <div className="mypage__library-card">
          {LIBRARY_CATEGORIES.map((status, idx) => (
            <React.Fragment key={status}>
              {idx > 0 && <div className="mypage__library-divider" />}
              <button
                type="button"
                className="mypage__library-row"
                onClick={() => onLibrary(status)}
              >
                <span className="mypage__library-icon">
                  <LibraryRowIcon status={status} />
                </span>
                <span className="mypage__library-label">{status}</span>
                <span className="mypage__library-count">
                  {countByStatus(status)}권
                </span>
                <span className="mypage__arrow">
                  <ChevronRightIcon size={20} color="#8e8b7e" />
                </span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <BottomNav active="my" />
    </div>
  );
}

// ── 월 리포트 뷰 ─────────────────────────────────────────────────────────────

function ReportView({ onBack }) {
  return (
    <div className="mypage mypage--report">
      <div className="mypage__header">
        <BackButton onClick={onBack} />
        <h1 className="mypage__header-title">{CURRENT_MONTH}월 리포트</h1>
      </div>

      <div className="mypage__report-content">
        <p className="mypage__section-label">이 달 만난 캐릭터</p>
        <div className="mypage__char-area">
          <div className="mypage__char-row">
            <div className="mypage__char-bubble" />
            <div className="mypage__char-bubble" />
            <div className="mypage__char-bubble" />
          </div>
          <div className="mypage__char-row">
            <div className="mypage__char-bubble" />
            <div className="mypage__char-bubble" />
          </div>
        </div>

        <p className="mypage__section-label">자주 느낀 감정</p>
        <div className="mypage__emotion-row">
          {EMOTIONS.map((e) => (
            <Chip key={e} active={ACTIVE_EMOTIONS.has(e)}>
              {e}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 닉네임 변경 시트 ──────────────────────────────────────────────────────────

function NicknameSheet({ onClose, onSaved }) {
  const userId = Number(localStorage.getItem("userId"));
  const [value, setValue] = useState("");
  const [dupState, setDupState] = useState("idle"); // idle | checking | ok | error
  const [saving, setSaving] = useState(false);

  const hasInput = value.trim().length > 0;
  const isError = dupState === "error";

  const handleChange = (e) => {
    setValue(e.target.value);
    setDupState("idle");
  };

  const handleCheck = async () => {
    if (!hasInput) return;
    setDupState("checking");
    try {
      await checkNickname(value.trim());
      setDupState("ok");
    } catch {
      setDupState("error");
    }
  };

  const handleSave = async () => {
    if (dupState !== "ok") return;
    setSaving(true);
    try {
      await updateUser(userId, { nickname: value.trim() });
      localStorage.setItem("nickname", value.trim());
      onSaved(value.trim());
    } catch {
      setDupState("error");
    } finally {
      setSaving(false);
    }
  };

  const chipClass = [
    "mypage__sheet-chip",
    isError
      ? "mypage__sheet-chip--error"
      : hasInput
        ? "mypage__sheet-chip--active"
        : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="mypage__overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mypage__sheet">
        <div className="mypage__sheet-title-row">
          <p className="mypage__sheet-title">변경하기</p>
        </div>
        <div className="mypage__sheet-body">
          <div className={chipClass}>
            <input
              className="mypage__sheet-input"
              type="text"
              value={value}
              onChange={handleChange}
              placeholder="변경할 닉네임을 입력해주세요."
              maxLength={10}
              autoFocus
            />
            <button
              type="button"
              className={`mypage__sheet-dup${hasInput && !isError ? " mypage__sheet-dup--active" : ""}`}
              onClick={handleCheck}
              disabled={!hasInput || dupState === "checking"}
            >
              중복확인
            </button>
          </div>
          <p
            className={`mypage__sheet-hint${isError ? " mypage__sheet-hint--error" : dupState === "ok" ? " mypage__sheet-hint--ok" : ""}`}
          >
            {isError
              ? "사용할 수 없는 닉네임입니다."
              : dupState === "ok"
                ? "사용 가능한 닉네임입니다."
                : "3~10 사이의 한글, 영어, 소문자, 숫자로만 입력해주세요."}
          </p>
          <button
            type="button"
            className="mypage__sheet-save"
            onClick={handleSave}
            disabled={saving}
          >
            <span>{saving ? "저장 중..." : "저장하기"}</span>
            <img
              src="/assets/library/edit.svg"
              width="24"
              height="24"
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 로그아웃 모달 ─────────────────────────────────────────────────────────────

function LogoutModal({ onCancel, onConfirm }) {
  return (
    <div className="mypage__overlay mypage__overlay--center">
      <div className="mypage__logout-modal">
        <img
          className="mypage__logout-modal-icon"
          src="/assets/alert-02.svg"
          alt=""
          aria-hidden="true"
        />
        <h2 className="mypage__logout-modal-title">로그아웃</h2>
        <p className="mypage__logout-modal-sub">로그아웃 하시겠습니까?</p>
        <div className="mypage__logout-modal-btns">
          <button
            type="button"
            className="mypage__logout-modal-btn mypage__logout-modal-btn--cancel"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="mypage__logout-modal-btn mypage__logout-modal-btn--confirm"
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 계정 뷰 ──────────────────────────────────────────────────────────────────

function AccountView({ onBack }) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(
    localStorage.getItem("nickname") ?? "",
  );
  const [showSheet, setShowSheet] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") ?? null,
  );
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      localStorage.setItem("profileImage", dataUrl);
      setProfileImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="mypage mypage--account">
      <div className="mypage__header">
        <button type="button" className="mypage__back-text" onClick={onBack}>
          <ChevronLeftIcon size={18} color="#42403a" />
          <span>나가기</span>
        </button>
        <h1 className="mypage__header-title">내 계정</h1>
      </div>

      <div className="mypage__account-scroll">
        {/* 프로필 카드 */}
        <div className="mypage__profile-wrap">
          <div className="mypage__profile-card">
            <button
              type="button"
              className="mypage__profile-avatar"
              onClick={() => fileInputRef.current?.click()}
              aria-label="프로필 사진 변경"
            >
              <img
                src={profileImage ?? "/assets/prince-portrait.svg"}
                alt=""
                aria-hidden="true"
              />
              <div
                className="mypage__profile-avatar-overlay"
                aria-hidden="true"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="13"
                    r="4"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <p className="mypage__profile-name">{nickname || "닉네임"}</p>
            <button
              type="button"
              className="mypage__profile-edit-btn"
              onClick={() => setShowSheet(true)}
            >
              내 정보 수정
            </button>
          </div>
        </div>

        {/* 회원정보 카드 */}
        <div className="mypage__info-wrap">
          <div className="mypage__acct-info-card">
            <div className="mypage__acct-info-head">회원정보</div>
            <button
              type="button"
              className="mypage__acct-info-row"
              onClick={() => setShowSheet(true)}
            >
              <span className="mypage__acct-info-icon">
                <img
                  src="/assets/My/user.svg"
                  width="24"
                  height="24"
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <span className="mypage__acct-info-label">닉네임</span>
              <span className="mypage__acct-info-value">{nickname}</span>
              <ChevronRightIcon size={16} color="#5c5950" />
            </button>
            <div className="mypage__acct-info-row">
              <span className="mypage__acct-info-icon">
                <img
                  src="/assets/My/birth.svg"
                  width="24"
                  height="24"
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <span className="mypage__acct-info-label">생일</span>
              <ChevronRightIcon size={16} color="#5c5950" />
            </div>
            <div className="mypage__acct-info-row">
              <span className="mypage__acct-info-icon">
                <img
                  src="/assets/My/sex.svg"
                  width="24"
                  height="24"
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <span className="mypage__acct-info-label">성별</span>
              <ChevronRightIcon size={16} color="#5c5950" />
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="mypage__logout-wrap mypage__logout-wrap--bottom">
          <button
            type="button"
            className="mypage__acct-logout-btn"
            onClick={() => setShowLogout(true)}
          >
            <span>로그아웃</span>
            <img
              src="/assets/My/logout.svg"
              width="24"
              height="24"
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {showSheet && (
        <NicknameSheet
          onClose={() => setShowSheet(false)}
          onSaved={(name) => {
            setNickname(name);
            setShowSheet(false);
          }}
        />
      )}

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}

// ── 서재 카테고리 뷰 ──────────────────────────────────────────────────────────

function LibraryCategoryView({ initialCategory, onBack }) {
  const navigate = useNavigate();
  const allBooks = getBooksWithInfo();
  const [activeTab, setActiveTab] = useState(
    CATEGORY_TO_TAB[initialCategory] ?? "all",
  );

  const countOf = (status) =>
    allBooks.filter((b) => b.status === status).length;
  const counts = {
    all: allBooks.length,
    read: countOf("다 읽은 책"),
    reading: countOf("읽고 있는 책"),
    wishlist: countOf("찜한 책"),
  };

  const activeStatus = CAT_TABS.find((t) => t.id === activeTab)?.status;
  const books =
    activeTab === "all"
      ? allBooks
      : allBooks.filter((b) => b.status === activeStatus);

  return (
    <div className="mypage mypage--library">
      <div className="mypage__header">
        <BackButton onClick={onBack} />
        <h1 className="mypage__header-title">내 서재</h1>
      </div>

      <div className="mypage__cat-tabs">
        {CAT_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`mypage__cat-tab${activeTab === tab.id ? " mypage__cat-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      <div className="mypage__book-list">
        {books.length === 0 ? (
          <p className="mypage__empty">아직 책이 없어요.</p>
        ) : (
          books.map((book, idx) => {
            const pagesNum = parseInt(book.pages, 10) || 0;
            const dateText = book.startDate
              ? book.endDate
                ? `${book.startDate} ~ ${book.endDate}`
                : `${book.startDate} ~`
              : null;

            return (
              <React.Fragment key={book.id}>
                <button
                  type="button"
                  className="mypage__book-item"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  <img
                    className="mypage__book-cover"
                    src={book.cover}
                    alt={book.title}
                  />
                  <div className="mypage__book-info">
                    <p className="mypage__book-title">{book.title}</p>
                    {book.status === "다 읽은 책" && (
                      <StarRating rating={book.rating} />
                    )}
                    {book.status === "읽고 있는 책" && (
                      <ProgressBar
                        currentPage={book.currentPage}
                        totalPages={pagesNum}
                      />
                    )}
                    {dateText && (
                      <p className="mypage__book-date">{dateText}</p>
                    )}
                  </div>
                </button>
                {idx < books.length - 1 && (
                  <div className="mypage__book-divider" />
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── 루트 컴포넌트 ─────────────────────────────────────────────────────────────

export default function MyPage() {
  const [view, setView] = useState("main");
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (view === "report") return <ReportView onBack={() => setView("main")} />;
  if (view === "account") return <AccountView onBack={() => setView("main")} />;
  if (view === "library")
    return (
      <LibraryCategoryView
        initialCategory={selectedCategory}
        onBack={() => setView("main")}
      />
    );
  return (
    <MainView
      onReport={() => setView("report")}
      onAccount={() => setView("account")}
      onLibrary={(category) => {
        setSelectedCategory(category);
        setView("library");
      }}
      onMemo={() => {}}
    />
  );
}
