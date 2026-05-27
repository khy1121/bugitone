import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import ChatLoadingDots from '../../components/common/ChatLoadingDots/ChatLoadingDots'
import Loading from '../../components/common/LoadingSpinner/LoadingSpinner'
import { ArrowUpIcon } from '../../assets/icons'
import useKeyboardAwareInput from '../../hooks/useKeyboardAwareInput'
import {
  getRoomList,
  searchRoomList,
  createRoom,
  createNoBookRoom,
  getMessages,
  sendMessage,
  deleteRoom,
} from '../../api/chatApi'
import { ROUTES } from '../../constants/routes'
import './ChatPage.scss'

const LANDING_CHAR_IMG = '/assets/character/character.svg'
const CHAT_CHAR_IMG = '/assets/chatPage/chat_char.svg'
const MAX_INPUT_HEIGHT = 380
const QUICK_ACTIONS = [
  '가독이와 토론하기',
  '가독이와 감상문쓰기',
  '가독이에게 책 추천받기',
]

// 로그인 안 된 경우 null 반환 (1 폴백 제거 — 존재하지 않는 userId로 API 호출 방지)
const getUserId = () => {
  const stored = localStorage.getItem('userId')
  const id = Number(stored)
  return stored && id > 0 ? id : null
}

const toMsg = (m) => ({
  id: m.messageId ?? m.id ?? `${m.role}-${m.createdAt ?? Date.now()}`,
  role: String(m.role ?? '').toLowerCase() === 'ai' ? 'ai' : 'user',
  text: m.content ?? '',
})

const toNumberId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

/* ==============================
   Icons
============================== */

function MenuIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M4.3335 5.41602L21.6668 5.41602" stroke="#42403A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.3335 13L21.6668 13" stroke="#42403A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.3335 20.582L21.6668 20.582" stroke="#42403A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 17L21 21" stroke="#8E8B7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke="#8E8B7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="#42403A" strokeWidth="1.8" />
      <rect x="10.5" y="10.5" width="7" height="7" rx="2" fill="#42403A" />
    </svg>
  )
}

function ChatIcon({ active = false }) {
  const stroke = active ? '#141B34' : '#42403A'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {active && (
        <path
          d="M21 12.5C21 17.7467 16.7467 22 11.5 22C9.87187 22 8.3394 21.5904 7 20.8687C5.13177 19.862 3.87462 20.7979 2.76592 20.9658C2.59774 20.9913 2.43024 20.9302 2.30997 20.81C2.12741 20.6274 2.09266 20.3451 2.1935 20.1074C2.62865 19.0818 3.0282 17.1382 2.48341 15.5C2.1698 14.557 2 13.5483 2 12.5C2 7.25329 6.25329 3 11.5 3C16.7467 3 21 7.25329 21 12.5Z"
          fill="#F8BC0A"
        />
      )}
      <path d="M11.5052 12.5H11.5142M15.5007 12.5H15.5097M7.50973 12.5H7.5187" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12.5C21 17.7467 16.7467 22 11.5 22C9.87187 22 8.3394 21.5904 7 20.8687C5.13177 19.862 3.87462 20.7979 2.76592 20.9658C2.59774 20.9913 2.43024 20.9302 2.30997 20.81C2.12741 20.6274 2.09266 20.3451 2.1935 20.1074C2.62865 19.0818 3.0282 17.1382 2.48341 15.5C2.1698 14.557 2 13.5483 2 12.5C2 7.25329 6.25329 3 11.5 3C16.7467 3 21 7.25329 21 12.5Z" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HighlightedText({ text, query }) {
  if (!query || !text.includes(query)) return text
  const parts = text.split(query)
  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          {part}
          {index < parts.length - 1 && <strong>{query}</strong>}
        </React.Fragment>
      ))}
    </>
  )
}

/* ==============================
   Chat List (Drawer)
============================== */

