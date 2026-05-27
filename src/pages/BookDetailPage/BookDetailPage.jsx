import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { mockBooks } from '../../data/mockBooks'
import { ROUTES } from '../../constants/routes'
import {
  addMyBook,
  deleteMemo,
  getBookDetail,
  getBookMemos,
  getMyBooks,
  removeMyBook,
  searchBooks,
  updateMyBook,
} from '../../api/bookApi'
import {
  ChevronLeftIcon,
  CheckIcon,
  TrashIcon,
} from '../../assets/icons'
import './BookDetailPage.scss'

const ALERT_ICON_SRC = '/assets/alert-02.svg'
const BOOK_STATE_ICON_SRC = '/assets/library/bookState.svg'
const BOOK_DATE_ICON_SRC = '/assets/library/bookDate.svg'
const CALENDAR_ICON_SRC = '/assets/library/calendar-01.svg'
const EDIT_ICON_SRC = '/assets/library/edit.svg'
const MEMO_WRITE_ICON_SRC = '/assets/library/pencil-edit-02.svg'
const MEMO_CARD_ICON_SRC = '/assets/library/edit.svg'
const SAVE_ICON_SRC = '/assets/library/save.svg'
const BOOK_CHAT_CHARACTER_SRC = '/assets/shop/character.svg'
const DEFAULT_HERO_RGB = '184, 215, 189'

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
const FALLBACK_COVER = '/assets/library/book.svg'

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
    status: book.status || BOOK_STATUS.finished,
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

function getUserId() {
  const stored = localStorage.getItem('userId')
  return stored ? Number(stored) : null
}

function normalizeDate(str) {
  return toDisplayDate(str) || str || ''
}

function normalizeStatus(status) {
  if (String(status).includes('읽고') || status === 'READING') return BOOK_STATUS.reading
  if (String(status).includes('찜') || status === 'WISH' || status === 'WISHLIST' || status === 'FAVORITE') return BOOK_STATUS.favorite
  if (status === 'DONE' || status === 'COMPLETED') return BOOK_STATUS.finished
  return status || BOOK_STATUS.finished
}

function toApiStatus(status) {
  if (status === BOOK_STATUS.favorite) return 'WISHLIST'
  if (status === BOOK_STATUS.reading) return 'READING'
  return 'DONE'
}

function toApiDate(str) {
  if (!str) return null
  const inputDate = toInputDate(str)
  return inputDate || null
}

function toNumberId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function isIsbnLike(value) {
  const normalized = String(value ?? '').replace(/-/g, '')
  return /^(?:\d{10}|\d{13}|\d{9}X)$/i.test(normalized)
}

function normalizeBook(raw) {
  const source = raw?.book ?? raw
  const original = raw?.raw?.book ?? raw?.raw ?? {}
  return {
    id: raw?.mainId ?? raw?.mainStudyId ?? raw?.main_id ?? raw?.bookId ?? raw?.book_id ?? raw?.id ?? source?.id ?? source?.isbn13 ?? source?.isbn ?? original?.isbn13 ?? original?.isbn,
    mainId: raw?.mainId ?? raw?.mainStudyId ?? raw?.main_id ?? source?.mainId ?? original?.mainId ?? null,
    bookId: raw?.bookId ?? raw?.book_id ?? source?.bookId ?? source?.book_id ?? original?.bookId ?? original?.book_id ?? null,
    isbn: source?.isbn13 ?? source?.isbn ?? raw?.isbn13 ?? raw?.isbn ?? original?.isbn13 ?? original?.isbn,
    title: source?.title ?? raw?.title ?? original?.title ?? '제목 없음',
    author: source?.author ?? raw?.author ?? original?.author ?? '',
    category: source?.categoryName ?? source?.category ?? raw?.categoryName ?? raw?.category ?? original?.categoryName ?? original?.category ?? '',
    cover: source?.coverUrl ?? source?.cover_url ?? source?.cover ?? source?.coverImage ?? source?.thumbnail ?? raw?.coverUrl ?? raw?.cover_url ?? raw?.cover ?? raw?.coverImage ?? raw?.thumbnail ?? original?.coverUrl ?? original?.cover_url ?? original?.cover ?? original?.coverImage ?? original?.thumbnail ?? FALLBACK_COVER,
    status: normalizeStatus(raw?.readingStatus ?? raw?.reading_status ?? raw?.status ?? source?.readingStatus ?? source?.status ?? original?.readingStatus ?? original?.status),
    startDate: normalizeDate(raw?.startDate ?? raw?.startedAt ?? raw?.readStartDate ?? source?.startDate ?? original?.startDate),
    endDate: normalizeDate(raw?.endDate ?? raw?.finishedAt ?? raw?.readEndDate ?? source?.endDate ?? original?.endDate),
    description: source?.bookIntro ?? source?.book_intro ?? source?.description ?? raw?.bookIntro ?? raw?.book_intro ?? raw?.description ?? original?.bookIntro ?? original?.book_intro ?? original?.description ?? '',
    publisher: source?.publisher ?? raw?.publisher ?? original?.publisher ?? '',
    publishYear: source?.publishYear ?? source?.pubDate ?? raw?.publishYear ?? raw?.pubDate ?? original?.publishYear ?? original?.pubDate ?? '',
    isbn13: source?.isbn13 ?? raw?.isbn13 ?? original?.isbn13,
    pages: source?.pageCount ?? source?.page_count ?? source?.pages ?? source?.page ?? raw?.pageCount ?? raw?.page_count ?? raw?.pages ?? raw?.page ?? original?.pageCount ?? original?.page_count ?? original?.pages ?? original?.page ?? '',
    currentPage: raw?.currentPage ?? source?.currentPage,
    inMyStudy: raw?.inMyStudy ?? source?.inMyStudy ?? Boolean(raw?.mainId ?? raw?.mainStudyId ?? raw?.main_id),
    memos: source?.memos ?? raw?.memos ?? [],
    raw,
  }
}

