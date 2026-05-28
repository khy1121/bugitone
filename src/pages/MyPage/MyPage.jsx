import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/common/BottomNav/BottomNav";
import Chip from "../../components/common/Chip/Chip";
import DuplicateCheckButton from "../../components/common/DuplicateCheckButton/DuplicateCheckButton";
import { mockBooks } from "../../data/mockBooks";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  LibraryCheckIcon,
  LibraryExcIcon,
} from "../../assets/icons";
import libraryBannerImage from "../../assets/banner.svg";
import { ROUTES } from "../../constants/routes";
import {
  getUserProfile,
  updateUser,
  updateProfileImage,
  checkNickname,
  deleteAccount,
} from "../../api/userApi";
import { getAllMemos, getMyBooks } from "../../api/bookApi";
import {
  getMonthlyCharacters,
  getMonthlyEmotions,
} from "../../api/emotionApi";
import useKeyboardAwareInput from "../../hooks/useKeyboardAwareInput";
import {
  NICKNAME_RULE_MESSAGE,
  isValidNickname,
} from "../../utils/nicknameValidation";
import { resolveRemoteAssetUrl } from "../../utils/resolveAssetUrl";
import { clearAuthStorage } from "../../utils/authStorage";
import InstallGuidePage from "../InstallGuidePage/InstallGuidePage";
import "./MyPage.scss";

const CURRENT_MONTH = new Date().getMonth() + 1;
const LIBRARY_CATEGORIES = ["다 읽은 책", "읽고 있는 책", "찜한 책"];

const CAT_TABS = [
  { id: "all", label: "전체", status: null },
  { id: "read", label: "다 읽은 책", status: "다 읽은 책" },
  { id: "reading", label: "읽고 있는 책", status: "읽고 있는 책" },
  { id: "wishlist", label: "찜한 책", status: "찜한 책" },
];

const CATEGORY_TO_TAB = {
  "다 읽은 책": "read",
  "읽고 있는 책": "reading",
  "찜한 책": "wishlist",
};

const FALLBACK_BOOK_COVER = "/assets/library/book.svg";
const ALERT_CIRCLE_SRC = "/assets/character/alert-circle.svg";
const DEFAULT_CHARACTER_IMAGE = "/assets/character/LittlePrince.svg";
const DEFAULT_BIRTHDAY = "2002.03.21";
const PROFILE_IMAGE_MAX_DIMENSION = 1024;
const PROFILE_IMAGE_QUALITY = 0.86;
const PROFILE_IMAGE_CACHE_PREFIX = "profileImage:";
const GENDER_OPTIONS = [
  { value: "Male", label: "남자", display: "남" },
  { value: "Female", label: "여자", display: "여" },
];

function normalizeGender(value) {
  const text = `${value ?? ""}`.trim();
  const lower = text.toLowerCase();

  if (["male", "m", "남", "남자"].includes(lower)) return "Male";
  if (["female", "f", "여", "여자"].includes(lower)) return "Female";
  return "";
}

function getGenderOption(value) {
  const normalized = normalizeGender(value);
  return GENDER_OPTIONS.find((option) => option.value === normalized);
}

function getGenderDisplay(value) {
  return getGenderOption(value)?.display ?? "";
}

function parseBirthday(value) {
  const match = `${value || DEFAULT_BIRTHDAY}`.match(
    /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/,
  );

  if (!match) {
    return { year: 2002, month: 3, day: 21 };
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function formatBirthday({ year, month, day }) {
  const pad = (num) => `${num}`.padStart(2, "0");
  return `${year}.${pad(month)}.${pad(day)}`;
}

function formatBirthdayForApi({ year, month, day }) {
  const pad = (num) => `${num}`.padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

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

function normalizeLibraryStatus(status) {
  const text = `${status ?? ""}`;
  const upperText = text.toUpperCase();

  if (
    text.includes("찜") ||
    ["WISHLIST", "WISH", "FAVORITE"].includes(upperText)
  ) {
    return "찜한 책";
  }

  if (text.includes("읽고") || upperText === "READING") {
    return "읽고 있는 책";
  }

  if (
    ["DONE", "COMPLETED", "FINISHED"].includes(upperText) ||
    text.includes("다 읽")
  ) {
    return "다 읽은 책";
  }

  return text || "읽고 있는 책";
}

function normalizeLibraryDate(value) {
  if (!value) return "";
  return `${value}`.slice(0, 10).replace(/-/g, ".");
}

function getExistingValue(source, keys) {
  const existingKey = keys.find((key) =>
    Object.prototype.hasOwnProperty.call(source, key),
  );

  return existingKey ? source[existingKey] : undefined;
}

function normalizeUserProfile(data, fallback = {}) {
  const source = data?.user ?? data ?? {};
  const sourceBirthday = getExistingValue(source, ["birthday", "birthDay", "birthdate"]);
  const sourceGender = getExistingValue(source, ["gender", "Gender"]);
  const sourceProfileImage = getExistingValue(source, [
    "profileImgUrl",
    "profileImageUrl",
    "profileImage",
  ]);
  const shouldPreferSource = Boolean(fallback.preferSource);
  const hasSourceBirthday =
    sourceBirthday !== undefined && (shouldPreferSource || sourceBirthday != null);
  const hasSourceGender =
    sourceGender !== undefined && (shouldPreferSource || sourceGender != null);
  const hasSourceProfileImage =
    sourceProfileImage !== undefined &&
    (shouldPreferSource || Boolean(sourceProfileImage));
  const birthday = normalizeLibraryDate(
    hasSourceBirthday
      ? sourceBirthday
      : fallback.birthday ?? localStorage.getItem("birthday"),
  );
  const gender = normalizeGender(
    hasSourceGender
      ? sourceGender
      : fallback.gender ?? localStorage.getItem("gender"),
  );
  const profileImageSource = hasSourceProfileImage
    ? sourceProfileImage
    : fallback.profileImage ?? localStorage.getItem("profileImage");

  return {
    userId: source.userId ?? source.id ?? fallback.userId ?? getCurrentUserId(),
    email: source.email ?? fallback.email ?? localStorage.getItem("email") ?? "",
    nickname: source.nickname ?? fallback.nickname ?? localStorage.getItem("nickname") ?? "",
    gender,
    birthday,
    profileImage: resolveRemoteAssetUrl(profileImageSource, ""),
  };
}

function syncStoredUserProfile(data, fallback = {}) {
  const profile = normalizeUserProfile(data, fallback);

  if (profile.userId) localStorage.setItem("userId", String(profile.userId));
  localStorage.setItem("email", profile.email || "");
  localStorage.setItem("nickname", profile.nickname || "");
  localStorage.setItem("gender", profile.gender || "");
  localStorage.setItem("birthday", profile.birthday || "");
  localStorage.setItem("profileImage", profile.profileImage || "");
  if (profile.userId) {
    const profileImageCacheKey = `${PROFILE_IMAGE_CACHE_PREFIX}${profile.userId}`;

    if (profile.profileImage) {
      localStorage.setItem(profileImageCacheKey, profile.profileImage);
    } else if (fallback.preferSource) {
      localStorage.removeItem(profileImageCacheKey);
    }
  }

  return profile;
}

function getStoredProfileSnapshot() {
  const userId = getCurrentUserId();
  const cachedProfileImage = userId
    ? localStorage.getItem(`${PROFILE_IMAGE_CACHE_PREFIX}${userId}`)
    : "";

  return {
    userId,
    email: localStorage.getItem("email") ?? "",
    nickname: localStorage.getItem("nickname") ?? "",
    birthday: localStorage.getItem("birthday") ?? "",
    gender: normalizeGender(localStorage.getItem("gender")),
    profileImage: localStorage.getItem("profileImage") || cachedProfileImage || null,
  };
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("지원하지 않는 이미지 형식입니다."));
    };
    image.src = imageUrl;
  });
}

