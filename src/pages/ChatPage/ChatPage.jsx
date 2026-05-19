import React, { useEffect, useRef, useState } from 'react'
import BottomNav from '../../components/common/BottomNav/BottomNav'
import Loading from '../../components/common/LoadingSpinner/LoadingSpinner'
import { ArrowUpIcon } from '../../assets/icons'
import './ChatPage.scss'

const CHAR_IMG = '/assets/character/nadok-shell.png'

const MOCK_CHATS = [
  { id: 1,  date: '2026.05.11', preview: '어린왕자에서 감명깊게 느낀 장면...' },
  { id: 2,  date: '2026.05.10', preview: '너는 어떻게 생각해 만약 주인공이...' },
  { id: 3,  date: '2026.05.09', preview: '검은 서재의 결말이 너무 충격적이...' },
  { id: 4,  date: '2026.05.08', preview: '아침의 루틴을 읽고 나서 느낀 점은...' },
  { id: 5,  date: '2026.05.07', preview: '달빛 정원사에서 주인공의 선택이...' },
  { id: 6,  date: '2026.05.06', preview: '오로라 코드의 AI 묘사가 현실적으로...' },
  { id: 7,  date: '2026.05.05', preview: '제국의 지도 3장까지 읽었는데 지도...' },
  { id: 8,  date: '2026.05.04', preview: '우리의 여름 엽서 마지막 장면에서...' },
  { id: 9,  date: '2026.05.03', preview: '북쪽 바다로 가는 길 중반부쯤에서...' },
  { id: 10, date: '2026.05.01', preview: '비 오는 골목의 끝 분위기가 정말...' },
]

const QUICK_ACTIONS = [
  '부기님만을 위한 책 추천하기',
  '가독이와 함께 감상문 쓰기',
]

const MAX_INPUT_HEIGHT = 380

function ChatList({ onNewChat, onSelectChat, onBack }) {
  return (
    <div className="chat-list">
      <header className="chat-list__header">
        <h1 className="chat-list__title">가독이 Chat</h1>
        <button className="chat-list__write-btn" type="button" onClick={onNewChat} aria-label="새 채팅" />
      </header>

      <div className="chat-list__body">
        {MOCK_CHATS.map((chat, i) => (
          <React.Fragment key={chat.id}>
            <button
              type="button"
              className="chat-list__item"
              onClick={() => onSelectChat(chat)}
            >
              <span className="chat-list__item-preview">{chat.preview}</span>
              <span className="chat-list__item-date">{chat.date}</span>
            </button>
            {i < MOCK_CHATS.length - 1 && <div className="chat-list__divider" />}
          </React.Fragment>
        ))}
      </div>

      <BottomNav active="chat" />
    </div>
  )
}

function ChatRoom({ onBack }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const isTyping = input.length > 0
  const canSend = input.trim().length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const resetInputHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = inputRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, MAX_INPUT_HEIGHT) + 'px'
    }
  }

  const handleSend = () => {
    if (!canSend || loading) return
    const text = input.trim()
    setInput('')
    resetInputHeight()
    inputRef.current?.blur()

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }])
    setLoading(true)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: '흥미로운 이야기네요! 그 장면에서 어떤 감정을 느꼈나요?',
        },
      ])
      setLoading(false)
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (text) => {
    setInput(text)
    const ta = inputRef.current
    if (ta) {
      ta.focus()
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, MAX_INPUT_HEIGHT) + 'px'
    }
  }

  const handleAreaTap = () => {
    inputRef.current?.blur()
  }

  const isLanding = messages.length === 0 && !loading

  return (
    <div className="chat-room">
      <header className="chat-room__header">
        <button className="chat-list__back" type="button" onClick={onBack}>
          ← 뒤로
        </button>
        <h1 className="chat-room__title">가독이 chat</h1>
      </header>

      {isLanding && (
        <div className="chat-room__landing" onClick={handleAreaTap}>
          <div className="chat-room__char-glow" aria-hidden="true" />
          <div
            className="chat-room__char-img"
            style={{ backgroundImage: `url(${CHAR_IMG})` }}
            aria-hidden="true"
          />
          <p className="chat-room__welcome">
            안녕, 난 가독이야!{'\n'}오늘은 무슨 이야기를 나눠볼까?
          </p>
          <p className="chat-room__desc">
            토론하고 싶은 책의 장면 혹은 주제를 입력하면{'\n'}AI 챗봇 &apos;가독이&apos;가 책 내용을 분석하여 토론을 이끌어 나가요!
          </p>
        </div>
      )}

      {!isLanding && (
        <div className="chat-room__messages" onClick={handleAreaTap}>
          {messages.map(msg => (
            <div key={msg.id} className={`chat-room__bubble chat-room__bubble--${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="chat-room__bubble chat-room__bubble--ai">
              <Loading size={36} bg="#d9d9d9" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {isLanding && isTyping && (
        <div className="chat-room__quick-actions">
          {QUICK_ACTIONS.map(action => (
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
          placeholder="가독이와 이야기하기"
          rows={1}
        />
        <button
          className={`chat-room__send${canSend ? ' chat-room__send--active' : ''}`}
          type="button"
          onClick={handleSend}
          aria-label="전송"
          disabled={!canSend || loading}
        >
          <ArrowUpIcon size={20} />
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [view, setView] = useState('list')
  const [selectedChat, setSelectedChat] = useState(null)

  if (view === 'list') {
    return (
      <ChatList
        onNewChat={() => {
          setSelectedChat(null)
          setView('chat')
        }}
        onSelectChat={(chat) => {
          setSelectedChat(chat)
          setView('chat')
        }}
      />
    )
  }

  return <ChatRoom onBack={() => setView('list')} initialChat={selectedChat} />
}
