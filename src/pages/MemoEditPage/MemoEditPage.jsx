import React, { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { createMemo, deleteMemo, updateMemo } from '../../api/bookApi'
import MemoToolbar from '../../components/common/MemoToolbar/MemoToolbar'
import { ChevronLeftIcon, CheckIcon, TrashIcon } from '../../assets/icons'
import './MemoEditPage.scss'

function getUserId() {
  const stored = localStorage.getItem('userId')
  return stored ? Number(stored) : null
}

export default function MemoEditPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const bookId = location.state?.bookId
  const mainId = location.state?.mainId
  const memo = location.state?.memo
  const memoId = memo?.id ?? memo?.memoId
  const mode = location.state?.mode ?? 'edit'
  const isViewMode = mode === 'view'
  const [text, setText] = useState(memo?.content ?? '')
  const [activeTool, setActiveTool] = useState('write')
  const [bookmarked, setBookmarked] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const content = text.trim()
    if (!content || !bookId || saving) {
      navigate(-1)
      return
    }

    const userId = getUserId()
    setSaving(true)

    try {
      if (userId && memoId) {
        await updateMemo(memoId, { content })
      } else if (userId && mainId) {
        await createMemo({ mainId, content })
      } else {
        const today = new Date().toLocaleDateString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
        }).replace(/\. /g, '.').replace(/\.$/, '')

        const newMemo = { id: memoId ?? Date.now(), content, date: today }
        const saved = JSON.parse(localStorage.getItem(`memos_${bookId}`) || '[]')
        const nextMemos = memoId
          ? saved.map((item) => (item.id === memoId ? newMemo : item))
          : [...saved, newMemo]
        localStorage.setItem(`memos_${bookId}`, JSON.stringify(nextMemos))
      }

      navigate(`/book/${bookId}`, { state: { tab: 'memo' } })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!memoId) {
      navigate(-1)
      return
    }

    const userId = getUserId()

    try {
      if (userId) {
        await deleteMemo(memoId)
      } else {
        const saved = JSON.parse(localStorage.getItem(`memos_${bookId}`) || '[]')
        localStorage.setItem(`memos_${bookId}`, JSON.stringify(saved.filter((item) => item.id !== memoId)))
      }

      navigate(`/book/${bookId}`, { state: { tab: 'memo' } })
    } catch {
      navigate(-1)
    }
  }

  const previewLines = useMemo(() => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    return lines.length > 0 ? lines : ['작성된 메모가 없습니다.']
  }, [text])

  if (isViewMode) {
    return (
      <div className="memo-view">
        <header className="memo-view__header">
          <button className="memo-view__back" type="button" onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
          <h1>{previewLines[0]}</h1>
          <button className="memo-view__delete" type="button" onClick={handleDelete} aria-label="메모 삭제">
            <TrashIcon size={24} color="#141B34" />
          </button>
        </header>

        <main className="memo-view__body">
          <section className="memo-view__summary">
            <ol>
              {previewLines.slice(0, 3).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </section>

          <article className="memo-view__content">
            {previewLines.map((line, index) => (
              <p key={`${line}-${index}`} className={index % 2 === 0 ? 'memo-view__line--strong' : ''}>
                {line}
              </p>
            ))}
          </article>
        </main>
      </div>
    )
  }

  return (
    <div className="memo-edit">
      <header className="memo-edit__header">
        <button className="memo-edit__back" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ChevronLeftIcon size={24} color="#999" />
        </button>
        <span className="memo-edit__title">메모</span>
        <button className="memo-edit__save" onClick={handleSave} aria-label="저장" disabled={saving}>
          <CheckIcon size={24} color="#999" />
        </button>
      </header>

      <div className="memo-edit__body">
        <textarea
          className="memo-edit__textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="메모를 입력하세요..."
          autoFocus
        />
      </div>

      <MemoToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        bookmarked={bookmarked}
        onBookmark={() => setBookmarked(b => !b)}
      />
    </div>
  )
}