async function prepareProfileImageFile(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const image = await loadImageFile(file);
  const scale = Math.min(
    1,
    PROFILE_IMAGE_MAX_DIMENSION / image.width,
    PROFILE_IMAGE_MAX_DIMENSION / image.height,
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", PROFILE_IMAGE_QUALITY);
  });

  if (!blob) {
    throw new Error("이미지 파일을 처리하지 못했습니다.");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "profile";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

async function updateStoredUserProfile(userId, patch) {
  const data = await updateUser(userId, patch);
  return syncStoredUserProfile(data, { userId, ...patch });
}

async function updateStoredProfileImage(userId, file) {
  const data = await updateProfileImage(userId, file);
  return syncStoredUserProfile(data, { userId });
}

async function fetchAndSyncUserProfile(userId) {
  const data = await getUserProfile(userId);
  return syncStoredUserProfile(data, { userId, preferSource: true });
}

function toLibraryBookArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.books)) return data.books;
  if (Array.isArray(data?.bookList)) return data.bookList;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.mainStudies)) return data.mainStudies;
  return [];
}

function toMemoArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.memos)) return data.memos;
  if (Array.isArray(data?.memoList)) return data.memoList;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function parseBookPageCount(value) {
  return Number.parseInt(`${value || ""}`.replace(/[^0-9]/g, ""), 10) || 0;
}

function normalizeLibraryBook(raw) {
  const book = raw?.book ?? raw;
  const original = raw?.raw?.book ?? raw?.raw ?? {};
  const isbn =
    book?.isbn13 ?? book?.isbn ?? raw?.isbn13 ?? raw?.isbn ?? original?.isbn13 ?? original?.isbn;
  const id =
    raw?.mainId ??
    raw?.mainStudyId ??
    raw?.main_id ??
    raw?.bookId ??
    raw?.book_id ??
    raw?.id ??
    book?.id ??
    isbn;
  const pages =
    book?.pageCount ??
    book?.page_count ??
    book?.pages ??
    book?.page ??
    raw?.pageCount ??
    raw?.page_count ??
    raw?.pages ??
    raw?.page ??
    original?.pageCount ??
    original?.page_count ??
    original?.pages ??
    original?.page ??
    "";

  return {
    id,
    mainId: raw?.mainId ?? raw?.mainStudyId ?? raw?.main_id ?? book?.mainId ?? null,
    bookId: raw?.bookId ?? raw?.book_id ?? book?.bookId ?? book?.book_id ?? null,
    isbn,
    title: book?.title ?? raw?.title ?? original?.title ?? "제목 없음",
    author: book?.author ?? raw?.author ?? original?.author ?? "",
    publisher: book?.publisher ?? raw?.publisher ?? original?.publisher ?? "",
    category:
      book?.categoryName ??
      book?.category ??
      raw?.categoryName ??
      raw?.category ??
      original?.categoryName ??
      original?.category ??
      "",
    cover:
      book?.coverUrl ??
      book?.cover_url ??
      book?.cover ??
      book?.coverImage ??
      book?.thumbnail ??
      raw?.coverUrl ??
      raw?.cover_url ??
      raw?.cover ??
      raw?.coverImage ??
      raw?.thumbnail ??
      original?.coverUrl ??
      original?.cover_url ??
      original?.cover ??
      original?.coverImage ??
      original?.thumbnail ??
      FALLBACK_BOOK_COVER,
    status: normalizeLibraryStatus(
      raw?.readingStatus ??
        raw?.reading_status ??
        raw?.status ??
        book?.readingStatus ??
        book?.status ??
        original?.readingStatus ??
        original?.status,
    ),
    startDate: normalizeLibraryDate(
      raw?.startDate ??
        raw?.startedAt ??
        raw?.readStartDate ??
        book?.startDate ??
        original?.startDate,
    ),
    endDate: normalizeLibraryDate(
      raw?.endDate ??
        raw?.finishedAt ??
        raw?.readEndDate ??
        book?.endDate ??
        original?.endDate,
    ),
    pages,
    currentPage:
      raw?.currentPage ??
      raw?.current_page ??
      raw?.readPage ??
      raw?.read_page ??
      book?.currentPage ??
      book?.current_page ??
      0,
    raw,
  };
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, "") : "";
}

function normalizeMemoSummary(raw) {
  const memo = raw?.memo ?? raw ?? {};
  const memoId =
    memo.memoId ??
    memo.memo_id ??
    memo.id ??
    raw?.memoId ??
    raw?.memo_id ??
    raw?.id;
  const date =
    normalizeLibraryDate(memo.updatedAt ?? memo.updated_at ?? raw?.updatedAt ?? raw?.updated_at) ||
    normalizeLibraryDate(memo.createdAt ?? memo.created_at ?? raw?.createdAt ?? raw?.created_at) ||
    normalizeLibraryDate(memo.date ?? raw?.date);

  return {
    ...memo,
    id: memoId,
    memoId,
    title: memo.title ?? memo.memoTitle ?? memo.memo_title ?? raw?.title ?? "제목 없음",
    content:
      memo.content ??
      memo.memoContent ??
      memo.memo_content ??
      raw?.content ??
      raw?.memoContent ??
      raw?.memo_content ??
      "",
    date,
    createdAt: memo.createdAt ?? memo.created_at ?? raw?.createdAt ?? raw?.created_at,
    updatedAt: memo.updatedAt ?? memo.updated_at ?? raw?.updatedAt ?? raw?.updated_at,
  };
}

