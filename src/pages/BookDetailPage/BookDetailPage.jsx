import React, { useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { mockBooks } from '../../data/mockBooks'
import { ROUTES } from '../../constants/routes'
import {
  ChevronLeftIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
} from '../../assets/icons'
import './BookDetailPage.scss'

const ALERT_ICON_SRC = '/assets/alert-02.svg'
const PROGRESS_CHARACTER_SRC = '/assets/shop/character.svg'
const BOOK_STATE_ICON_SRC = '/assets/library/bookState.svg'
const BOOK_DATE_ICON_SRC = '/assets/library/bookDate.svg'
const CALENDAR_ICON_SRC = '/assets/library/calendar-01.svg'
const EDIT_ICON_SRC = '/assets/library/edit.svg'
const BOOK_CHAT_CHARACTER_SRC = '/assets/shop/character.svg'

const BOOK_STATUS = {
  finished: '다 읽은 책',
  reading: '읽고 있는 책',
  favorite: '찜한 책',
}

const TABS = [
  { id: 'info', label: '책 정보' },
  { id: 'chat', label: '가독이 챗' },
  { id: 'memo', label: '메모' },
]

const STATUS_OPTIONS = [BOOK_STATUS.finished, BOOK_STATUS.reading, BOOK_STATUS.favorite]
const SAVED_KEY = 'savedBookIds'

const toInputDate = (str) => {
  if (!str) return ''
  const [year, month, day] = String(str).match(/\d+/g) || []
  if (!year || !month || !day) return ''
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

const toDisplayDate = (str) => {
  if (!str) return ''
  const [year, month, day] = String(str).match(/\d+/g) || []
  if (!year || !month || !day) return ''
  return `${year.padStart(4, '0')}. ${month.padStart(2, '0')}. ${day.padStart(2, '0')}`
}

const parsePageCount = (pages) => Number.parseInt(String(pages || '').replace(/[^0-9]/g, ''), 10)

function getSavedIds() {
  const raw = localStorage.getItem(SAVED_KEY)
  if (raw !== null) return new Set(JSON.parse(raw))
  const all = mockBooks.map((book) => book.id)
  localStorage.setItem(SAVED_KEY, JSON.stringify(all))
  return new Set(all)
}

function addSavedId(id) {
  const ids = getSavedIds()
  ids.add(id)
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]))
}

function removeSavedId(id) {
  const ids = getSavedIds()
  ids.delete(id)
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]))
}

function loadBookInfo(bookId, book) {
  const saved = JSON.parse(localStorage.getItem(`bookInfo_${bookId}`) || 'null')
  return saved ?? {
    status: book.status || '다 읽은 책',
    startDate: book.startDate || '2026. 05. 05',
    endDate: book.endDate || '2026. 05. 20',
  }
}

function saveBookInfo(bookId, info) {
  localStorage.setItem(`bookInfo_${bookId}`, JSON.stringify(info))
}

function loadMemos(bookId, seedMemos) {
  const saved = JSON.parse(localStorage.getItem(`memos_${bookId}`) || 'null')
  return saved ?? seedMemos
}

function saveMemos(bookId, memos) {
  localStorage.setItem(`memos_${bookId}`, JSON.stringify(memos))
}

