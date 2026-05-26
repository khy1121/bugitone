import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { EditorContent, useEditor } from '@tiptap/react'
import { Mark, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { createMemo, deleteMemo, getMemoDetail, updateMemo } from '../../api/bookApi'
import MemoToolbar from '../../components/common/MemoToolbar/MemoToolbar'
import useKeyboardAwareInput from '../../hooks/useKeyboardAwareInput'
import './MemoEditPage.scss'

const EMPTY_CONTENT = '<p></p>'
const SAVE_ICON = '/assets/library/save2.svg'
const DELETE_ICON = '/assets/library/delete.svg'
const ALERT_ICON = '/assets/alert-02.svg'

const Underline = Mark.create({
  name: 'underline',

  parseHTML() {
    return [
      { tag: 'u' },
      {
        style: 'text-decoration',
        getAttrs: (value) => String(value).includes('underline') ? {} : false,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['u', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleUnderline: () => ({ commands }) => commands.toggleMark(this.name),
    }
  },
})

function getUserId() {
  const stored = localStorage.getItem('userId')
  return stored ? Number(stored) : null
}

function stripHtml(content) {
  if (!content) return ''
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] }).trim()
}

function getMemoTitle(memo) {
  return memo?.title || stripHtml(memo?.content).split(/\r?\n/).find(Boolean) || ''
}

function getMemoContent(memo) {
  const content = memo?.content || ''
  if (!content) return EMPTY_CONTENT
  if (/<\/?[a-z][\s\S]*>/i.test(content)) return content

  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split(/\r?\n/)
    .map((line) => `<p>${line || '<br>'}</p>`)
    .join('')

  return escaped || EMPTY_CONTENT
}

function getMemoSummary(content) {
  const textWithBreaks = getMemoContent({ content })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|h1|h2|blockquote)>/gi, '\n')

  return stripHtml(textWithBreaks)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function mergeMemoResult(result, fallback) {
  const source = result?.memo ?? result ?? {}
  const memoId =
    source.id ??
    source.memoId ??
    source.memo_id ??
    fallback.id ??
    fallback.memoId

  return {
    ...fallback,
    ...source,
    id: memoId,
    memoId,
    title: source.title ?? source.memoTitle ?? source.memo_title ?? fallback.title,
    content:
      source.content ??
      source.memoContent ??
      source.memo_content ??
      fallback.content,
    date:
      source.date ??
      source.updatedAt ??
      source.updated_at ??
      source.createdAt ??
      source.created_at ??
      fallback.date,
  }
}

function getLocalMemoDate() {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '')
}

function MemoTitleSheet({ initialTitle, initialError = false, onClose, onSave }) {
  const [draft, setDraft] = useState(initialTitle)
  const [error, setError] = useState(initialError)
  const inputRef = useRef(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleSubmit = () => {
    const nextTitle = draft.trim()
    if (!nextTitle) {
      setError(true)
      return
    }

    onSave(nextTitle)
  }

  return (
    <section className="memo-title-sheet" role="dialog" aria-modal="true" aria-label="메모 제목">
      <h2 className="memo-title-sheet__title">제목</h2>
      <input
        ref={inputRef}
        className={`memo-title-sheet__input${draft.trim() ? ' memo-title-sheet__input--filled' : ''}`}
        type="text"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
          if (error) setError(false)
        }}
        placeholder="제목을 입력하세요."
        maxLength={40}
      />
      {error && <p className="memo-title-sheet__error">제목이 비어있습니다.</p>}
      <button className="memo-title-sheet__save" type="button" onClick={handleSubmit}>
        <img src={SAVE_ICON} alt="" aria-hidden="true" />
        <span>저장하기</span>
      </button>
      <button className="memo-title-sheet__close" type="button" onClick={onClose} aria-label="제목 설정 닫기" />
    </section>
  )
}

function MemoDeleteConfirm({ busy = false, onCancel, onConfirm }) {
  return (
    <section className="memo-delete-dialog" role="dialog" aria-modal="true" aria-label="메모 삭제 확인">
      <img className="memo-delete-dialog__icon" src={ALERT_ICON} alt="" aria-hidden="true" />
      <p className="memo-delete-dialog__title">내 메모에서 제거</p>
      <p className="memo-delete-dialog__desc">삭제 시 복구할 수 없습니다.</p>
      <div className="memo-delete-dialog__actions">
        <button type="button" className="memo-delete-dialog__cancel" onClick={onCancel} disabled={busy}>
          취소
        </button>
        <button type="button" className="memo-delete-dialog__confirm" onClick={onConfirm} disabled={busy}>
          확인
        </button>
      </div>
    </section>
  )
}