function getMemoTitle(memo) {
  return (
    memo?.title ||
    stripHtml(memo?.content)
      .split(/\r?\n/)
      .find(Boolean) ||
    "제목 없음"
  );
}

function getBooksWithMemos() {
  return mockBooks
    .map((book) => {
      try {
        const raw = localStorage.getItem(`memos_${book.id}`);
        const memos = raw ? JSON.parse(raw) : [];
        return { ...book, memos: Array.isArray(memos) ? memos : [] };
      } catch {
        return { ...book, memos: [] };
      }
    })
    .filter((book) => book.memos.length > 0);
}

function getCurrentUserId() {
  const userId = Number(localStorage.getItem("userId"));
  return Number.isFinite(userId) && userId > 0 ? userId : null;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function normalizeMonthlyCharacters(value) {
  const rawCharacters = Array.isArray(value)
    ? value
    : Array.isArray(value?.characters)
      ? value.characters
      : [];

  return rawCharacters
    .filter(Boolean)
    .map((character, index) => ({
      characterId:
        character.characterId ??
        character.id ??
        `${character.characterName ?? "character"}-${index}`,
      characterName: character.characterName || character.name || "이름 없는 캐릭터",
      author: character.author || "",
      characterImgUrl: resolveRemoteAssetUrl(
        character.characterImgUrl || character.imageUrl || character.image,
        DEFAULT_CHARACTER_IMAGE,
      ),
      bookQuote: character.bookQuote || "",
      methodReason: character.methodReason || "",
    }));
}

function extractMonthlyEmotionValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap(extractMonthlyEmotionValues);
  }

  if (value && typeof value === "object") {
    return extractMonthlyEmotionValues(
      value.emotions ??
        value.emotionTags ??
        value.emotionTag ??
        value.emotion ??
        value.name ??
        value.tag ??
        "",
    );
  }

  return `${value ?? ""}`
    .split(/[,，]/)
    .map((emotion) => emotion.replace(/^#+\s*/, "").trim())
    .filter(Boolean);
}

function normalizeMonthlyEmotions(value) {
  const emotions = extractMonthlyEmotionValues(value);
  const emotionCounts = new Map();

  emotions.forEach((emotion, index) => {
    const previous = emotionCounts.get(emotion);

    emotionCounts.set(emotion, {
      count: (previous?.count ?? 0) + 1,
      firstIndex: previous?.firstIndex ?? index,
    });
  });

  return [...emotionCounts.entries()]
    .sort(([, a], [, b]) => b.count - a.count || a.firstIndex - b.firstIndex)
    .map(([emotion]) => emotion)
    .slice(0, 3);
}

// ── 계정 뷰 아이콘 (SVG 파일 참조) ─────────────────────────────────────────

function ProfileAvatar({ image, size = "sm", editable = false }) {
  const className = [
    "mypage__profile-image",
    `mypage__profile-image--${size}`,
    image ? "mypage__profile-image--custom" : "",
    editable ? "mypage__profile-image--editable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className}>
      <img
        src={image || "/assets/prince-portrait.svg"}
        onError={handleProfileImageError}
        alt=""
        aria-hidden="true"
      />
      {editable && (
        <span className="mypage__profile-image-overlay" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="1.5" />
          </svg>
        </span>
      )}
    </span>
  );
}

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
          strokeWidth="1.3"
        />
        <path
          d="M8 12.5L10.5 15L16 9"
          stroke="#282723"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
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
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1816 8.18188V12.6819"
          stroke="#282723"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1816 16.1699V16.1799"
          stroke="#282723"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1816 8.18188V12.6819"
          stroke="#282723"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1816 16.1699V16.1799"
          stroke="#282723"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
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

// ── 메인뷰 ──────────────────────────────────────────────────────────────────

function handleProfileImageError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = "/assets/prince-portrait.svg";
}

function MainView({
  profile = getStoredProfileSnapshot(),
  libraryBooks = [],
  libraryLoading,
  libraryError,
  onReport,
  onAccount,
  onLibrary,
  onMemo,
  onInstallGuide,
}) {
  const books = libraryBooks;
  const countByStatus = (status) =>
    books.filter((b) => b.status === status).length;
  const nickname = profile.nickname ?? "";
  const userId = profile.userId ? String(profile.userId) : "";
  const email = profile.email ?? "";
  const profileImage = profile.profileImage || null;
  const [reportCharacters, setReportCharacters] = useState([]);
  const previewCharacters = reportCharacters.slice(0, 2);
  const extraCharacterCount = Math.max(
    reportCharacters.length - previewCharacters.length,
    0,
  );

  useEffect(() => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setReportCharacters([]);
      return undefined;
    }

    let cancelled = false;

    getMonthlyCharacters(currentUserId)
      .then((data) => {
        if (cancelled) return;
        setReportCharacters(normalizeMonthlyCharacters(data));
      })
      .catch(() => {
        if (!cancelled) setReportCharacters([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReportCharacterImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_CHARACTER_IMAGE;
  };

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
          <ProfileAvatar image={profileImage} size="sm" />
          <div className="mypage__card-info">
            <span className="mypage__user-name">{nickname || "닉네임"}</span>
            <span className="mypage__user-id">
              {email || userId || "userId"}
            </span>
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
          {previewCharacters.length > 0 && (
            <div className="mypage__char-bubbles" aria-hidden="true">
              {previewCharacters.map((character) => (
                <span
                  key={character.characterId}
                  className="mypage__char-bubble"
                >
                  <img
                    src={character.characterImgUrl}
                    alt=""
                    onError={handleReportCharacterImageError}
                  />
                </span>
              ))}
              {extraCharacterCount > 0 && (
                <span className="mypage__char-more">
                  +{extraCharacterCount}
                </span>
              )}
            </div>
          )}
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
                  {libraryLoading ? "..." : `${countByStatus(status)}권`}
                </span>
                <span className="mypage__arrow">
                  <ChevronRightIcon size={20} color="#8e8b7e" />
                </span>
              </button>
            </React.Fragment>
          ))}
        </div>
        {libraryError && (
          <p className="mypage__api-error">{libraryError}</p>
        )}

        <button
          type="button"
          className="mypage__install-entry"
          onClick={onInstallGuide}
        >
          <span className="mypage__install-entry-mark" aria-hidden="true">
            PWA
          </span>
          <span className="mypage__install-entry-text">
            <span className="mypage__install-entry-title">앱 설치 방법</span>
            <span className="mypage__install-entry-sub">
              안드로이드, iOS, 데스크탑 순서 안내
            </span>
          </span>
          <span className="mypage__arrow">
            <ChevronRightIcon size={20} color="#8e8b7e" />
          </span>
        </button>
      </div>

      <BottomNav active="my" />
    </div>
  );
}

