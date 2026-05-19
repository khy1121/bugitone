import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import Chip from '../../components/common/Chip/Chip'
import { mockBooks } from '../../data/mockBooks'
import { ChevronRightIcon, ChevronLeftIcon } from '../../assets/icons'
import './MyPage.scss'

const MOCK_USER = {
  name: '유저 이름',
  id: '유저 아이디',
  birthday: '20XX/XX/XX',
  gender: '여성',
}

const CURRENT_MONTH = new Date().getMonth() + 1
const EMOTIONS = ['#뿌듯함', '#지침', '#설렘']
const ACTIVE_EMOTIONS = new Set(['#뿌듯함', '#지침'])
const LIBRARY_CATEGORIES = ['다 읽은 책', '읽고 있는 책', '찜한 책']

const CAT_TABS = [
  { id: 'all',      label: '전체',        status: null },
  { id: 'read',     label: '읽은 책',     status: '다 읽은 책' },
  { id: 'reading',  label: '읽고 있는 책', status: '읽고 있는 책' },
  { id: 'wishlist', label: '읽고 싶은 책', status: '찜한 책' },
]

const CATEGORY_TO_TAB = {
  '다 읽은 책': 'read',
  '읽고 있는 책': 'reading',
  '찜한 책': 'wishlist',
}

function getBooksWithInfo() {
  return mockBooks.map(book => {
    const saved = JSON.parse(localStorage.getItem(`bookInfo_${book.id}`) || 'null')
    const extra = JSON.parse(localStorage.getItem(`bookExtra_${book.id}`) || 'null')
    return {
      ...book,
      status: saved?.status ?? book.status,
      startDate: saved?.startDate || book.startDate || '',
      endDate: saved?.endDate || book.endDate || '',
      rating: extra?.rating ?? book.rating ?? 0,
      currentPage: extra?.currentPage ?? book.currentPage ?? 0,
    }
  })
}

function ArrowRight() {
  return <ChevronRightIcon size={20} color="#999" />
}

function BackButton({ onClick }) {
  return (
    <button className="mypage__back" type="button" onClick={onClick} aria-label="뒤로">
      <ChevronLeftIcon size={24} color="#000" />
    </button>
  )
}

