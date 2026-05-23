import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockBooks } from '../../data/mockBooks'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import { ROUTES } from '../../constants/routes'
import './LibraryPage.scss'

const SAVED_KEY = 'savedBookIds'
const SAVED_VER_KEY = 'savedBookIds_ver'
const SAVED_VER = 'v2'

function getSavedIds() {
  const ver = localStorage.getItem(SAVED_VER_KEY)
  if (ver === SAVED_VER) {
    const raw = localStorage.getItem(SAVED_KEY)
    if (raw !== null) return new Set(JSON.parse(raw))
  }
  const all = mockBooks.map(b => b.id)
  localStorage.setItem(SAVED_KEY, JSON.stringify(all))
  localStorage.setItem(SAVED_VER_KEY, SAVED_VER)
  return new Set(all)
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const savedBooks = mockBooks.filter(b => getSavedIds().has(b.id))
  const totalRows = Math.ceil(savedBooks.length / 3)
  const [visibleRows, setVisibleRows] = useState(Math.min(4, totalRows))

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleRows(prev => Math.min(prev + 2, totalRows))
      }
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [totalRows])

  const rows = Array.from({ length: Math.min(visibleRows, totalRows) }, (_, i) =>
    savedBooks.slice(i * 3, i * 3 + 3)
  )

  return (
    <div className="library">
      <header className="library__header">
        <div className="library__brand">
          <h1 className="library__logo">DOK</h1>
          <p className="library__tagline">펼치는 순간, 나를 다독이다</p>
        </div>
        <div className="library__actions">
          <button
            className="library__action-btn"
            aria-label="검색"
            onClick={() => navigate(ROUTES.SEARCH)}
          >
            <img src="/assets/library/search.svg" alt="" aria-hidden="true" />
          </button>
          <button
            className="library__action-btn"
            aria-label="책 추가"
            onClick={() => navigate(ROUTES.SEARCH)}
          >
            <img src="/assets/library/add.svg" alt="" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="library__banner">
        <img
          src="/assets/library/book.svg"
          className="library__banner-img"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="library__content" ref={contentRef}>
        {savedBooks.length === 0 ? (
          <p className="library__empty">서재에 저장된 책이 없어요.</p>
        ) : (
          rows.map((row, ri) => (
            <div key={ri} className="library__row-wrap">
              <div className="library__row">
                {row.map(book => (
                  <button
                    key={book.id}
                    className="library__book"
                    onClick={() => navigate(`/book/${book.id}`)}
                    aria-label={book.title}
                  >
                    <img className="library__cover" src={book.cover} alt={book.title} />
                  </button>
                ))}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="library__book library__book--empty" />
                  ))}
              </div>
              {/* 유리 바: 책 앞으로 오는 glass 이펙트 (position: absolute + z-index) */}
              <div className="library__row-glass" aria-hidden="true" />
              <div className="library__divider" />
            </div>
          ))
        )}
      </div>

      <button
        className="library__fab"
        aria-label="책 추가"
        onClick={() => navigate(ROUTES.SEARCH)}
      >
        <img src="/assets/library/add.svg" alt="" aria-hidden="true" />
      </button>

      <BottomNav active="library" className="bottom-nav--page" />
    </div>
  )
}