function clampColor(value) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function softenColor({ r, g, b }) {
  const mix = 0.56
  return {
    r: clampColor(r * (1 - mix) + 255 * mix),
    g: clampColor(g * (1 - mix) + 255 * mix),
    b: clampColor(b * (1 - mix) + 255 * mix),
  }
}

function extractCoverHeroRgb(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Missing cover source'))
      return
    }

    const image = new Image()
    const isRemote = /^https?:\/\//i.test(src)

    if (isRemote) {
      image.crossOrigin = 'anonymous'
      image.referrerPolicy = 'no-referrer'
    }

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const width = 40
        const height = Math.max(40, Math.round(width * (image.naturalHeight / image.naturalWidth || 1.5)))
        const context = canvas.getContext('2d', { willReadFrequently: true })

        canvas.width = width
        canvas.height = height
        context.drawImage(image, 0, 0, width, height)

        const { data } = context.getImageData(0, 0, width, height)
        let rTotal = 0
        let gTotal = 0
        let bTotal = 0
        let weightTotal = 0

        for (let index = 0; index < data.length; index += 4) {
          const r = data[index]
          const g = data[index + 1]
          const b = data[index + 2]
          const alpha = data[index + 3]
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const brightness = (r + g + b) / 3
          const saturation = max === 0 ? 0 : (max - min) / max

          if (alpha < 180 || brightness > 242 || brightness < 24 || saturation < 0.08) continue

          const weight = 0.6 + saturation
          rTotal += r * weight
          gTotal += g * weight
          bTotal += b * weight
          weightTotal += weight
        }

        if (!weightTotal) {
          reject(new Error('No usable cover pixels'))
          return
        }

        const color = softenColor({
          r: rTotal / weightTotal,
          g: gTotal / weightTotal,
          b: bTotal / weightTotal,
        })

        resolve(`${color.r}, ${color.g}, ${color.b}`)
      } catch (error) {
        reject(error)
      }
    }

    image.onerror = reject
    image.src = src
  })
}

