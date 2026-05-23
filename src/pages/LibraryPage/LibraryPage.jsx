import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import { CheckIcon } from '../../assets/icons'
import { mockBooks } from '../../data/mockBooks'
import './LibraryPage.scss'

const SAVED_KEY = 'savedBookIds'
const SAVED_VER_KEY = 'savedBookIds_ver'
const SAVED_VER = 'v2'
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const CHOSUNG_SET = new Set(CHOSUNG)

const norm = (str) => String(str || '').replace(/\s/g, '')

function extractChosung(str) {
  return [...str].map((ch) => {
    const code = ch.charCodeAt(0)
    if (code >= 0xac00 && code <= 0xd7a3) return CHOSUNG[Math.floor((code - 0xac00) / 588)]
    return ch
  }).join('')
}

function isAllChosung(str) {
  return str.length > 0 && [...str].every((ch) => CHOSUNG_SET.has(ch))
}

function searchBooks(rawQuery) {
  const q = norm(rawQuery)
  if (!q) return null

  const useChosung = isAllChosung(q)
  const startsWith = []
  const contains = []

  mockBooks.forEach((book) => {
    const title = norm(book.title)
    const target = useChosung ? extractChosung(title) : title

    if (target.startsWith(q)) {
      startsWith.push(book)
    } else if (target.includes(q)) {
      contains.push(book)
    }
  })

  return [...startsWith, ...contains]
}

function getSavedIds() {
  const ver = localStorage.getItem(SAVED_VER_KEY)
  if (ver === SAVED_VER) {
    const raw = localStorage.getItem(SAVED_KEY)
    if (raw !== null) return new Set(JSON.parse(raw))
  }

  const all = mockBooks.map((book) => book.id)
  localStorage.setItem(SAVED_KEY, JSON.stringify(all))
  localStorage.setItem(SAVED_VER_KEY, SAVED_VER)
  return new Set(all)
}

function getStatusKind(status) {
  if (String(status).includes('찜')) return 'favorite'
  if (String(status).includes('읽고')) return 'reading'
  return 'finished'
}

function getDateLabel(book) {
  if (book.startDate) return `${book.startDate}~`
  if (book.endDate) return `~${book.endDate}`
  return ''
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const contentRef = useRef(null)
  const searchInputRef = useRef(null)

  const savedBooks = mockBooks.filter((book) => getSavedIds().has(book.id))
  const totalRows = Math.ceil(savedBooks.length / 3)
  const [visibleRows, setVisibleRows] = useState(Math.min(4, totalRows))
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = searchBooks(searchQuery)

  useEffect(() => {
    const el = contentRef.current
    if (!el || isSearchMode) return undefined

    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleRows((prev) => Math.min(prev + 2, totalRows))
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [isSearchMode, totalRows])

  const rows = Array.from({ length: Math.min(visibleRows, totalRows) }, (_, index) =>
    savedBooks.slice(index * 3, index * 3 + 3)
  )

  const openSearchMode = () => {
    setIsSearchMode(true)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
    if (!isSearchMode) setIsSearchMode(true)
  }

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) setIsSearchMode(false)
  }

  return (
    <div className={`library${isSearchMode ? ' library--searching' : ''}`}>
      <header className="library__header">
        <div className="library__brand">
          <h1 className="library__logo">DOK</h1>
          <p className="library__tagline">펼치는 순간, 나를 다독이다</p>
        </div>

        <label className="library__search" aria-label="책 검색">
          <input
            ref={searchInputRef}
            className="library__search-input"
            type="search"
            value={searchQuery}
            onFocus={openSearchMode}
            onBlur={handleSearchBlur}
            onChange={handleSearchChange}
            enterKeyHint="search"
          />
          <img src="/assets/library/search.svg" alt="" aria-hidden="true" />
        </label>
      </header>

      {!isSearchMode && (
        <>
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
              <p className="library__empty">현재 저장된 책이 없어요</p>
            ) : (
              rows.map((row, rowIndex) => (
                <div key={rowIndex} className="library__row-wrap">
                  <div className="library__row">
                    {row.map((book) => (
                      <button
                        key={book.id}
                        className="library__book"
                        type="button"
                        onClick={() => navigate(`/book/${book.id}`)}
                        aria-label={book.title}
                      >
                        <img className="library__cover" src={book.cover} alt={book.title} />
                      </button>
                    ))}
                    {row.length < 3 &&
                      Array.from({ length: 3 - row.length }).map((_, index) => (
                        <div key={`empty-${index}`} className="library__book library__book--empty" />
                      ))}
                  </div>
                  <div className="library__row-glass" aria-hidden="true" />
                  <div className="library__divider" />
                </div>
              ))
            )}
          </div>
        </>
      )}

      {isSearchMode && (
        <>
          <div className="library__search-scrollbar" aria-hidden="true" />
          <section className="library__search-results" aria-label="검색 결과">
            {!searchResults ? null : searchResults.length === 0 ? (
              <p className="library__search-empty">검색 결과가 없습니다.</p>
            ) : (
              searchResults.map((book, index) => {
                const statusKind = getStatusKind(book.status)
                const dateLabel = getDateLabel(book)

                return (
                  <button
                    key={book.id}
                    className={`library__search-item${index === searchResults.length - 1 ? ' library__search-item--last' : ''}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    <img className="library__search-cover" src={book.cover} alt={book.title} />
                    <div className="library__search-info">
                      <p className="library__search-title">{book.title}</p>
                      <p className="library__search-author">{book.author}</p>
                      <p className="library__search-meta">{book.category} ㅣ {book.publisher}</p>
                      <div className="library__search-chips">
                        <span className={`library__search-chip library__search-chip--${statusKind}`}>
                          <span className="library__search-chip-icon" aria-hidden="true">
                            {statusKind === 'favorite' ? '♥' : <CheckIcon size={10} color="#8E8B7E" />}
                          </span>
                          {book.status}
                        </span>
                        {dateLabel && (
                          <span className="library__search-chip library__search-chip--date">
                            <img src="/assets/library/calendar-01.svg" alt="" aria-hidden="true" />
                            {dateLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </section>
        </>
      )}

      <BottomNav active="library" className="bottom-nav--page" />
    </div>
  )
}