function ChatList({ open, onClose, onSelectChat }) {
  const panelRef = useRef(null)
  const searchRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [rooms, setRooms] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)

  const userId = getUserId()
  const normalizedQuery = searchQuery.trim()
  const keyboard = useKeyboardAwareInput({
    scrollRef: panelRef,
    targetRef: searchRef,
  })

  // 드로어가 열릴 때 목록 로드 (userId 없으면 빈 목록)
  useEffect(() => {
    if (!open || !userId) return

    setListLoading(true)
    getRoomList(userId)
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setListLoading(false))
  }, [open, userId])

  // 검색어 디바운스 처리
  useEffect(() => {
    if (!open || !userId) return

    if (!normalizedQuery) {
      setListLoading(true)
      getRoomList(userId)
        .then(setRooms)
        .catch(() => setRooms([]))
        .finally(() => setListLoading(false))
      return
    }

    const timer = window.setTimeout(() => {
      setListLoading(true)
      searchRoomList(userId, normalizedQuery)
        .then(setRooms)
        .catch(() => setRooms([]))
        .finally(() => setListLoading(false))
    }, 300)

    return () => window.clearTimeout(timer)
  }, [normalizedQuery, open, userId])

  const handleChatClick = (room) => {
    setActiveChatId(room.roomId)
    window.setTimeout(() => {
      onSelectChat({ id: room.roomId, preview: room.topic, bookId: room.bookId })
    }, 100)
  }

  const handleDelete = async (e, roomId) => {
    e.stopPropagation()
    try {
      await deleteRoom(roomId, userId)
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId))
    } catch {
      // 삭제 실패 시 무시
    }
  }

  return (
    <section
      className={`chat-list${open ? ' chat-list--open' : ''}`}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div className="chat-list__inner">
        <div className="chat-list__dim" aria-hidden="true" />

        <div
          ref={panelRef}
          className={`chat-list__panel${keyboard.isKeyboardFocused ? ' chat-list__panel--keyboard' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="최근 대화 목록"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="chat-list__header">
            <h1 className="chat-list__title">최근 대화 목록</h1>

            <button
              className="chat-list__menu-btn"
              type="button"
              aria-label="닫기"
              onClick={onClose}
            >
              <MenuIcon />
            </button>
          </header>

          <label
            ref={searchRef}
            className={`chat-list__search${normalizedQuery ? ' chat-list__search--active' : ''}`}
          >
            <span className="sr-only">채팅 검색</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={keyboard.handleFocus}
              onBlur={keyboard.handleBlur}
              placeholder="채팅 검색"
            />
            <SearchIcon />
          </label>

          <div className="chat-list__body" aria-label="최근 대화">
            {listLoading && (
              <div className="chat-list__loading">
                <Loading size={32} />
              </div>
            )}

            {!listLoading && rooms.length === 0 && (
              <p className="chat-list__empty">
                {normalizedQuery ? '검색 결과가 없어요.' : '대화 내역이 없어요.'}
              </p>
            )}

            {!listLoading && rooms.map((room) => {
              const active = room.roomId === activeChatId
              return (
                <button
                  key={room.roomId}
                  type="button"
                  className={`chat-list__item${active ? ' chat-list__item--active' : ''}`}
                  onClick={() => handleChatClick(room)}
                >
                  <span className="chat-list__item-icon">
                    <ChatIcon active={active} />
                  </span>

                  <span className="chat-list__item-preview">
                    <HighlightedText text={room.topic ?? '(제목 없음)'} query={normalizedQuery} />
                  </span>

                  <button
                    className="chat-list__item-delete"
                    type="button"
                    aria-label="채팅방 삭제"
                    onClick={(e) => handleDelete(e, room.roomId)}
                  >
                    ×
                  </button>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ==============================
   Chat Room
============================== */

function ChatRoom({ initialChat, bookId: propBookId, onOpenDrawer, onBack }) {
  const [activeRoomId, setActiveRoomId] = useState(initialChat?.id ?? null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [sendError, setSendError] = useState('')

  const roomRef = useRef(null)
  const inputWrapRef = useRef(null)
  const inputRef = useRef(null)
  const messagesRef = useRef(null)
  const quickActionsRef = useRef(null)
  const quickDragRef = useRef({
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
  })

  const userId = getUserId()
  const bookId = toNumberId(propBookId ?? initialChat?.bookId)
  const keyboard = useKeyboardAwareInput({ scrollOnFocus: false })

  const isTyping = input.length > 0
  const canSend = input.trim().length > 0
  const isLanding = messages.length === 0 && !loading && !pageLoading

  // 기존 채팅방 선택 시 메시지 내역 로드
  useEffect(() => {
    if (!initialChat?.id) return

    setActiveRoomId(initialChat.id)
    setPageLoading(true)
    getMessages(initialChat.id, userId)
      .then((msgs) => setMessages(msgs.map(toMsg)))
      .catch(() => setMessages([]))
      .finally(() => setPageLoading(false))
  }, [initialChat?.id, userId])

  const syncInputHeight = () => {
    const room = roomRef.current
    const inputWrap = inputWrapRef.current
    if (!room || !inputWrap) return

    // Keep the message area reserved space matched to the real textarea height.
    const height = Math.ceil(inputWrap.getBoundingClientRect().height)
    room.style.setProperty('--chat-input-height', `${height}px`)
  }

  useEffect(() => {
    syncInputHeight()

    const inputWrap = inputWrapRef.current
    if (!inputWrap || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(syncInputHeight)
    observer.observe(inputWrap)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const messagesEl = messagesRef.current
    if (!messagesEl) return

    messagesEl.scrollTo({
      top: messagesEl.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, loading])

  const resetInputHeight = () => {
    if (!inputRef.current) return
    inputRef.current.style.height = 'auto'
    requestAnimationFrame(syncInputHeight)
  }

  const resizeInput = () => {
    const textarea = inputRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_INPUT_HEIGHT)}px`
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    requestAnimationFrame(() => {
      resizeInput()
      syncInputHeight()
    })
  }

  const sendChatMessage = async (rawText) => {
    const text = rawText.trim()
    if (!text || loading) return
    setSendError('')

    setInput('')
    resetInputHeight()
    inputRef.current?.blur()

    const tempId = `temp-${Date.now()}`
    setMessages((prev) => [...prev, { id: tempId, role: 'user', text }])
    setLoading(true)

    try {
      let roomId = activeRoomId

      // 첫 메시지: 채팅방 먼저 생성
      if (!roomId) {
        const room = bookId
          ? await createRoom({ userId, bookId, topic: text })
          : await createNoBookRoom({ userId, topic: text })
        roomId = room.roomId
        setActiveRoomId(roomId)
      }

      const { userMessage, aiMessage } = await sendMessage(roomId, { userId, content: text })

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        toMsg(userMessage),
        toMsg(aiMessage),
      ])
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setSendError(err?.message ?? '메시지 전송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    sendChatMessage(input)
  }

  const handleQuickAction = (text) => {
    sendChatMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAreaTap = () => {
    inputRef.current?.blur()
  }

  const handleQuickPointerDown = (event) => {
    const scroller = quickActionsRef.current
    const isQuickButton =
      event.target instanceof Element &&
      event.target.closest('.chat-room__quick-btn')

    if (
      !scroller ||
      event.pointerType === 'touch' ||
      isQuickButton
    ) {
      return
    }

    quickDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      dragged: false,
    }

    scroller.setPointerCapture?.(event.pointerId)
    scroller.classList.add('chat-room__quick-actions--dragging')
  }

  const handleQuickPointerMove = (event) => {
    const scroller = quickActionsRef.current
    const drag = quickDragRef.current

    if (!scroller || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startX
    if (Math.abs(deltaX) > 3) {
      drag.dragged = true
    }

    scroller.scrollLeft = drag.scrollLeft - deltaX
  }

  const endQuickDrag = (event) => {
    const scroller = quickActionsRef.current
    const drag = quickDragRef.current

    if (!scroller || drag.pointerId !== event.pointerId) return

    scroller.releasePointerCapture?.(event.pointerId)
    scroller.classList.remove('chat-room__quick-actions--dragging')
    quickDragRef.current = {
      pointerId: null,
      startX: 0,
      scrollLeft: scroller.scrollLeft,
      dragged: drag.dragged,
    }
  }

  const handleQuickClickCapture = (event) => {
    if (!quickDragRef.current.dragged) return

    event.preventDefault()
    event.stopPropagation()
    quickDragRef.current.dragged = false
  }

  return (
    <section
      ref={roomRef}
      className={`chat-room${isLanding ? ' chat-room--landing' : ' chat-room--conversation'}${keyboard.isKeyboardFocused ? ' chat-room--keyboard' : ''}`}
    >
      <div className="chat-room__inner">
        <div className="chat-room__decor" aria-hidden="true">
          <span className="chat-room__orb chat-room__orb--top-left" />
          <span className="chat-room__orb chat-room__orb--small-top" />
          <span className="chat-room__orb chat-room__orb--right" />
          <span className="chat-room__orb chat-room__orb--right-small" />
          <span className="chat-room__orb chat-room__orb--bottom-dot" />
        </div>

        <header className="chat-room__header">
          {!isLanding && (
            <button
              className="chat-room__back-btn"
              type="button"
              onClick={onBack}
            >
              ← 나가기
            </button>
          )}
          <h1 className="chat-room__title">가독이 chat</h1>
          <button
            className="chat-room__menu-btn"
            type="button"
            aria-label="메뉴"
            onClick={onOpenDrawer}
          >
            <MenuIcon />
          </button>
        </header>

        {isLanding && (
          <div className="chat-room__landing" onClick={handleAreaTap}>
            <div className="chat-room__landing-character" aria-hidden="true">
              <img src={LANDING_CHAR_IMG} alt="" />
            </div>
            <p className="chat-room__welcome">
              안녕, 난 가독이야 👋{'\n'}오늘은 무슨 이야기를 나눠볼까?
            </p>
            <p className="chat-room__desc">
              토론하고 싶은 책의 장면 혹은 주제를 입력하면{'\n'}AI 챗봇 '가독이'가 책 내용을
              분석하여 토론을 이끌어 나가요!
            </p>
            <div
              ref={quickActionsRef}
              className="chat-room__quick-actions"
              aria-label="추천 대화 주제"
              onPointerDown={handleQuickPointerDown}
              onPointerMove={handleQuickPointerMove}
              onPointerUp={endQuickDrag}
              onPointerCancel={endQuickDrag}
              onClickCapture={handleQuickClickCapture}
            >
              <button
                className="chat-room__quick-btn"
                type="button"
                onClick={() => handleQuickAction(QUICK_ACTIONS[0])}
                disabled={loading}
              >
                가독이와 토론하기
              </button>
              <button
                className="chat-room__quick-btn"
                type="button"
                onClick={() => handleQuickAction(QUICK_ACTIONS[1])}
                disabled={loading}
              >
                가독이와 감상문쓰기
              </button>
              <button
                className="chat-room__quick-btn"
                type="button"
                onClick={() => handleQuickAction(QUICK_ACTIONS[2])}
                disabled={loading}
              >
                가독이에게 책 추천받기
              </button>
            </div>
          </div>
        )}

        {pageLoading && (
          <div className="chat-room__page-loading">
            <Loading size={40} />
          </div>
        )}

        {!isLanding && !pageLoading && (
          <div ref={messagesRef} className="chat-room__messages" onClick={handleAreaTap}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-room__message chat-room__message--${message.role}`}
              >
                {message.role === 'ai' && (
                  <span className="chat-room__avatar" aria-hidden="true">
                    <img src={CHAT_CHAR_IMG} alt="" />
                  </span>
                )}
                <div className={`chat-room__bubble chat-room__bubble--${message.role}`}>
                  <span>{message.text}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-room__message chat-room__message--ai">
                <span className="chat-room__avatar" aria-hidden="true">
                  <img src={CHAT_CHAR_IMG} alt="" />
                </span>
                <div className="chat-room__bubble chat-room__bubble--ai chat-room__bubble--loading">
                  <ChatLoadingDots />
                </div>
              </div>
            )}
          </div>
        )}

        {sendError && (
          <p className="chat-room__send-error">{sendError}</p>
        )}

        <div
          ref={inputWrapRef}
          className={`chat-room__input-wrap${isTyping ? ' chat-room__input-wrap--typing' : ''}`}
        >
          <textarea
            ref={inputRef}
            className="chat-room__input"
            value={input}
            onChange={handleInputChange}
            onFocus={keyboard.handleFocus}
            onBlur={keyboard.handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="가독이와 대화하기"
            rows={1}
          />
          <button
            className={`chat-room__send${canSend ? ' chat-room__send--active' : ''}`}
            type="button"
            onClick={handleSend}
            aria-label="전송"
            disabled={!canSend || loading}
          >
            {loading ? <StopIcon /> : <ArrowUpIcon size={20} />}
          </button>
        </div>

        {isLanding && <BottomNav active="chat" className="bottom-nav--chat-room" />}
      </div>
    </section>
  )
}

/* ==============================
   ChatPage (root)
============================== */

export default function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeChat, setActiveChat] = useState(location.state?.selectedChat ?? null)
  const [roomResetKey, setRoomResetKey] = useState(0)

  const userId = getUserId()
  const bookId = location.state?.bookId ?? null

  // 로그인 안 된 경우 로그인 페이지로 이동
  useEffect(() => {
    if (!userId) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [userId, navigate])

  if (!userId) return null

  const handleBackToLanding = () => {
    setActiveChat(null)
    setDrawerOpen(false)
    setRoomResetKey((prev) => prev + 1)
    navigate(ROUTES.CHAT, { replace: true, state: { selectedChat: null } })
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ChatRoom
        key={`${activeChat?.id ?? 'landing'}-${roomResetKey}`}
        initialChat={activeChat}
        bookId={bookId}
        onOpenDrawer={() => setDrawerOpen(true)}
        onBack={handleBackToLanding}
      />
      <ChatList
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectChat={(chat) => {
          setActiveChat(chat)
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}