function DateField({ label, value, onChange, min }) {
  const inputRef = useRef(null)

  const openPicker = () => {
    try {
      inputRef.current?.showPicker?.()
    } catch {
      // Some browsers only allow showPicker from direct input interaction.
    }
    inputRef.current?.focus()
  }

  return (
    <label className="edit-sheet__date-field" onClick={openPicker}>
      <img className="edit-sheet__date-icon" src={CALENDAR_ICON_SRC} alt="" aria-hidden="true" />
      <input
        ref={inputRef}
        type="date"
        aria-label={label}
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const book = mockBooks.find((item) => item.id === Number(id))

  const [isSaved, setIsSaved] = useState(() => (book ? getSavedIds().has(book.id) : false))
  const [bookInfo, setBookInfo] = useState(() => loadBookInfo(Number(id), book ?? {}))
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'info')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [deleteMemoId, setDeleteMemoId] = useState(null)
  const [memos, setMemos] = useState(() => loadMemos(Number(id), book?.memos ?? []))

  const [editStatus, setEditStatus] = useState(bookInfo.status)
  const [editStart, setEditStart] = useState(toInputDate(bookInfo.startDate))
  const [editEnd, setEditEnd] = useState(toInputDate(bookInfo.endDate))

  const pageInfo = useMemo(() => {
    const total = parsePageCount(book?.pages) || 204
    const current = Math.min(book?.currentPage || (bookInfo.status === BOOK_STATUS.finished ? 86 : 0) || 86, total)
    const progressStep = total > 0 ? total / 10 : 0
    const progress = progressStep > 0 ? Math.ceil(current / progressStep) * 10 : 0
    return {
      total,
      current,
      progress: Math.max(0, Math.min(progress, 100)),
    }
  }, [book?.currentPage, book?.pages, bookInfo.status])

  if (!book) {
    return (
      <main className="book-detail book-detail--empty">
        <p>책을 찾을 수 없어요.</p>
      </main>
    )
  }

  const openEditSheet = () => {
    setEditStatus(bookInfo.status)
    setEditStart(toInputDate(bookInfo.startDate))
    setEditEnd(toInputDate(bookInfo.endDate))
    setShowEditSheet(true)
  }

  const handleSaveEdit = () => {
    const today = new Date().toISOString().slice(0, 10)
    const startDate = editStart || today
    const endDate = editEnd || startDate

    const updated = {
      status: editStatus,
      startDate: editStatus === BOOK_STATUS.favorite ? '' : toDisplayDate(startDate),
      endDate: editStatus === BOOK_STATUS.finished ? toDisplayDate(endDate) : '',
    }

    setBookInfo(updated)
    saveBookInfo(book.id, updated)

    if (!isSaved) {
      addSavedId(book.id)
      setIsSaved(true)
    }

    setShowEditSheet(false)
  }

  const handleCloseEditSheet = () => {
    handleSaveEdit()
  }

  const handleDelete = () => {
    removeSavedId(book.id)
    navigate(ROUTES.HOME)
  }

  const handleDeleteMemo = (memoId) => {
    const updated = memos.filter((memo) => memo.id !== memoId)
    setMemos(updated)
    saveMemos(book.id, updated)
    setDeleteMemoId(null)
  }

  const handleStatusChange = (status) => {
    setEditStatus(status)
    if (status === BOOK_STATUS.finished && !editEnd) {
      setEditEnd(editStart || new Date().toISOString().slice(0, 10))
    }
  }

  return (
    <main className="book-detail">
      {showDeleteModal && (
        <div className="book-detail__overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(event) => event.stopPropagation()}>
            <img className="delete-modal__alert" src={ALERT_ICON_SRC} alt="" aria-hidden="true" />
            <p className="delete-modal__title">내 서재에서 제거</p>
            <p className="delete-modal__desc">삭제 시 복구할 수 없습니다.</p>
            <div className="delete-modal__actions">
              <button type="button" onClick={() => setShowDeleteModal(false)}>취소</button>
              <button type="button" onClick={handleDelete}>확인</button>
            </div>
          </div>
        </div>
      )}

      {deleteMemoId !== null && (
        <div className="book-detail__overlay" onClick={() => setDeleteMemoId(null)}>
          <div className="delete-modal" onClick={(event) => event.stopPropagation()}>
            <img className="delete-modal__alert" src={ALERT_ICON_SRC} alt="" aria-hidden="true" />
            <p className="delete-modal__title">메모 삭제</p>
            <p className="delete-modal__desc">삭제 시 복구할 수 없습니다.</p>
            <div className="delete-modal__actions">
              <button type="button" onClick={() => setDeleteMemoId(null)}>취소</button>
              <button type="button" onClick={() => handleDeleteMemo(deleteMemoId)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {showEditSheet && (
        <div className="book-detail__overlay book-detail__overlay--sheet" onClick={handleCloseEditSheet}>
          <section className="edit-sheet" onClick={(event) => event.stopPropagation()}>
            <header className="edit-sheet__header">
              <h2>어떤 책 인가요?</h2>
            </header>

            <div className="edit-sheet__section">
              <div className="edit-sheet__label">
                <img className="edit-sheet__label-icon" src={BOOK_STATE_ICON_SRC} alt="" aria-hidden="true" />
                <span>독서 상태</span>
              </div>
              <div className="edit-sheet__status-row">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`edit-sheet__chip${editStatus === status ? ' edit-sheet__chip--active' : ''}`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {editStatus !== BOOK_STATUS.favorite && (
              <div className="edit-sheet__section">
                <div className="edit-sheet__label">
                  <img className="edit-sheet__label-icon" src={BOOK_DATE_ICON_SRC} alt="" aria-hidden="true" />
                  <span>독서 날짜</span>
                </div>
                <div className="edit-sheet__dates">
                  <DateField
                    label="독서 시작일"
                    value={editStart}
                    onChange={setEditStart}
                  />

                  {editStatus === BOOK_STATUS.finished && (
                    <>
                      <span className="edit-sheet__date-separator">-</span>
                      <DateField
                        label="독서 종료일"
                        value={editEnd}
                        min={editStart}
                        onChange={setEditEnd}
                      />
                    </>
                  )}

                  {editStatus !== BOOK_STATUS.finished && (
                    <>
                      <span className="edit-sheet__date-separator">-</span>
                      <div className="edit-sheet__date-field edit-sheet__date-field--empty">
                        <img className="edit-sheet__date-icon" src={CALENDAR_ICON_SRC} alt="" aria-hidden="true" />
                        <span>-</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <button className="edit-sheet__save" type="button" onClick={handleSaveEdit}>
              설정하기
            </button>
          </section>
        </div>
      )}

      <section className="book-detail__hero">
        <div className="book-detail__topbar">
          <button className="book-detail__round-btn" type="button" onClick={() => navigate(-1)} aria-label="이전">
            <ChevronLeftIcon size={24} color="#141B34" />
          </button>

          <div className="book-detail__top-actions">
            <button className="book-detail__round-btn" type="button" onClick={openEditSheet} aria-label="수정">
              <img src={EDIT_ICON_SRC} alt="" aria-hidden="true" />
            </button>
            <button
              className="book-detail__round-btn"
              type="button"
              onClick={() => setShowDeleteModal(true)}
              aria-label="삭제"
            >
              <TrashIcon size={24} color="#141B34" />
            </button>
          </div>
        </div>

        <img className="book-detail__cover" src={book.cover} alt={book.title} />

        <div className="book-detail__summary">
          <h1>{book.title}</h1>
          <p>{book.author}</p>
        </div>

        <div className={`book-detail__meta-cards${isSaved && bookInfo.status === BOOK_STATUS.favorite ? ' book-detail__meta-cards--single' : ''}`}>
          <div className="book-detail__status-card">
            <span className="book-detail__check">
              <CheckIcon size={20} color="#FEFEFE" />
            </span>
            <span>{isSaved ? bookInfo.status : '저장하기'}</span>
          </div>

          {isSaved && bookInfo.status !== BOOK_STATUS.favorite && (
            <div className="book-detail__date-card">
              <span>시작 ㅣ {bookInfo.startDate || '2026. 05. 05'}</span>
              <span>
                종료 ㅣ {bookInfo.status === BOOK_STATUS.finished ? bookInfo.endDate || '2026. 05. 20' : '2026. --. --'}
              </span>
            </div>
          )}
        </div>
      </section>

      <nav className="book-detail__tab-bar" aria-label="책 상세 탭">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`book-detail__tab${activeTab === tab.id ? ' book-detail__tab--active' : ''}`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={`book-detail__content${activeTab === 'chat' ? ' book-detail__content--chat' : ''}`}>
        {activeTab === 'info' && (
          <div className="book-info">
            <article className="book-info__section">
              <h2>책 정보</h2>
              <p>{book.description}</p>
            </article>

            <article className="book-info__section">
              <h2>출판사 ㅣ 발행일</h2>
              <p>{book.publisher} ㅣ {book.publishYear}년</p>
            </article>

            <article className="book-info__section">
              <h2>ISBN</h2>
              <p>{book.isbn}</p>
            </article>

            <article className="book-info__section book-info__section--pages">
              <h2>페이지 수</h2>
              <div className="book-progress" style={{ '--book-progress': `${pageInfo.progress}%` }}>
                <div className="book-progress__track" />
                <span className="book-progress__current">
                  <img src={PROGRESS_CHARACTER_SRC} alt="" aria-hidden="true" />
                  <b>{pageInfo.current}P</b>
                </span>
                <span className="book-progress__total">
                  <img src={BOOK_DATE_ICON_SRC} alt="" aria-hidden="true" />
                  <b>{pageInfo.total}P</b>
                </span>
              </div>
            </article>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="book-chat">
            <div className="book-chat__bubble" aria-hidden="true">
              나랑 책 이야기하자!
            </div>
            <div className="book-chat__character-wrap" aria-hidden="true">
              <span className="book-chat__glow" />
              <img className="book-chat__character" src={BOOK_CHAT_CHARACTER_SRC} alt="" />
            </div>
            <button
              className="book-chat__cta"
              type="button"
              onClick={() => navigate(ROUTES.CHAT, { state: { bookId: book.id } })}
            >
              가독이챗 하러 가기
            </button>
          </div>
        )}

        {activeTab === 'memo' && (
          <div className="book-memo">
            <button
              className="book-memo__write-btn"
              type="button"
              onClick={() => navigate(ROUTES.MEMO_EDIT, { state: { bookId: book.id } })}
            >
              <PencilIcon size={20} color="#42403A" />
              메모 작성하기
            </button>

            {memos.length === 0 ? (
              <p className="book-memo__empty">아직 작성한 메모가 없어요.</p>
            ) : (
              <div className="book-memo__list">
                {memos.map((memo) => (
                  <article key={memo.id} className="memo-card">
                    <div className="memo-card__top">
                      <p>{memo.content}</p>
                      <button type="button" onClick={() => setDeleteMemoId(memo.id)} aria-label="메모 삭제">
                        <TrashIcon size={20} color="#757267" />
                      </button>
                    </div>
                    <time>{memo.date}</time>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
