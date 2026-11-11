// 더미 모드 전용 라우트: 실제 백엔드(Spring) 응답 형식을 그대로 흉내 냅니다.
// 응답 body 형태: { isSuccess, code, httpStatus, message, data }
import {
  BOOK_CHAT_REPLIES,
  CHARACTERS,
  COMFORT_REASON_SUFFIX,
  FREE_CHAT_REPLIES,
  toCharacterInfo,
} from './data'
import {
  createUser,
  findBook,
  findCharacter,
  getDb,
  nextId,
  save,
  toLocalDateTime,
} from './db'

export class MockError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const fail = (status, message) => {
  throw new MockError(status, message)
}

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// ---------- 공통 조회 ----------

function requireUser(userId) {
  const user = getDb().users.find((item) => item.userId === toNumber(userId))
  if (!user) fail(404, '존재하지 않는 사용자입니다.')
  return user
}

function toProfile(user) {
  return {
    userId: user.userId,
    email: user.email,
    nickname: user.nickname,
    gender: user.gender,
    birthday: user.birthday,
    profileImgUrl: user.profileImgUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function toSearchRes(book) {
  const { title, author, isbn, coverUrl, publisher, publishYear, pageCount, bookIntro } = book
  return { title, author, isbn, coverUrl, publisher, publishYear, pageCount, bookIntro }
}

function toStudyListRes(study) {
  const book = findBook(study.bookId)
  return {
    mainId: study.mainId,
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
    isbn: book.isbn,
    readingStatus: study.readingStatus,
    startDate: study.startDate,
    endDate: study.endDate,
  }
}

function toStudyDetailRes(study) {
  const book = findBook(study.bookId)
  return {
    ...toBookDetail(book, null),
    mainId: study.mainId,
    currentPage: book.pageCount,
    readingStatus: study.readingStatus,
    startDate: study.startDate,
    endDate: study.endDate,
    inMyStudy: true,
  }
}

function toBookDetail(book, study) {
  if (study) return toStudyDetailRes(study)
  return {
    mainId: null,
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    coverUrl: book.coverUrl,
    bookIntro: book.bookIntro,
    publisher: book.publisher,
    publishYear: book.publishYear,
    pageCount: book.pageCount,
    currentPage: null,
    readingStatus: null,
    startDate: null,
    endDate: null,
    inMyStudy: false,
  }
}

function findStudy(userId, mainId) {
  const study = getDb().mainStudies.find(
    (item) => item.mainId === toNumber(mainId) && (userId == null || item.userId === toNumber(userId)),
  )
  if (!study) fail(404, '서재에서 해당 책을 찾을 수 없습니다.')
  return study
}

function toMemoRes(memo) {
  const { memoId, title, createdAt, updatedAt } = memo
  return { memoId, title, createdAt, updatedAt }
}

function toMemoDetailRes(memo) {
  const { memoId, title, content, createdAt, updatedAt } = memo
  return { memoId, title, content, createdAt, updatedAt }
}

function findMemo(memoId) {
  const memo = getDb().memos.find((item) => item.memoId === toNumber(memoId))
  if (!memo) fail(404, '메모를 찾을 수 없습니다.')
  return memo
}

function toRoomListRes(room) {
  const book = room.bookId ? findBook(room.bookId) : null
  return {
    roomId: room.roomId,
    topic: room.topic,
    bookId: room.bookId,
    isbn: book?.isbn ?? null,
    bookTitle: book?.title ?? null,
    bookCoverUrl: book?.coverUrl ?? null,
    updatedAt: room.updatedAt,
  }
}

function toMessageRes(message) {
  const { messageId, content, role, createdAt } = message
  return { messageId, content, role, createdAt }
}

function findRoom(roomId, userId) {
  const room = getDb().rooms.find(
    (item) => item.roomId === toNumber(roomId) && (userId == null || item.userId === toNumber(userId)),
  )
  if (!room) fail(404, '채팅방을 찾을 수 없습니다.')
  return room
}

const sortByRecent = (key) => (a, b) => `${b[key]}`.localeCompare(`${a[key]}`)

// ---------- 라우트 정의 ----------
// [method, path pattern, handler({ params, query, body })]

const routes = [
  // ----- user -----
  ['post', '/user/login', ({ body }) => {
    const email = `${body?.email ?? ''}`.trim()
    const db = getDb()
    let user = db.users.find((item) => item.email === email)

    // 데모 편의를 위해 처음 보는 이메일은 자동으로 가입시킵니다.
    if (!user) {
      user = createUser({ email, password: body?.password, nickname: email.split('@')[0] || '독자' })
    } else if (user.password !== body?.password) {
      fail(401, '이메일 또는 비밀번호가 일치하지 않습니다.')
    }
    return toProfile(user)
  }],
  ['post', '/user/signup', ({ body }) => {
    const db = getDb()
    if (db.users.some((item) => item.email === body?.email)) fail(409, '이미 사용 중인 이메일입니다.')
    if (db.users.some((item) => item.nickname === body?.nickname)) fail(409, '이미 사용 중인 닉네임입니다.')
    return toProfile(createUser(body))
  }],
  ['get', '/user/check', ({ query }) => ({
    available: !getDb().users.some((item) => item.nickname === query.nickname),
  })],
  ['get', '/user/check/email', ({ query }) => ({
    available: !getDb().users.some((item) => item.email === query.email),
  })],
  ['get', '/user/:userId', ({ params }) => toProfile(requireUser(params.userId))],
  ['delete', '/user/:userId', ({ params }) => {
    const db = getDb()
    const user = requireUser(params.userId)
    db.users = db.users.filter((item) => item !== user)
    save()
    return null
  }],
  ['patch', '/user/update/:userId', ({ params, body }) => {
    const user = requireUser(params.userId)
    ;['password', 'nickname', 'gender', 'birthday'].forEach((key) => {
      if (body?.[key] !== undefined && body?.[key] !== null && body?.[key] !== '') user[key] = body[key]
    })
    user.updatedAt = toLocalDateTime()
    save()
    return toProfile(user)
  }],
  ['post', '/user/updateimg/:userId', async ({ params, body }) => {
    const user = requireUser(params.userId)
    const file = body instanceof FormData ? body.get('profileImg') : null
    if (file) user.profileImgUrl = await readFileAsDataUrl(file)
    user.updatedAt = toLocalDateTime()
    save()
    return toProfile(user)
  }],

  // ----- book / main-study -----
  ['get', '/book/search', ({ query }) => {
    const keyword = `${query.query ?? ''}`.trim().toLowerCase().replace(/\s+/g, '')
    const books = getDb().books
    const matched = keyword
      ? books.filter((book) =>
          `${book.title}${book.author}${book.publisher}`.toLowerCase().replace(/\s+/g, '').includes(keyword),
        )
      : books
    const size = toNumber(query.size) ?? matched.length
    return matched.slice(0, size).map(toSearchRes)
  }],
  ['get', '/books/:isbn', ({ params, query }) => {
    const db = getDb()
    const key = `${params.isbn}`
    const book = db.books.find((item) => item.isbn === key) ?? db.books.find((item) => String(item.bookId) === key)
    if (!book) fail(404, '책 정보를 찾을 수 없습니다.')
    const study = db.mainStudies.find(
      (item) => item.bookId === book.bookId && item.userId === toNumber(query.userId),
    )
    return toBookDetail(book, study)
  }],
  ['get', '/main-study', ({ query }) =>
    getDb()
      .mainStudies.filter((item) => item.userId === toNumber(query.userId))
      .sort((a, b) => b.mainId - a.mainId)
      .map(toStudyListRes),
  ],
  ['post', '/main-study', ({ query, body }) => {
    const db = getDb()
    const userId = requireUser(query.userId).userId
    let book = db.books.find((item) => item.isbn === body?.isbn)
    if (!book) {
      book = {
        bookId: nextId('book'),
        isbn: body?.isbn,
        title: body?.title ?? '제목 없음',
        author: body?.author ?? '',
        coverUrl: body?.coverUrl ?? null,
        bookIntro: body?.bookIntro ?? null,
        publisher: body?.publisher ?? null,
        publishYear: body?.publishYear ?? null,
        pageCount: body?.pageCount ?? null,
      }
      db.books.push(book)
    }
    if (db.mainStudies.some((item) => item.userId === userId && item.bookId === book.bookId)) {
      fail(409, '이미 서재에 등록된 책입니다.')
    }
    const study = {
      mainId: nextId('mainStudy'),
      userId,
      bookId: book.bookId,
      readingStatus: body?.readingStatus ?? 'WISHLIST',
      startDate: body?.startDate ?? null,
      endDate: body?.endDate ?? null,
    }
    db.mainStudies.push(study)
    save()
    return toStudyDetailRes(study)
  }],
  ['patch', '/main-study/:mainId', ({ params, query, body }) => {
    const study = findStudy(query.userId, params.mainId)
    study.readingStatus = body?.readingStatus ?? study.readingStatus
    study.startDate = body?.startDate ?? null
    study.endDate = body?.endDate ?? null
    save()
    return toStudyDetailRes(study)
  }],
  ['delete', '/main-study/:mainId', ({ params, query }) => {
    const db = getDb()
    const study = findStudy(query.userId, params.mainId)
    db.mainStudies = db.mainStudies.filter((item) => item !== study)
    db.memos = db.memos.filter((memo) => memo.mainId !== study.mainId)
    save()
    return null
  }],
  ['get', '/main-study/:mainId/memos', ({ params }) =>
    getDb()
      .memos.filter((memo) => memo.mainId === toNumber(params.mainId))
      .sort(sortByRecent('updatedAt'))
      .map(toMemoRes),
  ],

  // ----- memo -----
  ['get', '/memos/:userId', ({ params }) =>
    getDb()
      .memos.filter((memo) => memo.userId === toNumber(params.userId))
      .sort(sortByRecent('updatedAt'))
      .map(toMemoRes),
  ],
  ['get', '/memos/:userId/:memoId', ({ params }) => toMemoDetailRes(findMemo(params.memoId))],
  ['post', '/memos', ({ body }) => {
    const study = findStudy(null, body?.mainId)
    if (!`${body?.content ?? ''}`.trim()) fail(400, '메모 내용을 입력해주세요.')
    const now = toLocalDateTime()
    const memo = {
      memoId: nextId('memo'),
      userId: study.userId,
      mainId: study.mainId,
      title: body?.title ?? '',
      content: body.content,
      createdAt: now,
      updatedAt: now,
    }
    getDb().memos.push(memo)
    save()
    return toMemoDetailRes(memo)
  }],
  ['patch', '/memos/:memoId', ({ params, body }) => {
    const memo = findMemo(params.memoId)
    if (body?.title !== undefined) memo.title = body.title
    if (body?.content !== undefined) memo.content = body.content
    memo.updatedAt = toLocalDateTime()
    save()
    return toMemoDetailRes(memo)
  }],
  ['delete', '/memos/:memoId', ({ params }) => {
    const db = getDb()
    const memo = findMemo(params.memoId)
    db.memos = db.memos.filter((item) => item !== memo)
    save()
    return null
  }],

  // ----- emotion -----
  ['post', '/emotion-inputs/input-text', ({ body }) => {
    const text = `${body?.inputText ?? ''}`.trim()
    const uniqueChars = new Set(text.replace(/\s/g, '')).size
    return { valid: text.length >= 5 && uniqueChars >= 4 }
  }],
  ['post', '/emotion-inputs', async ({ body }) => {
    const user = requireUser(body?.userId)
    const tags = `${body?.emotionTag ?? ''}`.split(',').map((tag) => tag.trim()).filter(Boolean)

    const scored = CHARACTERS.map((character) => ({
      character,
      score: character.keyword.filter((keyword) => tags.includes(keyword)).length,
    }))
    const best = Math.max(...scored.map((item) => item.score))
    const character = pick(scored.filter((item) => item.score === best)).character

    await delay(2200) // AI 분석 중 로딩 화면을 보여주기 위한 지연

    const entry = {
      inputId: nextId('input'),
      resultId: nextId('result'),
      userId: user.userId,
      emotionTags: tags,
      characterId: character.characterId,
      createdAt: toLocalDateTime(),
    }
    getDb().emotionInputs.push(entry)
    save()

    const methodReason = `${character.methodReason}${COMFORT_REASON_SUFFIX[body?.comfortMethod] ?? ''}`
    return {
      inputId: entry.inputId,
      resultId: entry.resultId,
      character: toCharacterInfo(character, methodReason),
      createdAt: entry.createdAt,
    }
  }],
  ['get', '/emotion-inputs/:userId/emotions', ({ params }) => {
    const counts = new Map()
    recentInputs(params.userId).forEach((input) =>
      input.emotionTags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    )
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag)
  }],
  ['get', '/emotion-inputs/:userId/characters', ({ params }) => {
    const seen = new Set()
    return recentInputs(params.userId)
      .sort(sortByRecent('createdAt'))
      .filter((input) => !seen.has(input.characterId) && seen.add(input.characterId))
      .map((input) => toCharacterInfo(findCharacter(input.characterId)))
  }],

  // ----- chat -----
  ['get', '/chat/:userId', ({ params }) =>
    getDb()
      .rooms.filter((room) => room.userId === toNumber(params.userId))
      .sort(sortByRecent('updatedAt'))
      .map(toRoomListRes),
  ],
  ['get', '/chat/:userId/search', ({ params, query }) => {
    const keyword = `${query.keyword ?? ''}`.trim().toLowerCase()
    return getDb()
      .rooms.filter((room) => room.userId === toNumber(params.userId))
      .filter((room) => {
        const book = room.bookId ? findBook(room.bookId) : null
        return `${room.topic} ${book?.title ?? ''}`.toLowerCase().includes(keyword)
      })
      .sort(sortByRecent('updatedAt'))
      .map(toRoomListRes)
  }],
  ['post', '/chat/rooms', ({ body }) => createChatRoom(body, toNumber(body?.bookId))],
  ['post', '/chat/rooms/nobook', ({ body }) => createChatRoom(body, null)],
  ['get', '/chat/rooms/:roomId/messages', ({ params, query }) => {
    const room = findRoom(params.roomId, query.userId)
    return getDb()
      .messages.filter((message) => message.roomId === room.roomId)
      .sort((a, b) => a.messageId - b.messageId)
      .map(toMessageRes)
  }],
  ['post', '/chat/rooms/:roomId/message', async ({ params, body }) => {
    const db = getDb()
    const room = findRoom(params.roomId, body?.userId)
    const content = `${body?.content ?? ''}`.trim()
    if (!content) fail(400, '메시지를 입력해주세요.')

    const now = toLocalDateTime()
    const userMessage = { messageId: nextId('message'), roomId: room.roomId, role: 'user', content, createdAt: now }
    db.messages.push(userMessage)

    await delay(900) // AI 답변 생성 중 표시를 위한 지연

    const turn = db.messages.filter((message) => message.roomId === room.roomId && message.role === 'ai').length
    const book = room.bookId ? findBook(room.bookId) : null
    const short = content.length > 30 ? `${content.slice(0, 30)}…` : content
    const reply = content.includes('감상문')
      ? `좋아요, 함께 감상문을 써 봐요! ${book ? `"${book.title}"을 ` : '책을 '}읽고 가장 기억에 남는 장면이나 문장은 무엇이었나요? 그 장면에서 들었던 감정부터 편하게 이야기해 주세요.`
      : book
      ? BOOK_CHAT_REPLIES[turn % BOOK_CHAT_REPLIES.length](book, short)
      : FREE_CHAT_REPLIES[turn % FREE_CHAT_REPLIES.length](short)

    const aiMessage = {
      messageId: nextId('message'),
      roomId: room.roomId,
      role: 'ai',
      content: reply,
      createdAt: toLocalDateTime(),
    }
    db.messages.push(aiMessage)
    room.updatedAt = aiMessage.createdAt
    save()
    return { userMessage: toMessageRes(userMessage), aiMessage: toMessageRes(aiMessage) }
  }],
  ['delete', '/chat/rooms/:roomId/delete', ({ params, query }) => {
    const db = getDb()
    const room = findRoom(params.roomId, query.userId)
    db.rooms = db.rooms.filter((item) => item !== room)
    db.messages = db.messages.filter((message) => message.roomId !== room.roomId)
    save()
    return toRoomListRes(room)
  }],
]

function createChatRoom(body, bookId) {
  const user = requireUser(body?.userId)
  if (bookId && !findBook(bookId)) fail(404, '책 정보를 찾을 수 없습니다.')
  const now = toLocalDateTime()
  const room = {
    roomId: nextId('room'),
    userId: user.userId,
    bookId: bookId || null,
    topic: `${body?.topic ?? ''}`.trim() || '새로운 대화',
    createdAt: now,
    updatedAt: now,
  }
  getDb().rooms.push(room)
  save()
  return { roomId: room.roomId, createdAt: room.createdAt }
}

function recentInputs(userId) {
  const since = toLocalDateTime(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  return getDb().emotionInputs.filter(
    (input) => input.userId === toNumber(userId) && input.createdAt >= since,
  )
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

// ---------- 매칭 ----------

const compiled = routes.map(([method, pattern, handler]) => {
  const keys = []
  const regex = new RegExp(
    `^${pattern.replace(/:(\w+)/g, (_, key) => {
      keys.push(key)
      return '([^/]+)'
    })}/?$`,
  )
  return { method, regex, keys, handler }
})

export function matchRoute(method, path) {
  for (const route of compiled) {
    if (route.method !== method) continue
    const match = path.match(route.regex)
    if (!match) continue
    const params = Object.fromEntries(route.keys.map((key, index) => [key, decodeURIComponent(match[index + 1])]))
    return { handler: route.handler, params }
  }
  return null
}