function getMainId(raw) {
  return raw?.mainId ?? raw?.mainStudyId ?? raw?.main_id ?? raw?.data?.mainId ?? raw?.data?.main_id ?? null
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

function sameBook(a, b) {
  const aIsbn = String(a?.isbn ?? '')
  const bIsbn = String(b?.isbn ?? '')
  const aBookId = String(a?.bookId ?? '')
  const bBookId = String(b?.bookId ?? '')

  return Boolean(
    (aIsbn && bIsbn && aIsbn === bIsbn) ||
    (aBookId && bBookId && aBookId === bBookId)
  )
}

function sameBookRoute(item, routeId) {
  const id = String(routeId ?? '')
  if (!id) return false
  return [item?.mainId, item?.bookId, item?.id, item?.isbn].some((value) => String(value ?? '') === id)
}

function normalizeMatchText(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase()
}

function sameBookTitle(a, b) {
  const aTitle = normalizeMatchText(a?.title)
  const bTitle = normalizeMatchText(b?.title)
  return Boolean(aTitle && bTitle && aTitle === bTitle)
}

function compactTitle(title) {
  return String(title || '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getTitleSearchQueries(book) {
  const title = compactTitle(book?.title || book?.raw?.title)
  if (!title) return []

  const shortTitle = title.split(/\s[-–—]\s|[:：]/)[0]?.trim()
  return [...new Set([shortTitle, title].filter(Boolean))]
}

function hasDetailFields(book) {
  const hasIntro = Boolean(String(book?.description ?? '').trim())
  const hasPages = Boolean(parsePageCount(book?.pages))
  const hasPublishYear = Boolean(String(book?.publishYear ?? '').trim())

  return Boolean(book?.isbn && (hasIntro || hasPages || hasPublishYear))
}

function mergeBookDetail(baseBook, detailBook) {
  const cover = detailBook.cover && detailBook.cover !== FALLBACK_COVER ? detailBook.cover : baseBook.cover

  return normalizeBook({
    ...baseBook,
    ...detailBook,
    id: baseBook.id ?? detailBook.id,
    mainId: baseBook.mainId ?? detailBook.mainId,
    bookId: baseBook.bookId ?? detailBook.bookId,
    isbn: detailBook.isbn ?? baseBook.isbn,
    title: detailBook.title || baseBook.title,
    author: detailBook.author || baseBook.author,
    publisher: detailBook.publisher || baseBook.publisher,
    cover,
    coverUrl: cover,
    description: detailBook.description || baseBook.description,
    bookIntro: detailBook.description || baseBook.description,
    pages: detailBook.pages || baseBook.pages,
    pageCount: detailBook.pages || baseBook.pages,
    publishYear: detailBook.publishYear || baseBook.publishYear,
    readingStatus: baseBook.raw?.readingStatus ?? baseBook.raw?.reading_status ?? baseBook.status,
    status: baseBook.status ?? detailBook.status,
    startDate: baseBook.startDate ?? detailBook.startDate,
    endDate: baseBook.endDate ?? detailBook.endDate,
  })
}

function mergeSavedBookDetail(detailBook, savedBook) {
  return normalizeBook({
    ...detailBook,
    mainId: savedBook.mainId ?? detailBook.mainId,
    bookId: detailBook.bookId ?? savedBook.bookId,
    id: detailBook.id ?? savedBook.id,
    inMyStudy: true,
    readingStatus: savedBook.raw?.readingStatus ?? savedBook.raw?.reading_status ?? savedBook.status,
    status: savedBook.status ?? detailBook.status,
    startDate: savedBook.startDate ?? detailBook.startDate,
    endDate: savedBook.endDate ?? detailBook.endDate,
  })
}

async function findExternalBookDetail(book, userId) {
  const queries = getTitleSearchQueries(book)
  if (queries.length === 0) return null

  for (const query of queries) {
    try {
      const results = toArray(await searchBooks(query, { userId, queryType: 'Title', size: 10 })).map(normalizeBook)
      const matchedBook = results.find((item) => sameBook(item, book)) ??
        results.find((item) => sameBookTitle(item, book)) ??
        results[0] ??
        null

      if (matchedBook) return matchedBook
    } catch {
      // Try a shorter or normalized title candidate.
    }
  }

  return null
}

async function getSavedBookDetail(savedBook, userId) {
  const directIds = [savedBook?.isbn].filter(isIsbnLike)
  let fallbackDetail = null

  try {
    const externalDetail = await findExternalBookDetail(savedBook, userId)
    if (externalDetail) {
      fallbackDetail = mergeBookDetail(savedBook, externalDetail)
      if (hasDetailFields(fallbackDetail)) return fallbackDetail
    }
  } catch {
    // Fall back to the book detail endpoint below.
  }

  for (const detailId of directIds) {
    try {
      const detailBook = normalizeBook(await getBookDetail(detailId, userId))
      fallbackDetail = fallbackDetail ? mergeBookDetail(fallbackDetail, detailBook) : detailBook
      if (hasDetailFields(fallbackDetail)) return fallbackDetail
    } catch {
      // Try the next available ISBN.
    }
  }

  if (fallbackDetail) return fallbackDetail

  throw new Error('책 정보를 불러오지 못했습니다.')
}

function normalizeMemos(data) {
  const list = Array.isArray(data)
    ? data
    : data?.memos ?? data?.content ?? data?.items ?? []

  return list.map((memo) => ({
    id: memo.memoId ?? memo.id,
    title: memo.title ?? '',
    content: memo.content ?? memo.text ?? '',
    date: normalizeDate(memo.date ?? memo.createdAt ?? memo.updatedAt),
  }))
}

function getMemoPreview(memo) {
  if (memo?.title) return memo.title

  const content = memo?.content
  if (!content) return ''

  const doc = new DOMParser().parseFromString(content, 'text/html')
  const text = doc.body.textContent || content

  return String(text).split(/\r?\n/).find((line) => line.trim())?.trim() ?? ''
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
  const userId = getUserId()
  const initialBook = location.state?.book
    ? normalizeBook(location.state.book)
    : mockBooks.find((item) => item.id === Number(id))
  const fromSearch = Boolean(location.state?.fromSearch)
  const fromSavedLibrary = Boolean(location.state?.fromLibrary && !fromSearch)
  const initiallySaved = Boolean(
    initialBook &&
    (
      fromSavedLibrary ||
      initialBook.inMyStudy ||
      initialBook.mainId ||
      (!fromSearch && getSavedIds().has(initialBook.id))
    )
  )
  const detailLookupId = [initialBook?.isbn, id].find(isIsbnLike)
  const shouldFetchBookDetail = Boolean(
    userId &&
    detailLookupId &&
    !(fromSearch && initialBook && hasDetailFields(initialBook))
  )
  const [book, setBook] = useState(initialBook ?? null)
  const [loading, setLoading] = useState(Boolean(userId && id))
  const [error, setError] = useState('')

  const [isSaved, setIsSaved] = useState(initiallySaved)
  const isSavedView = isSaved || initiallySaved
  const [bookInfo, setBookInfo] = useState(() => loadBookInfo(Number(id), book ?? {}))
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'info')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [creatingChatRoom, setCreatingChatRoom] = useState(false)
  const [deleteMemoId, setDeleteMemoId] = useState(null)
  const [memos, setMemos] = useState(() => loadMemos(Number(id), book?.memos ?? []))
  const [heroRgb, setHeroRgb] = useState(DEFAULT_HERO_RGB)

  const [editStatus, setEditStatus] = useState(bookInfo.status)
  const [editStart, setEditStart] = useState(toInputDate(bookInfo.startDate))
  const [editEnd, setEditEnd] = useState(toInputDate(bookInfo.endDate))

  useLayoutEffect(() => {
    const nextBookInfo = loadBookInfo(Number(id), initialBook ?? {})

    setBook(initialBook ?? null)
    setLoading(Boolean(userId && id))
    setIsSaved(initiallySaved)
    setBookInfo(nextBookInfo)
    setActiveTab(location.state?.tab ?? 'info')
    setMemos(loadMemos(Number(id), initialBook?.memos ?? []))
    setEditStatus(nextBookInfo.status)
    setEditStart(toInputDate(nextBookInfo.startDate))
    setEditEnd(toInputDate(nextBookInfo.endDate))
  }, [id, location.key])

  useEffect(() => {
    if (!userId || !id) {
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([
      shouldFetchBookDetail
        ? getBookDetail(detailLookupId, userId).then((data) => ({ data, detailId: detailLookupId })).catch(() => null)
        : Promise.resolve(null),
      getMyBooks(userId).then((data) => toArray(data).map(normalizeBook)).catch(() => []),
    ])
      .then(async ([detailResult, myBooks]) => {
        if (cancelled) return
        let savedBook = null
        let nextBook = detailResult ? normalizeBook(detailResult.data) : initialBook ?? null

        if (nextBook) {
          savedBook = myBooks.find((item) => sameBook(item, nextBook) || sameBookRoute(item, id))
        } else {
          savedBook = myBooks.find((item) => sameBookRoute(item, id))
        }

        if (savedBook) {
          if (!nextBook || (!fromSearch && !hasDetailFields(nextBook))) {
            try {
              nextBook = await getSavedBookDetail(savedBook, userId)
            } catch {
              nextBook = nextBook ?? savedBook
            }
          }
        }

        if (!nextBook) {
          throw new Error('책 정보를 불러오지 못했습니다.')
        }

        if (savedBook) nextBook = mergeSavedBookDetail(nextBook, savedBook)

        setBook(nextBook)
        setIsSaved(Boolean(nextBook.inMyStudy || nextBook.mainId))
        setBookInfo({
          status: nextBook.status || BOOK_STATUS.finished,
          startDate: nextBook.startDate,
          endDate: nextBook.endDate,
        })
        setEditStatus(nextBook.status || BOOK_STATUS.finished)
        setEditStart(toInputDate(nextBook.startDate))
        setEditEnd(toInputDate(nextBook.endDate))
      })
      .catch((err) => {
        if (!cancelled) {
          setBook(null)
          setIsSaved(false)
          setError(err?.message ?? '책 정보를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [detailLookupId, fromSearch, id, shouldFetchBookDetail, userId])

  useEffect(() => {
    if (!userId || !book?.mainId) return undefined

    let cancelled = false
    getBookMemos(book.mainId)
      .then((data) => {
        if (!cancelled) setMemos(normalizeMemos(data))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [book?.mainId, userId])

  useEffect(() => {
    let cancelled = false
    setHeroRgb(DEFAULT_HERO_RGB)

    extractCoverHeroRgb(book?.cover)
      .then((rgb) => {
        if (!cancelled) setHeroRgb(rgb)
      })
      .catch(() => {
        if (!cancelled) setHeroRgb(DEFAULT_HERO_RGB)
      })

    return () => {
      cancelled = true
    }
  }, [book?.cover])

  if (!book) {
    return (
      <main className="book-detail book-detail--empty">
        <p>{loading ? '책 정보를 불러오는 중이에요.' : error || '책을 찾을 수 없어요.'}</p>
      </main>
    )
  }

  const openEditSheet = () => {
    setEditStatus(bookInfo.status)
    setEditStart(toInputDate(bookInfo.startDate))
    setEditEnd(toInputDate(bookInfo.endDate))
    setShowEditSheet(true)
  }

  const handleSaveEdit = async () => {
    const today = new Date().toISOString().slice(0, 10)
    const startDate = editStart || today
    const endDate = editEnd || startDate

    const updated = {
      status: editStatus,
      startDate: editStatus === BOOK_STATUS.favorite ? '' : toDisplayDate(startDate),
      endDate: editStatus === BOOK_STATUS.finished ? toDisplayDate(endDate) : '',
    }

    setBookInfo(updated)
    if (!userId) {
      saveBookInfo(book.id, updated)
      if (!isSavedView) {
        addSavedId(book.id)
        setIsSaved(true)
      }
    } else {
      const apiStartDate = updated.status === BOOK_STATUS.favorite ? null : toApiDate(updated.startDate)
      const apiEndDate = updated.status === BOOK_STATUS.finished ? toApiDate(updated.endDate) : null
      const payload = {
        isbn: book.isbn ?? id,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        coverUrl: book.cover,
        bookIntro: book.description,
        pageCount: parsePageCount(book.pages) || null,
        readingStatus: toApiStatus(updated.status),
        startDate: apiStartDate,
        endDate: apiEndDate,
        start_date: apiStartDate,
        end_date: apiEndDate,
      }
      const updatePayload = {
        readingStatus: payload.readingStatus,
        start_date: apiStartDate,
        end_date: apiEndDate,
      }
      const targetMainId = book.mainId ?? (isSavedView ? toNumberId(id) : null)

      try {
        const saved = targetMainId
          ? await updateMyBook(targetMainId, userId, updatePayload)
          : await addMyBook(userId, payload)
        const nextBook = normalizeBook({
          ...book,
          ...saved,
          ...payload,
          mainId: getMainId(saved) ?? targetMainId ?? book.mainId,
          inMyStudy: true,
          readingStatus: payload.readingStatus,
          status: updated.status,
          startDate: apiStartDate,
          endDate: apiEndDate,
        })
        setBook(nextBook)
        setBookInfo({
          status: updated.status,
          startDate: normalizeDate(apiStartDate),
          endDate: normalizeDate(apiEndDate),
        })
        setEditStatus(updated.status)
        setEditStart(toInputDate(apiStartDate))
        setEditEnd(toInputDate(apiEndDate))
        setIsSaved(true)
      } catch (err) {
        setError(err?.message ?? '책 정보를 저장하지 못했습니다.')
        return
      }
    }

    setShowEditSheet(false)
  }

  const handleCloseEditSheet = () => {
    handleSaveEdit()
  }

  const handleDelete = async () => {
    if (userId && book.mainId) {
      try {
        await removeMyBook(book.mainId, userId)
      } catch (err) {
        setError(err?.message ?? '책을 삭제하지 못했습니다.')
        setShowDeleteModal(false)
        return
      }
    } else {
      removeSavedId(book.id)
    }
    navigate(ROUTES.HOME)
  }

  const handleDeleteMemo = async (memoId) => {
    if (userId) {
      try {
        await deleteMemo(memoId)
      } catch {
        setDeleteMemoId(null)
        return
      }
    }
    const updated = memos.filter((memo) => memo.id !== memoId)
    setMemos(updated)
    if (!userId) saveMemos(book.id, updated)
    setDeleteMemoId(null)
  }

  const handleStatusChange = (status) => {
    setEditStatus(status)
    if (status === BOOK_STATUS.finished && !editEnd) {
      setEditEnd(editStart || new Date().toISOString().slice(0, 10))
    }
  }

  const chatBookId = toNumberId(book.bookId) ?? toNumberId(book.raw?.bookId) ?? toNumberId(book.raw?.book_id) ?? toNumberId(book.id)
  const memoRouteId = id
  const memoStorageId = book.id ?? id

  const handleStartBookChat = () => {
    if (!userId || !chatBookId || creatingChatRoom) return

    navigate(ROUTES.CHAT, {
      state: {
        bookId: chatBookId,
        source: 'book-detail',
      },
    })
  }

  const renderStatusIcon = () => {
    if (bookInfo.status === BOOK_STATUS.favorite) {
      return (
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M14.3147 24.9556C10.4355 22.0547 2.75 15.4229 2.75 9.4549C2.75 5.5102 5.6447 2.3125 9.625 2.3125C11.6875 2.3125 13.75 3 16.5 5.75C19.25 3 21.3125 2.3125 23.375 2.3125C27.3553 2.3125 30.25 5.5102 30.25 9.4549C30.25 15.4229 22.5645 22.0547 18.6853 24.9556C17.3799 25.9317 15.6201 25.9317 14.3147 24.9556Z"
            transform="translate(0 2.5)"
            fill="#F8BC0A"
            stroke="#F8BC0A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }

    if (bookInfo.status === BOOK_STATUS.reading) {
      return (
        <svg width="33" height="33" viewBox="22.25 15.25 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="38.75" cy="31.75" r="13.75" fill="#F8BC0A" />
          <path d="M38.75 26.25V32.4375" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M38.75 37.2339V37.2476" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }

    return (
      <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M30.25 16.5C30.25 8.90608 24.0939 2.75 16.5 2.75C8.90608 2.75 2.75 8.90608 2.75 16.5C2.75 24.0939 8.90608 30.25 16.5 30.25C24.0939 30.25 30.25 24.0939 30.25 16.5Z"
          fill="#F8BC0A"
        />
        <path
          d="M11 17.1875L14.4375 20.625L22 12.375"
          stroke="#FEFEFE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <main className="book-detail">
      {showDeleteModal && (
        <div className="book-detail__overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(event) => event.stopPropagation()}>
            <img className="delete-modal__alert" src={ALERT_ICON_SRC} alt="" aria-hidden="true" />
            <p className="delete-modal__title">내 서재에서 제거</p>
            <p className="delete-modal__desc">삭제 후에는 복구할 수 없습니다.</p>
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
            <p className="delete-modal__desc">삭제 후에는 복구할 수 없습니다.</p>
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
              <h2>어떤 책인가요?</h2>
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

      <section
        className={`book-detail__hero${!isSavedView ? ' book-detail__hero--unsaved' : ''}`}
        style={{ '--book-hero-rgb': heroRgb }}
      >
        <div className="book-detail__topbar">
          <button className="book-detail__round-btn" type="button" onClick={() => navigate('/home')} aria-label="이전">
            <ChevronLeftIcon size={24} color="#141B34" />
          </button>

          {isSavedView ? (
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
          ) : (
            <button
              className="book-detail__round-btn"
              type="button"
              onClick={openEditSheet}
              aria-label="내 서재에 저장"
            >
              <img src={SAVE_ICON_SRC} alt="" aria-hidden="true" />
            </button>
          )}
        </div>

        <img className="book-detail__cover" src={book.cover} alt={book.title} />

        <div className="book-detail__hero-info">
          <div className="book-detail__summary">
            <h1>{book.title}</h1>
            <p>{book.author}</p>
          </div>

          {isSavedView && (
            <div className={`book-detail__meta-cards${bookInfo.status === BOOK_STATUS.favorite ? ' book-detail__meta-cards--single' : ''}`}>
              <button
                className={`book-detail__status-card${
                  bookInfo.status === BOOK_STATUS.favorite ? ' book-detail__status-card--favorite' : ''
                }${bookInfo.status === BOOK_STATUS.reading ? ' book-detail__status-card--reading' : ''}${
                  bookInfo.status === BOOK_STATUS.finished ? ' book-detail__status-card--finished' : ''
                }`}
                type="button"
                onClick={openEditSheet}
              >
                <span
                  className={`book-detail__check${
                    bookInfo.status === BOOK_STATUS.favorite ? ' book-detail__check--favorite' : ''
                  }${bookInfo.status === BOOK_STATUS.reading ? ' book-detail__check--reading' : ''}`}
                >
                  {renderStatusIcon()}
                </span>
                <span className="book-detail__status-label">{bookInfo.status}</span>
              </button>

              {bookInfo.status !== BOOK_STATUS.favorite && (
                <div className="book-detail__date-card">
                  <span>시작 ㅣ {bookInfo.startDate || '2026. 05. 05'}</span>
                  <span>
                    종료 ㅣ {bookInfo.status === BOOK_STATUS.finished ? bookInfo.endDate || '2026. 05. 20' : '2026. --. --'}
                  </span>
                </div>
              )}
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

          </div>
        )}

        {activeTab === 'chat' && (
          <div className="book-chat">
            <div className="book-chat__bubble" aria-hidden="true">
              나랑 책 이야기하자
            </div>
            <div className="book-chat__character-wrap" aria-hidden="true">
              <span className="book-chat__glow" />
              <img className="book-chat__character" src={BOOK_CHAT_CHARACTER_SRC} alt="" />
            </div>
            <button
              className="book-chat__cta"
              type="button"
              onClick={handleStartBookChat}
              disabled={!chatBookId || creatingChatRoom}
            >
              {creatingChatRoom ? '채팅방 생성 중' : '가독이챗 하러 가기'}
            </button>
          </div>
        )}

        {activeTab === 'memo' && (
          <div className="book-memo">
            <header className="book-memo__header">
              <h2>최근 작성한 메모</h2>
              <button
                className="book-memo__write-btn"
                type="button"
                onClick={() => navigate(ROUTES.MEMO_EDIT, {
                  state: {
                    bookId: memoStorageId,
                    routeBookId: memoRouteId,
                    mainId: book.mainId,
                  },
                })}
                aria-label="메모 작성하기"
              >
                <img src={MEMO_WRITE_ICON_SRC} alt="" aria-hidden="true" />
              </button>
            </header>

            {memos.length === 0 ? (
              <p className="book-memo__empty">아직 작성한 메모가 없어요.</p>
            ) : (
              <div className="book-memo__list">
                {memos.map((memo) => (
                  <article
                    key={memo.id}
                    className="memo-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(ROUTES.MEMO_EDIT, {
                      state: {
                        bookId: memoStorageId,
                        routeBookId: memoRouteId,
                        mainId: book.mainId,
                        memo,
                        mode: 'view',
                      },
                    })}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      navigate(ROUTES.MEMO_EDIT, {
                        state: {
                          bookId: memoStorageId,
                          routeBookId: memoRouteId,
                          mainId: book.mainId,
                          memo,
                          mode: 'view',
                        },
                      })
                    }}
                  >
                    <span className="memo-card__edit" aria-hidden="true">
                      <img src={MEMO_CARD_ICON_SRC} alt="" aria-hidden="true" />
                    </span>
                    <span className="memo-card__preview">
                      <span>{getMemoPreview(memo)}</span>
                    </span>
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
