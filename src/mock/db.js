// 더미 모드 전용 저장소: 브라우저 localStorage에 가짜 DB를 저장합니다.
import { BOOK_CATALOG, CHARACTERS } from './data'

const STORAGE_KEY = 'nadok:mockdb:v2'

export const DEMO_ACCOUNT = { email: 'demo@nadok.com', password: 'demo1234', nickname: '나독이' }

const pad = (n) => String(n).padStart(2, '0')

export function toLocalDateTime(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function toLocalDate(date = new Date()) {
  return toLocalDateTime(date).slice(0, 10)
}

const daysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function emptyDb() {
  return {
    seq: { user: 0, book: BOOK_CATALOG.length, mainStudy: 0, memo: 0, room: 0, message: 0, input: 0, result: 0 },
    users: [],
    books: BOOK_CATALOG.map((book) => ({ ...book })),
    mainStudies: [],
    memos: [],
    rooms: [],
    messages: [],
    emotionInputs: [],
  }
}

let db = null

function load() {
  if (db) return db
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    db = raw ? JSON.parse(raw) : null
  } catch {
    db = null
  }
  if (!db) {
    db = emptyDb()
    createUser(DEMO_ACCOUNT)
  }
  return db
}

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // 저장 공간이 부족하거나 차단된 경우에도 메모리 상태로 계속 동작합니다.
  }
}

export function getDb() {
  return load()
}

export function nextId(name) {
  const current = load()
  current.seq[name] += 1
  return current.seq[name]
}

const findBook = (bookId) => load().books.find((book) => book.bookId === bookId)

// 새 사용자를 만들고, 화면이 비어 보이지 않도록 샘플 서재/메모/채팅/감정 기록을 채웁니다.
export function createUser({ email, password, nickname }) {
  const current = load()
  const now = toLocalDateTime()
  const user = {
    userId: nextId('user'),
    email,
    password,
    nickname,
    gender: null,
    birthday: null,
    profileImgUrl: null,
    createdAt: now,
    updatedAt: now,
  }
  current.users.push(user)
  seedUserData(user.userId)
  save()
  return user
}

function seedUserData(userId) {
  const current = load()

  const studies = [
    { bookId: 1, readingStatus: 'DONE', start: 30, end: 21 },
    { bookId: 2, readingStatus: 'DONE', start: 18, end: 9 },
    { bookId: 3, readingStatus: 'READING', start: 6 },
    { bookId: 4, readingStatus: 'READING', start: 2 },
    { bookId: 9, readingStatus: 'WISHLIST' },
    { bookId: 10, readingStatus: 'WISHLIST' },
  ]

  const mainIds = {}
  studies.forEach(({ bookId, readingStatus, start, end }) => {
    const mainId = nextId('mainStudy')
    mainIds[bookId] = mainId
    current.mainStudies.push({
      mainId,
      userId,
      bookId,
      readingStatus,
      startDate: start != null ? toLocalDate(daysAgo(start)) : null,
      endDate: end != null ? toLocalDate(daysAgo(end)) : null,
    })
  })

  const memos = [
    [1, '숲의 장면이 오래 남는다', '<p>초록빛 묘사가 계속 머릿속에 그려졌다.</p><p>나도 잠깐 멈춰서 주변을 둘러보는 시간을 가져야겠다.</p>', 22],
    [1, '다시 읽고 싶은 부분', '<p>인물들이 서로를 조용히 기다려 주는 장면. 다음에 꼭 다시 읽기.</p>', 25],
    [2, '여름 냄새', '<p>읽는 내내 한여름의 공기가 느껴졌다.</p><p>올여름엔 좋아하는 사람들과 더 많은 시간을 보내고 싶다.</p>', 10],
    [4, '시와 친해지기', '<p>시를 "이해"하려 하지 않고 그냥 느껴도 된다는 말이 위로가 됐다. 하루에 한 편씩 읽어 보기.</p>', 1],
  ]
  memos.forEach(([bookId, title, content, ago]) => {
    const at = toLocalDateTime(daysAgo(ago))
    current.memos.push({ memoId: nextId('memo'), userId, mainId: mainIds[bookId], title, content, createdAt: at, updatedAt: at })
  })

  const rooms = [
    {
      bookId: 3,
      topic: '일억 번째 여름 감상 나누기',
      ago: 4,
      messages: [
        ['user', '일억 번째 여름 읽는 중인데 분위기가 너무 좋아'],
        ['ai', '표지처럼 신비로운 숲의 분위기가 매력적인 책이죠! 지금까지 읽은 부분 중에 가장 마음에 남는 장면은 어디였나요?'],
      ],
    },
    {
      bookId: null,
      topic: '요즘 읽기 좋은 위로가 되는 책',
      ago: 1,
      messages: [
        ['user', '요즘 지쳐서 위로가 되는 책을 읽고 싶어'],
        ['ai', '지친 날에는 "힘내라는 말 대신"을 추천하고 싶어요. 억지로 힘을 내라고 하지 않고 곁에 있어 주는 문장들이 마음을 가볍게 해 줄 거예요. 고양이와의 일상을 담은 "함께여서 다행이야"도 부담 없이 읽기 좋아요.'],
      ],
    },
  ]
  rooms.forEach(({ bookId, topic, ago, messages }) => {
    const roomId = nextId('room')
    const at = toLocalDateTime(daysAgo(ago))
    current.rooms.push({ roomId, userId, bookId, topic, createdAt: at, updatedAt: at })
    messages.forEach(([role, content]) => {
      current.messages.push({ messageId: nextId('message'), roomId, role, content, createdAt: at })
    })
  })

  const inputs = [
    [['공허한', '우울'], 1, 12],
    [['행복한', '신나는'], 2, 7],
    [['차분한', '뿌듯한'], 3, 2],
  ]
  inputs.forEach(([tags, characterId, ago]) => {
    current.emotionInputs.push({
      inputId: nextId('input'),
      resultId: nextId('result'),
      userId,
      emotionTags: tags,
      characterId,
      createdAt: toLocalDateTime(daysAgo(ago)),
    })
  })
}

export function findCharacter(characterId) {
  return CHARACTERS.find((character) => character.characterId === characterId)
}

export { findBook }
