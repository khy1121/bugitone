import React, { useEffect, useRef, useState } from 'react'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import Loading from '../../components/common/LoadingSpinner/LoadingSpinner'
import { ArrowUpIcon } from '../../assets/icons'
import './ChatPage.scss'

const CHAR_IMG = '/assets/character/character.svg'

const MOCK_CHATS = [
  {
    id: 1,
    preview: '모순에 나오는 주인공은 어떤 사람 같아?',
    messages: [
      { id: 1, role: 'user', text: '모순에 나오는 주인공은 어떤 사람 같아?' },
      {
        id: 2,
        role: 'ai',
        text: '주인공은 자기 안의 모순을 계속 마주하면서도 쉽게 단정하지 않는 인물로 보여.',
        actions: ['이유가 궁금해!', '이어서 대화하기'],
      },
    ],
  },
  { id: 2, preview: '너는 어떻게 생각해 만약 내가...', messages: [] },
  { id: 3, preview: '어린왕자에서 보면 어린 왕자는...', messages: [] },
  { id: 4, preview: '반대입장이 되어보기로 했어...', messages: [] },
  { id: 5, preview: '한강 소설 소년이 온다 읽어봤어?', messages: [] },
  { id: 6, preview: '과제에서는 내 입장이 중요한데...', messages: [] },
  { id: 7, preview: '왜 그렇게 생각하는데 더 자세히...', messages: [] },
  { id: 8, preview: '찬성입장도 생각을 해봤는데...', messages: [] },
  { id: 9, preview: '두 입장 중 뭐가 더 설득력 있어?', messages: [] },
  { id: 10, preview: '모순에서의 장면중 인상적인 건...', messages: [] },
]

const SEARCH_CHATS = [
  { id: 101, preview: '반대 입장에서 생각해 보면...', messages: [] },
  { id: 102, preview: '반대 입장으로 토론하기...', messages: [] },
  { id: 103, preview: '찬성과 반대 입장 정리...', messages: [] },
]

const QUICK_ACTIONS = ['가독이와 토론하기', '분위기만으로 책 추천하기', '가독이와 함께 감상문 쓰기']

const MAX_INPUT_HEIGHT = 380

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