// ── 월 리포트 뷰 ─────────────────────────────────────────────────────────────

function ReportCharacterCard({ character, index, onOpen }) {
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_CHARACTER_IMAGE;
  };

  return (
    <article
      className={`mypage__report-character mypage__report-character--${(index % 3) + 1}`}
    >
      <div className="mypage__report-character-media">
        <img
          src={character.characterImgUrl}
          alt=""
          aria-hidden="true"
          onError={handleImageError}
        />
      </div>
      <div className="mypage__report-character-body">
        <h2>{character.characterName}
          {character.author ? <p>{character.author}</p> : <p>루이스 캐럴</p>}
        </h2>
        <button type="button" onClick={() => onOpen(character)}>
          보러가기
        </button>
      </div>
    </article>
  );
}

function ReportView({ onBack }) {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("nickname") || "김수현";
  const [characters, setCharacters] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const userId = getCurrentUserId();

    if (!userId) {
      setLoading(false);
      setApiError("로그인 후 리포트를 확인할 수 있어요.");
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setApiError("");

    Promise.allSettled([
      getMonthlyCharacters(userId),
      getMonthlyEmotions(userId),
    ])
      .then(([characterResult, emotionResult]) => {
        if (cancelled) return;

        if (characterResult.status === "fulfilled") {
          setCharacters(normalizeMonthlyCharacters(characterResult.value));
        }

        if (emotionResult.status === "fulfilled") {
          setEmotions(normalizeMonthlyEmotions(emotionResult.value));
        }

        if (
          characterResult.status === "rejected" &&
          emotionResult.status === "rejected"
        ) {
          setApiError(
            characterResult.reason?.message ||
              emotionResult.reason?.message ||
              "이번 달 리포트를 불러오지 못했어요.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenCharacter = (character) => {
    navigate(ROUTES.RESULT, {
      state: {
        loading: false,
        userName: displayName,
        emotions,
        returnTo: ROUTES.MYPAGE,
        analysis: { character },
      },
    });
  };

  return (
    <div className="mypage mypage--report">
      <div className="mypage__header">
        <BackButton onClick={onBack} />
        <h1 className="mypage__header-title">{CURRENT_MONTH}월 리포트</h1>
      </div>

      <div className="mypage__report-content">
        <section className="mypage__report-section">
          <h2 className="mypage__report-section-title">이 달 만난 캐릭터</h2>
          {loading ? (
            <p className="mypage__report-empty">캐릭터를 불러오는 중이에요.</p>
          ) : characters.length > 0 ? (
            <div className="mypage__report-character-list">
              {characters.map((character, index) => (
                <ReportCharacterCard
                  key={character.characterId}
                  character={character}
                  index={index}
                  onOpen={handleOpenCharacter}
                />
              ))}
            </div>
          ) : (
            <p className="mypage__report-empty">
              이번 달 만난 캐릭터가 아직 없어요.
            </p>
          )}
        </section>

        <section className="mypage__report-emotion-card">
          <h2>{displayName}님이 자주 느낀 감정</h2>
          {loading ? (
            <p className="mypage__report-empty mypage__report-empty--in-card">
              감정을 불러오는 중이에요.
            </p>
          ) : emotions.length > 0 ? (
            <div className="mypage__report-emotions">
              {emotions.map((emotion) => (
                <span key={emotion} className="mypage__report-emotion">
                  # {emotion}
                </span>
              ))}
            </div>
          ) : (
            <p className="mypage__report-empty mypage__report-empty--in-card">
              아직 기록된 감정이 없어요.
            </p>
          )}
        </section>

        {apiError && (
          <p className="mypage__api-error mypage__api-error--report">
            {apiError}
          </p>
        )}
      </div>
    </div>
  );
}

// ── 닉네임 변경 시트 ──────────────────────────────────────────────────────────

function NicknameSheet({ onClose, onSaved }) {
  const userId = Number(localStorage.getItem("userId"));
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const [dupState, setDupState] = useState("idle"); // idle | checking | ok | error
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const hasInput = value.trim().length > 0;
  const isFormatError = hasInput && !isValidNickname(value);
  const isError = dupState === "error" || isFormatError || Boolean(apiError);
  const canCheck = hasInput && !isFormatError && dupState !== "checking";
  const keyboard = useKeyboardAwareInput();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleChange = (e) => {
    setValue(e.target.value);
    setDupState("idle");
    setApiError("");
  };

  const handleCheck = async () => {
    if (!canCheck) return;
    setDupState("checking");
    setApiError("");
    try {
      await checkNickname(value.trim());
      setDupState("ok");
    } catch (error) {
      setDupState("error");
      setApiError(error?.message ?? "");
    }
  };

  const handleSave = async () => {
    if (dupState !== "ok") return;
    if (!userId) {
      setDupState("error");
      setApiError("로그인 정보가 없습니다.");
      return;
    }

    setSaving(true);
    setApiError("");

    try {
      const profile = await updateStoredUserProfile(userId, { nickname: value.trim() });
      onSaved(profile);
    } catch (error) {
      setDupState("error");
      setApiError(error?.message ?? "회원 정보 수정에 실패했습니다.");
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
      <div
        className={`mypage__sheet${
          keyboard.isKeyboardFocused ? " mypage__sheet--keyboard" : ""
        }`}
      >
        <div className="mypage__sheet-title-row">
          <p className="mypage__sheet-title">변경하기</p>
        </div>
        <div className="mypage__sheet-body">
          <div className={chipClass}>
            <input
              ref={inputRef}
              className="mypage__sheet-input"
              type="text"
              value={value}
              onChange={handleChange}
              onFocus={keyboard.handleFocus}
              onBlur={keyboard.handleBlur}
              placeholder="변경할 닉네임을 입력해주세요."
              maxLength={10}
            />
            <DuplicateCheckButton
              className="mypage__sheet-dup"
              active={canCheck}
              checking={dupState === "checking"}
              onClick={handleCheck}
              disabled={!canCheck}
            />
          </div>
          <p
            className={`mypage__sheet-hint${isError ? " mypage__sheet-hint--error" : dupState === "ok" ? " mypage__sheet-hint--ok" : ""}`}
          >
            {isFormatError
              ? NICKNAME_RULE_MESSAGE
              : dupState === "error"
                ? "사용할 수 없는 닉네임입니다."
              : dupState === "ok"
                ? "사용 가능한 닉네임입니다."
                : NICKNAME_RULE_MESSAGE}
          </p>
          {apiError && (
            <p className="mypage__sheet-hint mypage__sheet-hint--error">
              {apiError}
            </p>
          )}
          <button
            type="button"
            className="mypage__sheet-save"
            onClick={handleSave}
            disabled={saving}
          >
            <img
              src="/assets/library/edit.svg"
              width="24"
              height="24"
              alt=""
              aria-hidden="true"
            />
            <span>{saving ? "저장 중..." : "저장하기"}</span>
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

function DeleteAccountModal({
  error = "",
  confirming = false,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="mypage__overlay mypage__overlay--center">
      <div className="mypage__logout-modal">
        <img
          className="mypage__logout-modal-icon"
          src="/assets/alert-02.svg"
          alt=""
          aria-hidden="true"
        />
        <h2 className="mypage__logout-modal-title">회원탈퇴</h2>
        <p
          className={`mypage__logout-modal-sub${
            error ? " mypage__logout-modal-sub--error" : ""
          }`}
        >
          {error || "회원탈퇴 하시겠습니까?"}
        </p>
        <div className="mypage__logout-modal-btns">
          <button
            type="button"
            className="mypage__logout-modal-btn mypage__logout-modal-btn--cancel"
            onClick={onCancel}
            disabled={confirming}
          >
            취소
          </button>
          <button
            type="button"
            className="mypage__logout-modal-btn mypage__logout-modal-btn--confirm"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? "탈퇴 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileConfirmModal({
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  confirming = false,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="mypage__overlay mypage__overlay--center">
      <div className="mypage__confirm-modal">
        <img
          className="mypage__confirm-modal-icon"
          src={ALERT_CIRCLE_SRC}
          alt=""
          aria-hidden="true"
        />
        <h2 className="mypage__confirm-modal-title">{title}</h2>
        <p className="mypage__confirm-modal-sub">{description}</p>
        <div className="mypage__confirm-modal-actions">
          <button
            type="button"
            className="mypage__confirm-modal-btn mypage__confirm-modal-btn--cancel"
            onClick={onCancel}
            disabled={confirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="mypage__confirm-modal-btn mypage__confirm-modal-btn--confirm"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? "저장 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function GenderSheet({ value, onChange, onClose, onSave }) {
  const selectedGender = normalizeGender(value) || "Male";

  return (
    <div
      className="mypage__overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mypage__gender-sheet">
        <div className="mypage__gender-sheet-head">
          <p className="mypage__gender-sheet-title">성별</p>
        </div>
        <div className="mypage__gender-options">
          {GENDER_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              type="button"
              selected={selectedGender === option.value}
              className="mypage__gender-option"
              onClick={() => onChange(option.value)}
            >
              <span>{option.label}</span>
              <span
                className="mypage__gender-option-check"
                aria-hidden="true"
              />
            </Chip>
          ))}
        </div>
        <button type="button" className="mypage__gender-save" onClick={onSave}>
          저장하기
        </button>
      </div>
    </div>
  );
}

function BirthdayEditor({ value, onBack, onSave }) {
  const initial = parseBirthday(value);
  const userId = Number(localStorage.getItem("userId"));
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1919 },
    (_, index) => currentYear - index,
  );
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const days = Array.from(
    { length: getDaysInMonth(year, month) },
    (_, index) => index + 1,
  );

  useEffect(() => {
    const maxDay = getDaysInMonth(year, month);
    if (day > maxDay) setDay(maxDay);
  }, [year, month, day]);

  const handleSave = async () => {
    const birthday = formatBirthday({ year, month, day });
    const birthdayForApi = formatBirthdayForApi({ year, month, day });
    if (!userId) {
      setApiError("로그인 정보가 없습니다.");
      return;
    }

    setSaving(true);
    setApiError("");

    try {
      const profile = await updateStoredUserProfile(userId, { birthday: birthdayForApi });
      onSave(profile);
    } catch (error) {
      setApiError(error?.message ?? "회원 정보 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mypage mypage--birthday">
      <div className="mypage__header">
        <button type="button" className="mypage__back-text" onClick={onBack}>
          <ChevronLeftIcon size={18} color="#42403a" />
          <span>나가기</span>
        </button>
        <h1 className="mypage__header-title">생년월일</h1>
      </div>

      <div className="mypage__birthday-content">
        <div className="mypage__birthday-picker" aria-label="생년월일 선택">
          <label className="mypage__birthday-column">
            <span className="sr-only">년도</span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}년
                </option>
              ))}
            </select>
          </label>
          <label className="mypage__birthday-column">
            <span className="sr-only">월</span>
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              {months.map((item) => (
                <option key={item} value={item}>
                  {item}월
                </option>
              ))}
            </select>
          </label>
          <label className="mypage__birthday-column">
            <span className="sr-only">일</span>
            <select
              value={day}
              onChange={(event) => setDay(Number(event.target.value))}
            >
              {days.map((item) => (
                <option key={item} value={item}>
                  {item}일
                </option>
              ))}
            </select>
          </label>
        </div>
        {apiError && (
          <p className="mypage__api-error">{apiError}</p>
        )}
        <button
          type="button"
          className="mypage__birthday-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "수정 중..." : "수정하기"}
        </button>
      </div>
    </div>
  );
}

// ── 계정 뷰 ──────────────────────────────────────────────────────────────────

function AccountView({
  profile = getStoredProfileSnapshot(),
  onBack,
  onProfileChange = () => {},
}) {
  const navigate = useNavigate();
  const email = profile.email || (profile.userId ? String(profile.userId) : "");
  const userId = profile.userId;
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [birthday, setBirthday] = useState(profile.birthday ?? "");
  const [gender, setGender] = useState(normalizeGender(profile.gender));
  const [pendingGender, setPendingGender] = useState(
    normalizeGender(profile.gender) || "Male",
  );
  const [showSheet, setShowSheet] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [showGenderConfirm, setShowGenderConfirm] = useState(false);
  const [showBirthdayEditor, setShowBirthdayEditor] = useState(false);
  const [savingGender, setSavingGender] = useState(false);
  const [genderError, setGenderError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [profileImage, setProfileImage] = useState(profile.profileImage || null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [profileImageError, setProfileImageError] = useState("");
  const [nicknameCopyMessage, setNicknameCopyMessage] = useState("");
  const fileInputRef = useRef(null);

  const setLocalProfile = (nextProfile) => {
    const nextGender = normalizeGender(nextProfile.gender);

    setNickname(nextProfile.nickname ?? "");
    setBirthday(nextProfile.birthday ?? "");
    setGender(nextGender);
    setPendingGender(nextGender || "Male");
    setProfileImage(nextProfile.profileImage || null);
  };

  const applyProfile = (nextProfile) => {
    setLocalProfile(nextProfile);
    onProfileChange(nextProfile);
  };

  useEffect(() => {
    setLocalProfile(profile);
  }, [
    profile.userId,
    profile.email,
    profile.nickname,
    profile.birthday,
    profile.gender,
    profile.profileImage,
  ]);

  const handleLogout = () => {
    clearAuthStorage();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const openDeleteAccountConfirm = () => {
    setDeleteAccountError("");
    setShowDeleteAccount(true);
  };

  const closeDeleteAccountConfirm = () => {
    if (deletingAccount) return;
    setDeleteAccountError("");
    setShowDeleteAccount(false);
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      setDeleteAccountError("로그인 정보가 없습니다.");
      return;
    }

    setDeletingAccount(true);
    setDeleteAccountError("");

    try {
      await deleteAccount(userId);
      clearAuthStorage();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      setDeleteAccountError(error?.message ?? "회원 탈퇴에 실패했습니다.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!userId) {
      setProfileImageError("로그인 정보가 없습니다.");
      return;
    }

    setUploadingProfileImage(true);
    setProfileImageError("");

    try {
      const uploadFile = await prepareProfileImageFile(file);
      const profile = await updateStoredProfileImage(userId, uploadFile);
      applyProfile(profile);
    } catch (error) {
      setProfileImageError(error?.message ?? "프로필 사진 수정에 실패했습니다.");
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const openGenderSheet = () => {
    setPendingGender(gender || "Male");
    setGenderError("");
    setShowGenderSheet(true);
  };

  const handleGenderConfirm = async () => {
    if (!userId) {
      setGenderError("로그인 정보가 없습니다.");
      return;
    }

    setSavingGender(true);
    setGenderError("");

    try {
      const profile = await updateStoredUserProfile(userId, { gender: pendingGender });
      applyProfile(profile);
      setShowGenderConfirm(false);
      setShowGenderSheet(false);
    } catch (error) {
      setGenderError(error?.message ?? "회원 정보 수정에 실패했습니다.");
    } finally {
      setSavingGender(false);
    }
  };

  const handleCopyNickname = async () => {
    const text = (nickname || "닉네임").trim();
    if (!text) return;

    try {
      await copyTextToClipboard(text);
      setNicknameCopyMessage("닉네임이 복사됐어요.");
    } catch {
      setNicknameCopyMessage("닉네임 복사에 실패했어요.");
    }
  };

  useEffect(() => {
    if (!nicknameCopyMessage) return undefined;

    const timer = window.setTimeout(() => {
      setNicknameCopyMessage("");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [nicknameCopyMessage]);

  if (showBirthdayEditor) {
    return (
        <BirthdayEditor
          value={birthday}
          onBack={() => setShowBirthdayEditor(false)}
          onSave={(nextProfile) => {
            applyProfile(nextProfile);
            setShowBirthdayEditor(false);
          }}
        />
    );
  }

  return (
    <div
      className={`mypage mypage--account${
        isEditing ? " mypage--account-edit" : ""
      }`}
    >
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
              className={`mypage__profile-avatar${
                profileImage ? " mypage__profile-avatar--custom" : ""
              }`}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingProfileImage}
              aria-label="프로필 사진 변경"
            >
              <img
                src={profileImage || "/assets/prince-portrait.svg"}
                onError={handleProfileImageError}
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
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            {isEditing ? (
              <button
                type="button"
                className="mypage__profile-name mypage__profile-name-button mypage__profile-name-pill"
                onClick={() => setShowSheet(true)}
              >
                {nickname || "닉네임"}
              </button>
            ) : (
              <button
                type="button"
                className="mypage__profile-name mypage__profile-name-copy"
                onClick={handleCopyNickname}
                aria-label="닉네임 복사"
              >
                {nickname || "닉네임"}
              </button>
            )}
            {nicknameCopyMessage && (
              <p className="mypage__profile-copy-message" role="status">
                {nicknameCopyMessage}
              </p>
            )}
            {(uploadingProfileImage || profileImageError) && (
              <p
                className={`mypage__profile-copy-message${
                  profileImageError ? " mypage__profile-copy-message--error" : ""
                }`}
                role="status"
              >
                {profileImageError || "프로필 사진 저장 중..."}
              </p>
            )}
            <button
              type="button"
              className={`mypage__profile-edit-btn${
                isEditing ? " mypage__profile-edit-btn--done" : ""
              }`}
              onClick={() => setIsEditing((prev) => !prev)}
            >
              {isEditing ? "완료" : "내 정보 수정"}
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
              onClick={() => isEditing && setShowSheet(true)}
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
              <span className="mypage__acct-info-label">유저 아이디</span>
              <span className="mypage__acct-info-value">{email}</span>
              <ChevronRightIcon size={16} color="#5c5950" />
            </button>
            <button
              type="button"
              className="mypage__acct-info-row"
              onClick={() => setShowBirthdayEditor(true)}
            >
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
              {birthday && (
                <span className="mypage__acct-info-value">{birthday}</span>
              )}
              <ChevronRightIcon size={16} color="#5c5950" />
            </button>
            <button
              type="button"
              className="mypage__acct-info-row"
              onClick={openGenderSheet}
            >
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
              {getGenderDisplay(gender) && (
                <span className="mypage__acct-info-value">
                  {getGenderDisplay(gender)}
                </span>
              )}
              <ChevronRightIcon size={16} color="#5c5950" />
            </button>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="mypage__logout-wrap mypage__logout-wrap--bottom">
          <button
            type="button"
            className="mypage__acct-logout-btn"
            onClick={() => setShowLogout(true)}
          >
            <img
              src="/assets/My/logout.svg"
              width="24"
              height="24"
              alt=""
              aria-hidden="true"
            />
            <span>로그아웃</span>
          </button>
          <button
            type="button"
            className="mypage__acct-delete-btn"
            onClick={openDeleteAccountConfirm}
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {showSheet && (
        <NicknameSheet
          onClose={() => setShowSheet(false)}
          onSaved={(nextProfile) => {
            applyProfile(nextProfile);
            setShowSheet(false);
          }}
        />
      )}

      {showGenderSheet && (
        <GenderSheet
          value={pendingGender}
          onChange={(nextGender) => {
            setPendingGender(nextGender);
            setGenderError("");
          }}
          onClose={() => setShowGenderSheet(false)}
          onSave={() => {
            setGenderError("");
            setShowGenderConfirm(true);
          }}
        />
      )}

      {showGenderConfirm && (
        <ProfileConfirmModal
          title="프로필 성별 변경"
          description={genderError || "변경 시 2주간 변경할 수 없습니다."}
          confirming={savingGender}
          onCancel={() => setShowGenderConfirm(false)}
          onConfirm={handleGenderConfirm}
        />
      )}

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          error={deleteAccountError}
          confirming={deletingAccount}
          onCancel={closeDeleteAccountConfirm}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}

// ── 서재 카테고리 뷰 ──────────────────────────────────────────────────────────

function LibraryCategoryView({
  books: allBooks = [],
  loading,
  error,
  initialCategory,
  onBack,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    CATEGORY_TO_TAB[initialCategory] ?? "all",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const countOf = (status) =>
    allBooks.filter((b) => b.status === status).length;
  const counts = {
    all: allBooks.length,
    read: countOf("다 읽은 책"),
    reading: countOf("읽고 있는 책"),
    wishlist: countOf("찜한 책"),
  };

  const activeTabConfig =
    CAT_TABS.find((t) => t.id === activeTab) ?? CAT_TABS[0];
  const activeStatus = activeTabConfig.status;
  const selectedCount = counts[activeTab] ?? 0;
  const books =
    activeTab === "all"
      ? allBooks
      : allBooks.filter((b) => b.status === activeStatus);

  return (
    <div className="mypage mypage--library">
      <div className="mypage__header">
        <BackButton onClick={onBack} />
        <h1 className="mypage__header-title mypage__header-title__library">
          내 서재
        </h1>
      </div>

      <div className="mypage__library-scroll">
        <div
          className="mypage__cat-tabs"
          role="tablist"
          aria-label="서재 카테고리"
        >
          {CAT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`mypage__cat-tab${activeTab === tab.id ? " mypage__cat-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mypage__library-count">
          <span>{activeTabConfig.label}</span>
          <strong>{selectedCount}</strong>
        </p>

        <div className="mypage__library-banner">
          <img src={libraryBannerImage} alt="이번달 인기 신작 BEST 3" />
        </div>

        <div className="mypage__book-list" role="tabpanel">
          {loading ? (
            <p className="mypage__empty">서재를 불러오는 중이에요.</p>
          ) : error ? (
            <p className="mypage__empty">{error}</p>
          ) : books.length === 0 ? (
            <p className="mypage__empty">아직 책이 없어요.</p>
          ) : (
            books.map((book) => {
              const dateText = book.endDate || book.startDate || "";
              const metaText = [book.category, book.publisher]
                .filter(Boolean)
                .join(" ㅣ ");
              const isWishlist = book.status === "찜한 책";
              const isReading = book.status === "읽고 있는 책";
              const isRead = book.status === "다 읽은 책";
              const totalPages = parseBookPageCount(book.pages);
              const currentPage = Number(book.currentPage) || 0;
              const readingPercent = totalPages
                ? Math.min(100, Math.round((currentPage / totalPages) * 100))
                : 0;

              return (
                <button
                  key={book.id}
                  type="button"
                  className="mypage__book-item"
                  onClick={() =>
                    navigate(`/book/${book.isbn || book.bookId || book.id}`, {
                      state: { book },
                    })
                  }
                >
                  <img
                    className="mypage__book-cover"
                    src={book.cover}
                    alt={book.title}
                  />
                  <div className="mypage__book-info">
                    <p className="mypage__book-title">{book.title}</p>
                    <p className="mypage__book-author">{book.author}</p>
                    {metaText && (
                      <p className="mypage__book-meta">{metaText}</p>
                    )}
                    <div className="mypage__book-chips">
                      <span className="mypage__book-status-chip">
                        <span
                          className="mypage__book-chip-icon"
                          aria-hidden="true"
                        >
                          {isWishlist ? (
                            "♥"
                          ) : isReading ? (
                            <LibraryExcIcon />
                          ) : isRead ? (
                            <LibraryCheckIcon />
                          ) : (
                            null
                          )}
                        </span>
                        {book.status}
                      </span>

                      {isReading ? (
                        <span className="mypage__book-progress-chip">
                          정독까지 {readingPercent}%
                        </span>
                      ) : dateText ? (
                        <span className="mypage__book-date-chip">
                          <img
                            src="/assets/library/calendar-01.svg"
                            alt=""
                            aria-hidden="true"
                          />
                          {dateText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── 내 메모 뷰 ───────────────────────────────────────────────────────────────

function MemoView({ onBack }) {
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const [selectedBook, setSelectedBook] = useState(null);
  const [memoList, setMemoList] = useState(() => (userId ? [] : null));
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const booksWithMemos = getBooksWithMemos();
  const useApiMemos = Boolean(userId);

  useEffect(() => {
    if (!userId) {
      setMemoList(null);
      setLoading(false);
      setError("");
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    getAllMemos(userId)
      .then((data) => {
        if (cancelled) return;
        setMemoList(toMemoArray(data).map(normalizeMemoSummary));
      })
      .catch((apiError) => {
        if (cancelled) return;
        setMemoList([]);
        setError(apiError?.message ?? "메모를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleBack = () => {
    if (!useApiMemos && selectedBook) {
      setSelectedBook(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="mypage mypage--memo">
      <div className="mypage__header">
        <BackButton onClick={handleBack} />
        <h1 className="mypage__header-title">
          {!useApiMemos && selectedBook ? selectedBook.title : "내 메모"}
        </h1>
      </div>

      <div className="mypage__memo-scroll">
        {useApiMemos ? (
          loading ? (
            <p className="mypage__empty">메모를 불러오는 중이에요.</p>
          ) : error ? (
            <p className="mypage__empty">{error}</p>
          ) : memoList.length === 0 ? (
            <p className="mypage__empty">아직 메모가 없어요.</p>
          ) : (
            memoList.map((memo, idx) => (
              <React.Fragment key={memo.memoId ?? memo.id ?? idx}>
                <button
                  type="button"
                  className="mypage__memo-row"
                  onClick={() =>
                    navigate(ROUTES.MEMO_EDIT, {
                      state: {
                        memo,
                        memoId: memo.memoId ?? memo.id,
                        mode: "view",
                      },
                    })
                  }
                >
                  <div className="mypage__memo-row-info">
                    <span className="mypage__memo-row-label">
                      {getMemoTitle(memo)}
                    </span>
                    {memo.date && (
                      <span className="mypage__memo-row-date">{memo.date}</span>
                    )}
                  </div>
                  <span className="mypage__arrow">
                    <ChevronRightIcon size={20} color="#8e8b7e" />
                  </span>
                </button>
                {idx < memoList.length - 1 && (
                  <div className="mypage__memo-divider" />
                )}
              </React.Fragment>
            ))
          )
        ) : selectedBook === null ? (
          booksWithMemos.length === 0 ? (
            <p className="mypage__empty">아직 메모가 없어요.</p>
          ) : (
            booksWithMemos.map((book, idx) => (
              <React.Fragment key={book.id}>
                <button
                  type="button"
                  className="mypage__memo-row"
                  onClick={() => setSelectedBook(book)}
                >
                  <span className="mypage__memo-row-label">{book.title}</span>
                  <span className="mypage__memo-row-count">
                    {book.memos.length}개
                  </span>
                  <span className="mypage__arrow">
                    <ChevronRightIcon size={20} color="#8e8b7e" />
                  </span>
                </button>
                {idx < booksWithMemos.length - 1 && (
                  <div className="mypage__memo-divider" />
                )}
              </React.Fragment>
            ))
          )
        ) : selectedBook.memos.length === 0 ? (
          <p className="mypage__empty">메모가 없어요.</p>
        ) : (
          selectedBook.memos.map((memo, idx) => (
            <React.Fragment key={memo.id ?? idx}>
              <button
                type="button"
                className="mypage__memo-row"
                onClick={() =>
                  navigate(ROUTES.MEMO_EDIT, {
                    state: {
                      bookId: selectedBook.id,
                      routeBookId: selectedBook.id,
                      memo,
                      mode: "view",
                    },
                  })
                }
              >
                <div className="mypage__memo-row-info">
                  <span className="mypage__memo-row-label">
                    {getMemoTitle(memo)}
                  </span>
                  {memo.date && (
                    <span className="mypage__memo-row-date">{memo.date}</span>
                  )}
                </div>
                <span className="mypage__arrow">
                  <ChevronRightIcon size={20} color="#8e8b7e" />
                </span>
              </button>
              {idx < selectedBook.memos.length - 1 && (
                <div className="mypage__memo-divider" />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}

// ── 루트 컴포넌트 ─────────────────────────────────────────────────────────────

export default function MyPage() {
  const [view, setView] = useState("main");
  const [profileSnapshot, setProfileSnapshot] = useState(getStoredProfileSnapshot);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [libraryBooks, setLibraryBooks] = useState(() =>
    getCurrentUserId() ? [] : getBooksWithInfo(),
  );
  const [libraryLoading, setLibraryLoading] = useState(() =>
    Boolean(getCurrentUserId()),
  );
  const [libraryError, setLibraryError] = useState("");

  const refreshProfileSnapshot = () => {
    setProfileSnapshot(getStoredProfileSnapshot());
  };

  const applyProfileSnapshot = (nextProfile) => {
    const storedProfile = getStoredProfileSnapshot();
    const hasProfileImage = Object.prototype.hasOwnProperty.call(
      nextProfile ?? {},
      "profileImage",
    );

    setProfileSnapshot({
      ...storedProfile,
      ...nextProfile,
      gender: normalizeGender(nextProfile?.gender ?? storedProfile.gender),
      profileImage: hasProfileImage
        ? nextProfile.profileImage
        : storedProfile.profileImage,
    });
  };

  const syncLatestProfile = () => {
    const userId = getCurrentUserId();

    if (!userId) {
      refreshProfileSnapshot();
      return Promise.resolve(null);
    }

    return fetchAndSyncUserProfile(userId)
      .then((profile) => {
        applyProfileSnapshot(profile);
        return profile;
      })
      .catch(() => {
        refreshProfileSnapshot();
        return null;
      });
  };

  useEffect(() => {
    let cancelled = false;
    const userId = getCurrentUserId();

    if (!userId) {
      refreshProfileSnapshot();
      return undefined;
    }

    fetchAndSyncUserProfile(userId)
      .then((profile) => {
        if (!cancelled) applyProfileSnapshot(profile);
      })
      .catch(() => {
        if (!cancelled) refreshProfileSnapshot();
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncVisibleProfile = () => {
      if (!cancelled) syncLatestProfile();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncVisibleProfile();
    };

    window.addEventListener("focus", syncVisibleProfile);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncVisibleProfile);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const userId = getCurrentUserId();

    if (!userId) {
      setLibraryBooks(getBooksWithInfo());
      setLibraryLoading(false);
      setLibraryError("");
      return undefined;
    }

    let cancelled = false;
    setLibraryLoading(true);
    setLibraryError("");

    getMyBooks(userId)
      .then((data) => {
        if (cancelled) return;
        setLibraryBooks(toLibraryBookArray(data).map(normalizeLibraryBook));
      })
      .catch((error) => {
        if (cancelled) return;
        setLibraryBooks([]);
        setLibraryError(error?.message ?? "서재를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (view === "report") return <ReportView onBack={() => setView("main")} />;

  if (view === "account")
    return (
      <AccountView
        onBack={() => {
          refreshProfileSnapshot();
          setView("main");
        }}
        profile={profileSnapshot}
        onProfileChange={applyProfileSnapshot}
      />
    );
  if (view === "memo") return <MemoView onBack={() => setView("main")} />;
  if (view === "install")
    return <InstallGuidePage onBack={() => setView("main")} />;
  if (view === "library")
    return (
      <LibraryCategoryView
        books={libraryBooks}
        loading={libraryLoading}
        error={libraryError}
        initialCategory={selectedCategory}
        onBack={() => setView("main")}
      />
    );
  return (
    <MainView
      profile={profileSnapshot}
      libraryBooks={libraryBooks}
      libraryLoading={libraryLoading}
      libraryError={libraryError}
      onReport={() => setView("report")}
      onAccount={() => {
        syncLatestProfile();
        setView("account");
      }}
      onLibrary={(category) => {
        setSelectedCategory(category);
        setView("library");
      }}
      onMemo={() => setView("memo")}
      onInstallGuide={() => setView("install")}
    />
  );
}
