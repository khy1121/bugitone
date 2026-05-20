import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { mockBooks } from '../../data/mockBooks'
import { ROUTES } from '../../constants/routes'
import Chip from '../../components/common/Chip/Chip'
import { ChevronLeftIcon, TrashIcon, PencilIcon } from '../../assets/icons'
import './BookDetailPage.scss'

const TABS = [
  { id: 'info', label: '책 정보' },
  { id: 'chat', label: '가독이챗' },
  { id: 'memo', label: '메모' },
]

const STATUS_OPTIONS = ['다 읽은 책', '읽고 있는 책', '찜한 책']
const SAVED_KEY = 'savedBookIds'

const toInputDate = (str) => (str ? str.replace(/\./g, '-') : '')
const toDisplayDate = (str) => (str ? str.replace(/-/g, '.') : '20xx. xx. xx')

function getSavedIds() {
  const raw = localStorage.getItem(SAVED_KEY)
  if (raw !== null) return new Set(JSON.parse(raw))
  const all = mockBooks.map(b => b.id)
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
  return saved ?? { status: book.status, startDate: book.startDate || '', endDate: book.endDate || '' }
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

const IconTrash = () => <TrashIcon size={22} color="#999" />
const IconPencil = () => <PencilIcon size={22} color="#999" />

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const book = mockBooks.find(b => b.id === Number(id))

  const [isSaved, setIsSaved] = useState(() => book ? getSavedIds().has(book.id) : false)
  const [bookInfo, setBookInfo] = useState(() => loadBookInfo(Number(id), book ?? {}))
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'info')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [deleteMemoId, setDeleteMemoId] = useState(null)
  const [memos, setMemos] = useState(() => loadMemos(Number(id), book?.memos ?? []))

  const [editStatus, setEditStatus] = useState(bookInfo.status)
  const [editStart, setEditStart] = useState(toInputDate(bookInfo.startDate))
  const [editEnd, setEditEnd] = useState(toInputDate(bookInfo.endDate))

  if (!book) {
    return (
      <div className="book-detail">
        <p style={{ textAlign: 'center', padding: '40px' }}>책을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const openEditSheet = () => {
    setEditStatus(bookInfo.status)
    setEditStart(toInputDate(bookInfo.startDate))
    setEditEnd(toInputDate(bookInfo.endDate))
    setShowEditSheet(true)
  }

  const handleSaveEdit = () => {
    const updated = {
      status: editStatus,
      startDate: editStatus === '찜한 책' ? '' : toDisplayDate(editStart),
      endDate: editStatus === '찜한 책' || editStatus === '읽고 있는 책' ? '' : toDisplayDate(editEnd),
    }
    setBookInfo(updated)
    saveBookInfo(book.id, updated)
    if (!isSaved) {
      addSavedId(book.id)
      setIsSaved(true)
    }
    setShowEditSheet(false)
  }

  const handleDelete = () => {
    removeSavedId(book.id)
    navigate(ROUTES.HOME)
  }

  const handleDeleteMemo = (memoId) => {
    const updated = memos.filter(m => m.id !== memoId)
    setMemos(updated)
    saveMemos(book.id, updated)
    setDeleteMemoId(null)
  }

  return (
    <div className="book-detail">

      {/* 책 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="book-detail__overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <p className="delete-modal__title">내 서재에서 제거</p>
            <p className="delete-modal__desc">삭제 시 복구할 수 없습니다.<br />정말 삭제할까요?</p>
            <div className="delete-modal__line" />
            <div className="delete-modal__actions">
              <button className="delete-modal__btn" onClick={() => setShowDeleteModal(false)}>취소</button>
              <div className="delete-modal__vline" />
              <button className="delete-modal__btn" onClick={handleDelete}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 메모 삭제 확인 모달 */}
      {deleteMemoId !== null && (
        <div className="book-detail__overlay" onClick={() => setDeleteMemoId(null)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <p className="delete-modal__title">메모 삭제</p>
            <p className="delete-modal__desc">삭제 시 복구할 수 없습니다.<br />정말 삭제할까요?</p>
            <div className="delete-modal__line" />
            <div className="delete-modal__actions">
              <button className="delete-modal__btn" onClick={() => setDeleteMemoId(null)}>취소</button>
              <div className="delete-modal__vline" />
              <button className="delete-modal__btn" onClick={() => handleDeleteMemo(deleteMemoId)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 저장/수정 바텀 시트 */}
      {showEditSheet && (
        <div className="book-detail__overlay" onClick={() => setShowEditSheet(false)}>
          <div className="edit-sheet" onClick={e => e.stopPropagation()}>
            <div className="edit-sheet__header">
              <button className="edit-sheet__close" onClick={() => setShowEditSheet(false)}>X</button>
              <span className="edit-sheet__title">어떤 책인가요?</span>
            </div>
            <div className="edit-sheet__section">
              <p className="edit-sheet__label">독서 상태</p>
              <div className="edit-sheet__status-row">
                {STATUS_OPTIONS.map(s => (
                  <Chip key={s} active={editStatus === s} onClick={() => setEditStatus(s)}>{s}</Chip>
                ))}
              </div>
            </div>
            {editStatus !== '찜한 책' && (
              <div className="edit-sheet__section">
                <p className="edit-sheet__label">독서 기간</p>
                <div className="edit-sheet__dates">
                  <div className="edit-sheet__date-group">
                    <p className="edit-sheet__date-label">시작일</p>
                    <input className="edit-sheet__date-input" type="date" value={editStart} onChange={e => setEditStart(e.target.value)} />
                  </div>
                  {editStatus !== '읽고 있는 책' && (
                    <div className="edit-sheet__date-group">
                      <p className="edit-sheet__date-label">종료일</p>
                      <input className="edit-sheet__date-input" type="date" value={editEnd} onChange={e => setEditEnd(e.target.value)} min={editStart} />
                    </div>
                  )}
                </div>
              </div>
            )}
            <button className="edit-sheet__save" onClick={handleSaveEdit}>
              {isSaved ? '수정하기' : '저장하기'}
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="book-detail__header">
        <button className="book-detail__back-btn" onClick={() => navigate(-1)} aria-label="이전">
          <ChevronLeftIcon size={24} color="#000" />
        </button>
        <div className="book-detail__header-actions">
          {isSaved ? (
            showEditSheet ? (
              <button className="book-detail__action-btn" onClick={handleSaveEdit}>저장</button>
            ) : (
              <>
                <button className="book-detail__action-btn" onClick={openEditSheet}>수정</button>
                <span className="book-detail__action-sep"> ㅣ </span>
                <button className="book-detail__action-btn" onClick={() => setShowDeleteModal(true)}>삭제</button>
              </>
            )
          ) : (
            !showEditSheet && (
              <button className="book-detail__action-btn" onClick={openEditSheet}>저장</button>
            )
          )}
        </div>
      </div>

      {/* 책 정보 상단 */}
      <div className="book-detail__top">
        <h2 className="book-detail__title">{book.title}</h2>
        <img className="book-detail__cover" src={book.cover} alt={book.title} />
        <p className="book-detail__author">{book.author}</p>
        {isSaved && (
          <div className="book-detail__status-badge">{bookInfo.status}</div>
        )}
        {isSaved && bookInfo.status !== '찜한 책' && (
          <div className="book-detail__period">
            <span className="book-detail__period-label">독서 기간</span>
            <div className="book-detail__period-dates">
              <span>시작 ｜ {bookInfo.startDate || '20xx. xx. xx'}</span>
              {bookInfo.status === '다 읽은 책' && (
                <span>종료 ｜ {bookInfo.endDate || '20xx. xx. xx'}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 탭 바 */}
      <div className="book-detail__tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`book-detail__tab${activeTab === tab.id ? ' book-detail__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="book-detail__content">
        {activeTab === 'info' && (
          <div className="book-info">
            <div className="book-info__row"><span className="book-info__key">책 소개</span><span className="book-info__val">{book.description}</span></div>
            <div className="book-info__row"><span className="book-info__key">출판사</span><span className="book-info__val">{book.publisher}</span></div>
            <div className="book-info__row"><span className="book-info__key">ISBN</span><span className="book-info__val">{book.isbn}</span></div>
            <div className="book-info__row"><span className="book-info__key">페이지</span><span className="book-info__val">{book.pages}</span></div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="book-chat">
            <button
              className="book-chat__btn"
              onClick={() => navigate(ROUTES.CHAT, { state: { bookId: book.id } })}
            >
              가독이챗 하러 가기
            </button>
          </div>
        )}

        {activeTab === 'memo' && (
          <div className="book-memo">
            <div className="book-memo__toolbar">
              <button
                className="book-memo__write-btn"
                onClick={() => navigate(ROUTES.MEMO_EDIT, { state: { bookId: book.id } })}
              >
                <IconPencil />
                <span>작성하기</span>
              </button>
            </div>
            {memos.length === 0 ? (
              <p className="book-memo__empty">아직 작성한 메모가 없어요.</p>
            ) : (
              <div className="book-memo__list">
                {memos.map(memo => (
                  <div key={memo.id} className="memo-card">
                    <div className="memo-card__top">
                      <p className="memo-card__content">{memo.content}</p>
                      <button className="memo-card__delete" onClick={() => setDeleteMemoId(memo.id)}>
                        <IconTrash />
                      </button>
                    </div>
                    <p className="memo-card__date">{memo.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
