import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockBooks } from '../../data/mockBooks'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import { ROUTES } from '../../constants/routes'
import { SearchIcon } from '../../assets/icons'
import './LibraryPage.scss'

const SAVED_KEY = 'savedBookIds'
const SAVED_VER_KEY = 'savedBookIds_ver'
const SAVED_VER = 'v2'
const FRAME_HEIGHT = 852
const STATUS_BAR_HEIGHT = 59
const HEADER_HEIGHT = 78
const BOTTOM_NAV_HEIGHT = 68
const BOTTOM_SAFE_AREA = 34
const CONTENT_BOTTOM_PADDING = 16
const ROW_HEIGHT = 165

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

function calcInitialRows() {
  const contentHeight =
    FRAME_HEIGHT - STATUS_BAR_HEIGHT - HEADER_HEIGHT - BOTTOM_NAV_HEIGHT - BOTTOM_SAFE_AREA - CONTENT_BOTTOM_PADDING
  return Math.max(Math.ceil(contentHeight / ROW_HEIGHT) + 1, 3)
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const savedBooks = mockBooks.filter(b => getSavedIds().has(b.id))
  const totalBookRows = Math.ceil(savedBooks.length / 3)

  const [visibleRows, setVisibleRows] = useState(() =>
    Math.min(calcInitialRows(), totalBookRows)
  )

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
        setVisibleRows(prev => Math.min(prev + 1, totalBookRows))
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [totalBookRows])

  const rows = Array.from({ length: Math.min(visibleRows, totalBookRows) }, (_, i) =>
    savedBooks.slice(i * 3, i * 3 + 3)
  )

  return (
    <div className="library">
      <header className="library__header">
        <div className="library__title-wrap">
          <span className="library__title">서재</span>
        </div>
        <button className="library__search" aria-label="검색" onClick={() => navigate(ROUTES.SEARCH)}>
          <SearchIcon size={28} color="#999" />
        </button>
      </header>

      <div className="library__content" ref={contentRef}>
        {savedBooks.length === 0 ? (
          <p className="library__empty">서재에 저장된 책이 없습니다.<br />검색으로 책을 추가해보세요.</p>
        ) : (
          rows.map((row, ri) => (
            <div key={ri}>
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
              </div>
              <div className="library__divider" />
            </div>
          ))
        )}
      </div>

      <BottomNav active="library" className="bottom-nav--page" />
    </div>
  )
}
