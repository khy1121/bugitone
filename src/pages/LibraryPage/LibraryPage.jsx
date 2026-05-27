import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import { CheckIcon } from '../../assets/icons'
import { mockBooks } from '../../data/mockBooks'
import { getMyBooks, searchBooks as searchApiBooks } from '../../api/bookApi'
import useKeyboardAwareInput from '../../hooks/useKeyboardAwareInput'
import './LibraryPage.scss'

const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const CHOSUNG_SET = new Set(CHOSUNG)
const FALLBACK_COVER = '/assets/library/book.svg'
const LIBRARY_SCROLL_KEY = 'libraryScrollTop'
const LIBRARY_VISIBLE_ROWS_KEY = 'libraryVisibleRows'
const RECENT_SEARCHES_KEY = 'libraryRecentSearches'
const RECENT_SEARCH_LIMIT = 10
const RECENT_SEARCH_LABEL_LIMIT = 10

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

function searchMockBooks(rawQuery) {
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

function loadRecentSearches() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => typeof item === 'string' && item.trim())
      .slice(0, RECENT_SEARCH_LIMIT)
  } catch {
    return []
  }
}

function getRecentSearchLabel(query) {
  const chars = [...query]
  if (chars.length <= RECENT_SEARCH_LABEL_LIMIT) return query
  return `${chars.slice(0, RECENT_SEARCH_LABEL_LIMIT).join('')}...`
}

function normalizeStatus(status) {
  if (status === 'WISHLIST' || status === 'WISH' || status === 'FAVORITE') return '찜한 책'
  if (status === 'READING') return '읽고 있는 책'
  if (status === 'DONE' || status === 'COMPLETED') return '다 읽은 책'
  return status || '읽고 있는 책'
}

function getUserId() {
  const stored = localStorage.getItem('userId')
  return stored ? Number(stored) : null
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.books)) return data.books
  if (Array.isArray(data?.bookList)) return data.bookList
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.mainStudies)) return data.mainStudies
  return []
}