export default function MemoEditPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const pageRef = useRef(null)
  const bodyRef = useRef(null)
  const bookId = location.state?.bookId
  const routeBookId = location.state?.routeBookId ?? bookId
  const mainId = location.state?.mainId
  const initialMemo = location.state?.memo
  const stateMemoId = location.state?.memoId
  const [memo, setMemo] = useState(initialMemo)
  const [pageMode, setPageMode] = useState(location.state?.mode ?? 'edit')
  const [focusEditorOnEdit, setFocusEditorOnEdit] = useState(false)
  const memoId = memo?.id ?? memo?.memoId ?? memo?.memo_id ?? stateMemoId
  const isViewMode = pageMode === 'view'
  const [title, setTitle] = useState(getMemoTitle(initialMemo))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showTitleSheet, setShowTitleSheet] = useState(false)
  const [titleSheetError, setTitleSheetError] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editorVersion, setEditorVersion] = useState(0)
  const keyboard = useKeyboardAwareInput({
    scrollRef: pageRef,
    targetRef: bodyRef,
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
    ],
    content: getMemoContent(memo),
    editable: !isViewMode,
    editorProps: {
      attributes: {
        class: 'memo-tiptap',
      },
      handleDOMEvents: {
        focus: () => {
          keyboard.handleFocus()
          return false
        },
        blur: () => {
          keyboard.handleBlur()
          return false
        },
      },
    },
    onUpdate: () => setEditorVersion((value) => value + 1),
    onSelectionUpdate: () => setEditorVersion((value) => value + 1),
  })

  useEffect(() => {
    editor?.setEditable(!isViewMode)
  }, [editor, isViewMode])

  useEffect(() => {
    const userId = getUserId()

    if (!editor || !userId || !memoId) {
      return undefined
    }

    let cancelled = false

    getMemoDetail(userId, memoId)
      .then((result) => {
        if (cancelled) return

        const nextMemo = mergeMemoResult(result, memo ?? { id: memoId, memoId })
        setMemo(nextMemo)
        setTitle(getMemoTitle(nextMemo))
        editor.commands.setContent(getMemoContent(nextMemo))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [editor, memoId])

  useEffect(() => {
    if (!editor || isViewMode || !focusEditorOnEdit) return undefined

    const frame = requestAnimationFrame(() => {
      editor.commands.focus('end')
      setFocusEditorOnEdit(false)
    })

    return () => cancelAnimationFrame(frame)
  }, [editor, focusEditorOnEdit, isViewMode])

  const sanitizedContent = useMemo(() => (
    DOMPurify.sanitize(getMemoContent(memo), {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['img', 'script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload'],
    })
  ), [memo])
  const summaryItems = useMemo(() => getMemoSummary(memo?.content), [memo])

  const currentTitle = title.trim() || getMemoTitle(memo)
  const resolvedTitle = currentTitle || (isViewMode ? '무제' : '제목을 입력하세요.')
  const toolbarActiveItems = useMemo(() => {
    if (!editor) return []

    return [
      editor.isActive('heading', { level: 1 }) && 'heading1',
      editor.isActive('heading', { level: 2 }) && 'heading2',
      editor.isActive('underline') && 'underline',
      editor.isActive('bulletList') && 'bulletList',
      editor.isActive('blockquote') && 'blockquote',
      editor.isActive('bold') && 'bold',
    ].filter(Boolean)
  }, [editor, editorVersion])

  const hasTextInCurrentBlock = () => {
    if (!editor) return false
    const { selection } = editor.state
    return selection.empty && Boolean(selection.$from.parent.textContent.trim())
  }

  const prepareFutureBlock = () => {
    const chain = editor?.chain().focus()
    if (!chain) return null
    return hasTextInCurrentBlock() ? chain.splitBlock() : chain
  }

  const setHeadingLevel = (level) => {
    if (!editor) return
    const isActive = editor.isActive('heading', { level })
    const chain = prepareFutureBlock()
    if (!chain) return

    if (isActive) {
      chain.setParagraph().run()
      return
    }

    chain.setHeading({ level }).run()
  }

  const toggleBulletList = () => {
    prepareFutureBlock()?.toggleBulletList().run()
  }

  const goBackToMemoTab = () => {
    if (routeBookId) {
      navigate(`/book/${routeBookId}`, { state: { tab: 'memo' } })
      return
    }

    navigate(-1)
  }

  const enterEditMode = () => {
    setPageMode('edit')
    setFocusEditorOnEdit(true)
  }

  const openTitleSheet = (withError = false) => {
    setTitleSheetError(withError)
    setShowTitleSheet(true)
  }

  const handleToolbarAction = (key) => {
    if (!editor) return

    switch (key) {
      case 'heading1':
        setHeadingLevel(1)
        break
      case 'heading2':
        setHeadingLevel(2)
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
      case 'bulletList':
        toggleBulletList()
        break
      case 'blockquote':
        prepareFutureBlock()?.toggleBlockquote().run()
        break
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'horizontalRule':
        editor.chain().focus().setHorizontalRule().run()
        break
      default:
        break
    }
  }

  const persistMemo = async ({ requireTitle = true } = {}) => {
    if (!editor || saving) return false

    const content = editor.getHTML()
    const plainContent = stripHtml(content)
    const nextTitle = title.trim() || (!requireTitle ? plainContent.slice(0, 30).trim() || '무제' : '')
    const hasSavableContent = Boolean(plainContent) || Boolean(memoId)
    const userId = getUserId()

    if (!nextTitle) {
      openTitleSheet(true)
      return false
    }

    const canPersist = Boolean(userId && memoId) || Boolean(bookId)

    if (!nextTitle || !hasSavableContent || !canPersist) {
      return false
    }

    setSaving(true)

    try {
      const nextMemo = {
        ...(memo ?? {}),
        id: memoId ?? Date.now(),
        memoId: memo?.memoId ?? memoId,
        title: nextTitle,
        content,
        date: memo?.date ?? getLocalMemoDate(),
      }

      if (userId && memoId) {
        const result = await updateMemo(memoId, {
          title: nextTitle,
          content,
        })
        setMemo(mergeMemoResult(result, nextMemo))
      } else if (userId && mainId) {
        const result = await createMemo({
          mainId,
          title: nextTitle,
          content,
        })
        setMemo(mergeMemoResult(result, nextMemo))
      } else {
        const saved = JSON.parse(localStorage.getItem(`memos_${bookId}`) || '[]')
        const nextMemos = memoId
          ? saved.map((item) => ((item.id ?? item.memoId) === memoId ? nextMemo : item))
          : [...saved, nextMemo]
        localStorage.setItem(`memos_${bookId}`, JSON.stringify(nextMemos))
        setMemo(nextMemo)
      }

      setTitle(nextTitle)
      return true
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    const saved = await persistMemo({ requireTitle: true })
    if (saved) {
      setPageMode('view')
    }
  }

  const handleExit = async () => {
    if (isViewMode) {
      goBackToMemoTab()
      return
    }

    const hasContent = editor ? Boolean(stripHtml(editor.getHTML())) || Boolean(memoId) : false

    if (hasContent) {
      await persistMemo({ requireTitle: false })
    }

    goBackToMemoTab()
  }

  const handleDelete = async () => {
    if (!memoId) {
      navigate(-1)
      return
    }

    const userId = getUserId()

    try {
      setDeleting(true)
      if (userId) {
        await deleteMemo(memoId)
      } else {
        const saved = JSON.parse(localStorage.getItem(`memos_${bookId}`) || '[]')
        localStorage.setItem(
          `memos_${bookId}`,
          JSON.stringify(saved.filter((item) => (item.id ?? item.memoId) !== memoId))
        )
      }

      goBackToMemoTab()
    } catch {
      navigate(-1)
    } finally {
      setDeleting(false)
    }
  }

  if (isViewMode) {
    return (
      <div className="memo-view">
        {showDeleteConfirm && (
          <div className="memo-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div onClick={(event) => event.stopPropagation()}>
              <MemoDeleteConfirm
                busy={deleting}
                onCancel={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
              />
            </div>
          </div>
        )}
        <header className="memo-view__header">
          <button className="memo-view__back" type="button" onClick={handleExit}>
            ← 나가기
          </button>
          <h1 className="memo-view__title">{resolvedTitle}</h1>
          <button
            className="memo-view__delete"
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="메모 삭제"
          >
            <img src={DELETE_ICON} alt="" aria-hidden="true" />
          </button>
        </header>

        <main
          className="memo-view__body"
          onClick={enterEditMode}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            enterEditMode()
          }}
          aria-label="메모 수정하기"
        >
          {summaryItems.length > 0 && (
            <section className="memo-view__summary" aria-label="메모 요약">
              <ol>
                {summaryItems.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </section>
          )}
          <article
            className="memo-view__document"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </main>
      </div>
    )
  }

  return (
    <div
      ref={pageRef}
      className={`memo-edit${keyboard.isKeyboardFocused ? ' memo-edit--keyboard' : ''}`}
    >
      {showTitleSheet && (
        <div className="memo-overlay memo-overlay--sheet" onClick={() => setShowTitleSheet(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <MemoTitleSheet
              initialTitle={title}
              initialError={titleSheetError}
              onClose={() => setShowTitleSheet(false)}
              onSave={(nextTitle) => {
                setTitle(nextTitle)
                setShowTitleSheet(false)
              }}
            />
          </div>
        </div>
      )}
      <header className="memo-edit__header">
        <button className="memo-edit__back" type="button" onClick={handleExit} disabled={saving}>
          ← 나가기
        </button>
        <button
          className={`memo-edit__title-button${!currentTitle ? ' memo-edit__title-button--placeholder' : ''}`}
          type="button"
          onClick={() => openTitleSheet()}
        >
          {resolvedTitle}
        </button>
        <button className="memo-edit__save" type="button" onClick={handleSave} aria-label="저장" disabled={saving}>
          <img src={SAVE_ICON} alt="" aria-hidden="true" />
        </button>
      </header>

      <main ref={bodyRef} className="memo-edit__body">
        <div className={`memo-edit__editor-shell${editor?.isEmpty ? ' memo-edit__editor-shell--empty' : ''}`}>
          <EditorContent editor={editor} />
        </div>
      </main>

      <MemoToolbar
        className={keyboard.isKeyboardFocused ? 'memo-toolbar--keyboard' : ''}
        activeItems={toolbarActiveItems}
        onAction={handleToolbarAction}
        disabled={!editor || saving}
      />
    </div>
  )
}