function StarRating({ rating }) {
  return (
    <div className="mypage__stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`mypage__star${i <= rating ? ' mypage__star--on' : ''}`}>
          {i <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}

function ProgressBar({ currentPage, totalPages }) {
  const total = totalPages || 1
  const pct = Math.min(100, Math.round((currentPage / total) * 100))
  return (
    <div className="mypage__progress">
      <div className="mypage__progress__track">
        <div className="mypage__progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="mypage__progress__labels">
        <span>{pct}%</span>
        <span>{currentPage} / {totalPages}p</span>
      </div>
    </div>
  )
}

function MainView({ onReport, onAccount, onLibrary }) {
  const books = getBooksWithInfo()
  const countByStatus = (status) => books.filter(b => b.status === status).length

  return (
    <div className="mypage mypage--main">
      <div className="mypage__header-line" />
      <h1 className="mypage__title">마이페이지</h1>

      <div className="mypage__scroll-content">
        <p className="mypage__section-label">계정</p>
        <button type="button" className="mypage__card mypage__card--account" onClick={onAccount}>
          <div className="mypage__avatar mypage__avatar--sm" />
          <div className="mypage__card-info">
            <span className="mypage__user-name">{MOCK_USER.name}</span>
            <span className="mypage__user-id">{MOCK_USER.id}</span>
          </div>
          <span className="mypage__arrow"><ArrowRight /></span>
        </button>

        <p className="mypage__section-label mypage__section-label--gap">내 기록</p>
        <button type="button" className="mypage__card mypage__card--record" onClick={onReport}>
          <div className="mypage__card-record-info">
            <span className="mypage__record-title">이번 달 나의 이야기</span>
            <span className="mypage__record-sub">{CURRENT_MONTH}월 리포트</span>
          </div>
          <span className="mypage__arrow"><ArrowRight /></span>
        </button>

        <p className="mypage__section-label mypage__section-label--gap">내 서재</p>
        <div className="mypage__library-list">
          {LIBRARY_CATEGORIES.map(status => (
            <button
              key={status}
              type="button"
              className="mypage__card mypage__card--library"
              onClick={() => onLibrary(status)}
            >
              <span className="mypage__library-label">{status}</span>
              <span className="mypage__library-count">{countByStatus(status)}권</span>
              <span className="mypage__arrow"><ArrowRight /></span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="my" />
    </div>
  )
}

function ReportView({ onBack }) {
  return (
    <div className="mypage mypage--report">
      <div className="mypage__header-line" />
      <BackButton onClick={onBack} />
      <h1 className="mypage__title mypage__title--report">{CURRENT_MONTH}월 리포트</h1>

      <p className="mypage__section-label mypage__section-label--char">이 달 만난 캐릭터</p>

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

      <p className="mypage__section-label mypage__section-label--emotion">자주 느낀 감정</p>

      <div className="mypage__emotion-row">
        {EMOTIONS.map(e => (
          <Chip key={e} active={ACTIVE_EMOTIONS.has(e)}>{e}</Chip>
        ))}
      </div>
    </div>
  )
}

function AccountView({ onBack }) {
  return (
    <div className="mypage mypage--account">
      <div className="mypage__header-line" />
      <BackButton onClick={onBack} />
      <h1 className="mypage__title mypage__title--account">계정</h1>

      <div className="mypage__avatar mypage__avatar--lg" />
      <p className="mypage__account-name">{MOCK_USER.name}</p>

      <div className="mypage__info-list">
        <div className="mypage__info-row">
          <div className="mypage__info-icon" />
          <span className="mypage__info-label">유저 아이디</span>
          <span className="mypage__info-value">{MOCK_USER.id}</span>
          <button type="button" className="mypage__copy-btn">복사</button>
        </div>
        <div className="mypage__info-row">
          <div className="mypage__info-icon" />
          <span className="mypage__info-label">생일</span>
          <span className="mypage__info-value">{MOCK_USER.birthday}</span>
          <span className="mypage__arrow"><ArrowRight /></span>
        </div>
        <div className="mypage__info-row">
          <div className="mypage__info-icon" />
          <span className="mypage__info-label">성별</span>
          <span className="mypage__info-value">{MOCK_USER.gender}</span>
          <span className="mypage__arrow"><ArrowRight /></span>
        </div>
      </div>

      <button type="button" className="mypage__logout">로그아웃</button>
    </div>
  )
}

function LibraryCategoryView({ initialCategory, onBack }) {
  const navigate = useNavigate()
  const allBooks = getBooksWithInfo()
  const [activeTab, setActiveTab] = useState(
    CATEGORY_TO_TAB[initialCategory] ?? 'all'
  )

  const countOf = (status) => allBooks.filter(b => b.status === status).length
  const counts = {
    all: allBooks.length,
    read: countOf('다 읽은 책'),
    reading: countOf('읽고 있는 책'),
    wishlist: countOf('찜한 책'),
  }

  const activeStatus = CAT_TABS.find(t => t.id === activeTab)?.status
  const books = activeTab === 'all'
    ? allBooks
    : allBooks.filter(b => b.status === activeStatus)

  return (
    <div className="mypage mypage--library">
      <div className="mypage__header-line" />
      <BackButton onClick={onBack} />

      <div className="mypage__cat-tabs">
        {CAT_TABS.map(tab => (
          <button
            key={tab.id}
            className={`mypage__cat-tab${activeTab === tab.id ? ' mypage__cat-tab--active' : ''}`}
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
            const pagesNum = parseInt(book.pages, 10) || 0
            const dateText = book.startDate
              ? book.endDate
                ? `${book.startDate} ~ ${book.endDate}`
                : `${book.startDate} ~`
              : null

            return (
              <React.Fragment key={book.id}>
                <button
                  type="button"
                  className="mypage__book-item"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  <img className="mypage__book-cover" src={book.cover} alt={book.title} />
                  <div className="mypage__book-info">
                    <p className="mypage__book-title">{book.title}</p>
                    {book.status === '다 읽은 책' && <StarRating rating={book.rating} />}
                    {book.status === '읽고 있는 책' && (
                      <ProgressBar currentPage={book.currentPage} totalPages={pagesNum} />
                    )}
                    {dateText && <p className="mypage__book-date">{dateText}</p>}
                  </div>
                </button>
                {idx < books.length - 1 && <div className="mypage__book-divider" />}
              </React.Fragment>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function MyPage() {
  const [view, setView] = useState('main')
  const [selectedCategory, setSelectedCategory] = useState(null)

  if (view === 'report') return <ReportView onBack={() => setView('main')} />
  if (view === 'account') return <AccountView onBack={() => setView('main')} />
  if (view === 'library') return (
    <LibraryCategoryView
      initialCategory={selectedCategory}
      onBack={() => setView('main')}
    />
  )
  return (
    <MainView
      onReport={() => setView('report')}
      onAccount={() => setView('account')}
      onLibrary={(category) => { setSelectedCategory(category); setView('library') }}
    />
  )
}