function normalizeBook(raw) {
  const book = raw?.book ?? raw
  const isbn = book?.isbn13 ?? book?.isbn ?? raw?.isbn13 ?? raw?.isbn
  const id = raw?.mainId ?? raw?.mainStudyId ?? raw?.main_id ?? raw?.bookId ?? raw?.book_id ?? raw?.id ?? book?.id ?? isbn
  const title = book?.title ?? raw?.title ?? '제목 없음'
  const author = book?.author ?? raw?.author ?? ''
  const publisher = book?.publisher ?? raw?.publisher ?? ''
  const category = book?.categoryName ?? book?.category ?? raw?.category ?? raw?.categoryName ?? ''
  const startDate = raw?.startDate ?? raw?.startedAt ?? raw?.readStartDate ?? book?.startDate ?? ''
  const endDate = raw?.endDate ?? raw?.finishedAt ?? raw?.readEndDate ?? book?.endDate ?? ''

  return {
    id,
    mainId: raw?.mainId ?? raw?.mainStudyId ?? raw?.main_id ?? null,
    bookId: raw?.bookId ?? raw?.book_id ?? book?.bookId ?? book?.book_id ?? null,
    isbn,
    title,
    author,
    publisher,
    category,
    cover: book?.coverUrl ?? book?.cover_url ?? book?.cover ?? book?.coverImage ?? book?.thumbnail ?? raw?.coverUrl ?? raw?.cover_url ?? raw?.cover ?? raw?.coverImage ?? raw?.thumbnail ?? FALLBACK_COVER,
    status: normalizeStatus(raw?.readingStatus ?? raw?.reading_status ?? raw?.status ?? book?.readingStatus ?? book?.status),
    startDate,
    endDate,
    raw,
  }
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const contentRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchWrapRef = useRef(null)
  const recentSearchesRef = useRef(null)
  const recentDragRef = useRef({
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
  })
  const userId = getUserId()

  const [savedBooks, setSavedBooks] = useState(() => (userId ? [] : mockBooks))
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState('')
  const totalRows = Math.ceil(savedBooks.length / 3)
  const [visibleRows, setVisibleRows] = useState(Math.min(4, totalRows))
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches)
  const keyboard = useKeyboardAwareInput({
    scrollRef: pageRef,
    targetRef: searchWrapRef,
  })

  const saveRecentSearch = useCallback((value) => {
    const query = value.trim()
    if (!query) return

    setRecentSearches((prev) => {
      const next = [query, ...prev.filter((item) => item !== query)].slice(0, RECENT_SEARCH_LIMIT)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    setLoading(true)
    setError('')

    getMyBooks(userId)
      .then((data) => {
        if (cancelled) return
        setSavedBooks(toArray(data).map(normalizeBook))
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message ?? '서재를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!isSearchMode || !query) {
      setSearchResults(null)
      return undefined
    }

    if (!userId) {
      setSearchResults(searchMockBooks(query))
      return undefined
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      searchApiBooks(query, { userId })
        .then((data) => {
          if (!cancelled) setSearchResults(toArray(data).map(normalizeBook))
        })
        .catch(() => {
          if (!cancelled) setSearchResults([])
        })
    }, 500)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isSearchMode, searchQuery, userId])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!isSearchMode || !query) return undefined

    const timer = window.setTimeout(() => {
      saveRecentSearch(query)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [isSearchMode, saveRecentSearch, searchQuery])

  useEffect(() => {
    const savedVisibleRows = Number(sessionStorage.getItem(LIBRARY_VISIBLE_ROWS_KEY))
    const nextVisibleRows = Math.min(4, Math.ceil(savedBooks.length / 3))
    setVisibleRows(Math.max(nextVisibleRows, Number.isFinite(savedVisibleRows) ? savedVisibleRows : 0))
  }, [savedBooks.length])

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

  useEffect(() => {
    if (isSearchMode) return
    const restoreTop = Number(sessionStorage.getItem(LIBRARY_SCROLL_KEY))
    if (!Number.isFinite(restoreTop)) return

    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: restoreTop, behavior: 'auto' })
    })
  }, [isSearchMode, savedBooks.length, visibleRows])

  const openBookDetail = (book, options = {}) => {
    sessionStorage.setItem(LIBRARY_SCROLL_KEY, String(contentRef.current?.scrollTop ?? 0))
    sessionStorage.setItem(LIBRARY_VISIBLE_ROWS_KEY, String(visibleRows))

    navigate(`/book/${book.isbn || book.bookId || book.id}`, {
      state: {
        book,
        fromLibrary: true,
        ...options,
      },
    })
  }

  const rows = Array.from({ length: Math.min(visibleRows, totalRows) }, (_, index) =>
    savedBooks.slice(index * 3, index * 3 + 3)
  )

  const openSearchMode = () => {
    setIsSearchMode(true)
    setIsInputFocused(true)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  const handleSearchFocus = (event) => {
    openSearchMode()
    keyboard.handleFocus(event)
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
    if (!isSearchMode) setIsSearchMode(true)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key !== 'Enter') return
    saveRecentSearch(searchQuery)
  }

  const handleSearchBlur = (event) => {
    keyboard.handleBlur(event)
    setIsInputFocused(false)
    if (event.relatedTarget?.closest?.('.library__recent-searches')) return
    if (!searchQuery.trim()) setIsSearchMode(false)
  }

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query)
    setIsSearchMode(true)
    saveRecentSearch(query)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  const handleRecentPointerDown = (event) => {
    const scroller = recentSearchesRef.current
    const isRecentButton =
      event.target instanceof Element &&
      event.target.closest('.library__recent-search-btn')

    if (!scroller || event.pointerType === 'touch' || isRecentButton) return

    recentDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      dragged: false,
    }

    scroller.setPointerCapture?.(event.pointerId)
    scroller.classList.add('library__recent-searches--dragging')
  }

  const handleRecentPointerMove = (event) => {
    const scroller = recentSearchesRef.current
    const drag = recentDragRef.current

    if (!scroller || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startX
    if (Math.abs(deltaX) > 3) {
      drag.dragged = true
    }

    scroller.scrollLeft = drag.scrollLeft - deltaX
  }

  const endRecentDrag = (event) => {
    const scroller = recentSearchesRef.current
    const drag = recentDragRef.current

    if (!scroller || drag.pointerId !== event.pointerId) return

    scroller.releasePointerCapture?.(event.pointerId)
    scroller.classList.remove('library__recent-searches--dragging')
    recentDragRef.current = {
      pointerId: null,
      startX: 0,
      scrollLeft: scroller.scrollLeft,
      dragged: drag.dragged,
    }
  }

  const handleRecentClickCapture = (event) => {
    if (!recentDragRef.current.dragged) return

    event.preventDefault()
    event.stopPropagation()
    recentDragRef.current.dragged = false
  }

  const showRecentSearches = isSearchMode && !searchQuery.trim() && recentSearches.length > 0

  return (
    <div
      ref={pageRef}
      className={`library${isSearchMode ? ' library--searching' : ''}${keyboard.isKeyboardFocused ? ' library--keyboard' : ''}`}
    >
      <header className="library__header">
        <div className="library__brand">
          <h1 className="library__logo">DOK</h1>
          <p className="library__tagline">펼치는 순간, 나를 다독이다</p>
        </div>

        <label ref={searchWrapRef} className="library__search" aria-label="책 검색">
          <input
            ref={searchInputRef}
            className="library__search-input"
            type="search"
            value={searchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            enterKeyHint="search"
          />
          <img src="/assets/library/search.svg" alt="" aria-hidden="true" />
        </label>
      </header>

      {!isSearchMode && (
        <div className="library__content" ref={contentRef}>
          <div className="library__banner">
            <img
              src="/assets/library/book.svg"
              className="library__banner-img"
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="library__shelves">
            {savedBooks.length === 0 ? (
              <p className="library__empty">
                {loading ? '서재를 불러오는 중이에요.' : error || '현재 저장된 책이 없어요'}
              </p>
            ) : (
              rows.map((row, rowIndex) => (
                <div key={rowIndex} className="library__row-wrap">
                  <div className="library__row">
                    {row.map((book) => (
                      <button
                        key={book.id}
                        className="library__book"
                        type="button"
                        onClick={() => openBookDetail(book)}
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
        </div>
      )}

      {isSearchMode && (
        <>
          <div className="library__search-scrollbar" aria-hidden="true" />
          {showRecentSearches && (
            <div
              ref={recentSearchesRef}
              className="library__recent-searches"
              aria-label="최근 검색 기록"
              onPointerDown={handleRecentPointerDown}
              onPointerMove={handleRecentPointerMove}
              onPointerUp={endRecentDrag}
              onPointerCancel={endRecentDrag}
              onClickCapture={handleRecentClickCapture}
            >
              {recentSearches.map((query) => (
                <button
                  key={query}
                  className="library__recent-search-btn"
                  type="button"
                  title={query}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleRecentSearchClick(query)}
                >
                  {getRecentSearchLabel(query)}
                </button>
              ))}
            </div>
          )}
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
                    onClick={() => {
                      saveRecentSearch(searchQuery)
                      openBookDetail(book, { fromSearch: true })
                    }}
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

      {!(isSearchMode && isInputFocused) && <BottomNav active="library" className="bottom-nav--page" />}
    </div>
  )
}