function ChatList({ open, onClose, onSelectChat }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChatId, setActiveChatId] = useState(null)

  const normalizedQuery = searchQuery.trim()
  const isSearching = normalizedQuery.length > 0

  const chats = isSearching
    ? SEARCH_CHATS.filter((chat) => chat.preview.includes(normalizedQuery))
    : MOCK_CHATS

  const handleChatClick = (chat) => {
    setActiveChatId(chat.id)
    window.setTimeout(() => {
      onSelectChat(chat)
    }, 100)
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
          className="chat-list__panel"
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

          <label className={`chat-list__search${isSearching ? ' chat-list__search--active' : ''}`}>
            <span className="sr-only">채팅 검색</span>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="채팅 검색"
            />

            <SearchIcon />
          </label>

          <div
            className={`chat-list__body${isSearching ? ' chat-list__body--search' : ''}`}
            aria-label="최근 대화"
          >
            {chats.map((chat) => {
              const active = chat.id === activeChatId

              return (
                <button
                  key={chat.id}
                  type="button"
                  className={`chat-list__item${active ? ' chat-list__item--active' : ''}`}
                  onClick={() => handleChatClick(chat)}
                >
                  <span className="chat-list__item-icon">
                    <ChatIcon active={active} />
                  </span>

                  <span className="chat-list__item-preview">
                    <HighlightedText text={chat.preview} query={normalizedQuery} />
                  </span>

                  <span className="chat-list__item-arrow" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function ChatRoom({ initialChat, onOpenDrawer }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => initialChat?.messages ?? [])
  const [loading, setLoading] = useState(false)

  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const isTyping = input.length > 0
  const canSend = input.trim().length > 0
  const isLanding = messages.length === 0 && !loading

  const resetInputHeight = () => {
    if (!inputRef.current) return
    inputRef.current.style.height = 'auto'
  }

  const resizeInput = () => {
    const textarea = inputRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_INPUT_HEIGHT)}px`
  }

  const handleInputChange = (event) => {
    setInput(event.target.value)
    requestAnimationFrame(resizeInput)
  }

  const handleSend = () => {
    if (!canSend || loading) return

    const text = input.trim()
    setInput('')
    resetInputHeight()
    inputRef.current?.blur()

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }])
    setLoading(true)

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: '나는 꼭 "끝까지 책임져야만" 진짜 사랑이라고는 생각하지 않아.\n\n근데 사랑에는 분명 책임이 따라온다고는 생각해.',
          actions: ['이유가 궁금해!', '이어서 대화하기'],
        },
      ])
      setLoading(false)
    }, 1400)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (text) => {
    setInput(text)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      resizeInput()
    })
  }

  const handleAreaTap = () => {
    inputRef.current?.blur()
  }

  return (
    <section className={`chat-room${isLanding ? ' chat-room--landing' : ' chat-room--conversation'}`}>
      <div className="chat-room__inner">
        <div className="chat-room__decor" aria-hidden="true">
          <span className="chat-room__orb chat-room__orb--top-left" />
          <span className="chat-room__orb chat-room__orb--small-top" />
          <span className="chat-room__orb chat-room__orb--right" />
          <span className="chat-room__orb chat-room__orb--right-small" />
          <span className="chat-room__orb chat-room__orb--bottom-dot" />
        </div>

        <header className="chat-room__header">
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
            <div className="chat-room__char-glow" aria-hidden="true" />

            <img className="chat-room__char-img" src={CHAR_IMG} alt="" aria-hidden="true" />

            <p className="chat-room__welcome">
              안녕, 난 가독이야 👋{'\n'}오늘은 무슨 이야기를 나눠볼까?
            </p>

            <p className="chat-room__desc">
              토론하고 싶은 책의 장면 혹은 주제를 입력하면{'\n'}AI 챗봇 '가독이'가 책 내용을
              분석하여 토론을 이끌어 나가요!
            </p>
          </div>
        )}

        {!isLanding && (
          <div className="chat-room__messages" onClick={handleAreaTap}>
            {messages.map((message) => (
              <div key={message.id} className={`chat-room__message chat-room__message--${message.role}`}>
                {message.role === 'ai' && (
                  <span className="chat-room__avatar" aria-hidden="true">
                    <img src={CHAR_IMG} alt="" />
                  </span>
                )}

                <div className={`chat-room__bubble chat-room__bubble--${message.role}`}>
                  <span>{message.text}</span>

                  {message.actions && (
                    <div className="chat-room__reply-actions">
                      {message.actions.map((action, index) => (
                        <button
                          key={action}
                          type="button"
                          className={index === message.actions.length - 1 ? 'chat-room__reply-action--primary' : ''}
                          onClick={() => handleQuickAction(action)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-room__message chat-room__message--ai">
                <span className="chat-room__avatar" aria-hidden="true">
                  <img src={CHAR_IMG} alt="" />
                </span>
                <div className="chat-room__bubble chat-room__bubble--ai">
                  <Loading size={36} bg="#f2f1ec" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {isLanding && isTyping && (
          <div className="chat-room__quick-actions">
            {QUICK_ACTIONS.slice(1).map((action) => (
              <button
                key={action}
                type="button"
                className="chat-room__quick-btn"
                onClick={() => handleQuickAction(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}

        <div className={`chat-room__input-wrap${isTyping ? ' chat-room__input-wrap--typing' : ''}`}>
          <textarea
            ref={inputRef}
            className="chat-room__input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="가독이와 대화하기"
            rows={1}
          />

          <button
            className={`chat-room__send${canSend ? ' chat-room__send--active' : ''}`}
            type="button"
            onClick={handleSend}
            aria-label={loading ? '응답 중지' : '전송'}
            disabled={!canSend || loading}
          >
            {loading ? <StopIcon /> : <ArrowUpIcon size={20} />}
          </button>
        </div>

        {isLanding && <BottomNav active="chat" className="bottom-nav--chat-room bottom-nav--static" />}
      </div>
    </section>
  )
}

export default function ChatPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeChat, setActiveChat] = useState(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ChatRoom
        key={activeChat?.id ?? 'landing'}
        initialChat={activeChat}
        onOpenDrawer={() => setDrawerOpen(true)}
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
