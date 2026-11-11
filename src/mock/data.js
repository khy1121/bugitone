// 더미 모드 전용 정적 데이터 (책 카탈로그, 캐릭터, 채팅 답변 템플릿)
// 이미지는 팀 피그마 시안의 원본 에셋을 public/mock 아래에 저장해 사용합니다.

// [제목, 저자, 출판사, 발행연도, 쪽수, 표지 파일, 소개, ISBN]
const BOOK_SEEDS = [
  ['치치새가 사는 숲', '장진영', '민음사', null, null, 'chichi',
    '초록이 가득한 숲을 배경으로, 저마다의 사정을 안고 살아가는 사람들의 이야기를 담은 장편소설.'],
  ['여름을 한 입 베어 물었더니', '이꽃님', '문학동네', null, null, 'summer-bite',
    '눈부신 여름날, 서로의 마음에 조금씩 다가가는 두 사람의 이야기를 그린 장편소설.'],
  ['일억 번째 여름', '청예', '창비', null, null, 'billionth-summer',
    '신비로운 숲과 여름의 기억을 따라가며 자신을 찾아가는 모험을 그린 장편소설.'],
  ['우리 모두 처음엔 시를 몰랐습니다', '김연덕, 강우근', '리드앤두(READNDO)', '2025', null, 'poetry',
    '이 책은 시인이 평소 아끼던 시들을 소개하며, 그 시들이 우리 삶의 어느 지점에 닿아 있는지를 조용히 읊어줍니다. 단순히 시를 해설하는 정보성 도서가 아니라, 시인의 시선으로 세상을 바라보는 법을 배우는 에세이에 가깝습니다.',
    '9791198642738'],
  ['나태주의 행복수업', '김지수', null, null, null, 'najutae',
    '시인 나태주와의 대화를 통해 일상 속 작은 행복을 발견하는 법을 전하는 에세이.'],
  ['그렇게 심각할 필요 없어', '유인경', '애플북스', null, null, 'no-need-serious',
    '주변에 흔들리지 않고 나를 사랑하는 법을 다정하게 건네는 에세이.'],
  ['우리의 여름에게', '최지은', 'E&', null, null, 'our-summer',
    '지나간 여름과 다가올 여름 사이, 우리가 함께 보낸 계절을 돌아보는 에세이.'],
  ['보통의 언어들', '김이나', null, null, null, 'ordinary-words',
    '지쳤다고 말하기를 두려워하지 않도록, 일상의 단어들에 담긴 마음을 들여다보는 에세이.'],
  ['힘내라는 말 대신', '강관우', '히읏', null, null, 'instead-cheer',
    '위로조차 버거운 이에게 힘내라는 말 대신 곁에 있겠다고 말하는 따뜻한 에세이.'],
  ['함께여서 다행이야', '모리시타 노리코', '티라미수', null, null, 'together',
    '함께 사는 고양이와 보내는 평범한 하루하루가 주는 위로를 담은 이야기.'],
]

export const BOOK_CATALOG = BOOK_SEEDS.map(
  ([title, author, publisher, publishYear, pageCount, cover, bookIntro, isbn], index) => ({
    bookId: index + 1,
    isbn: isbn ?? `97911000${String(index + 1).padStart(5, '0')}`,
    title,
    author,
    publisher,
    publishYear,
    pageCount,
    bookIntro,
    coverUrl: `/mock/books/${cover}.webp`,
  }),
)

const characterImages = (key) => ({
  characterImgUrl: `/mock/characters/${key}.webp`,
  characterThumbUrl: `/mock/characters/${key}-thumb.webp`,
})

export const CHARACTERS = [
  {
    characterId: 1,
    characterName: '어린 왕자',
    author: '앙투안 드 생텍쥐페리',
    bookQuote: '중요한 것은 눈에 보이지 않아. 마음으로 보아야 해.',
    ...characterImages('prince'),
    methodReason:
      '뿌듯함과 지침이 동시에 느껴지는 오늘, 어린 왕자처럼 작은 것들의 소중함을 알면서도 그 무게에 지쳐있는 당신과 닮았어요.',
    keyword: ['슬픈', '공허한', '우울'],
  },
  {
    characterId: 2,
    characterName: '앨리스',
    author: '루이스 캐럴',
    bookQuote: '이상하다는 건 나쁜 게 아니야. 최고로 좋은 사람들은 다 조금씩 이상하거든.',
    ...characterImages('alice'),
    methodReason:
      '뭐가 맞는 건지 모르겠고 모든 게 낯설게 느껴지는 오늘, 앨리스도 처음엔 아무것도 이해하지 못한 채 그 세계에 뛰어들었어요. 괜찮아요, 원래 처음엔 다 그래요.',
    keyword: ['신나는', '피곤한', '행복한'],
  },
  {
    characterId: 3,
    characterName: '앤 셜리',
    author: '루시 모드 몽고메리',
    bookQuote: '내일은 아직 아무 실수도 하지 않은 새로운 날이에요.',
    ...characterImages('anne'),
    methodReason:
      '내 단점이 자꾸 눈에 밟히는 오늘, 앤은 누구보다 자신의 다름을 사랑하는 법을 알고 있어요. 있는 그대로의 나를 괜찮다고 말해줄 수 있는 캐릭터예요.',
    keyword: ['차분한', '뿌듯한', '행복한'],
  },
  {
    characterId: 4,
    characterName: '피터팬',
    author: '제임스 매슈 배리',
    bookQuote: '생각하면 날 수 있어. 행복한 생각 하나면 충분해.',
    ...characterImages('peterpan'),
    methodReason:
      '책임과 현실이 무겁게 느껴지는 오늘, 피터팬은 어른이 되지 않아도 괜찮다고 말해줄 수 있는 유일한 캐릭터예요.',
    keyword: ['공허한', '스트레스', '우울'],
  },
  {
    characterId: 5,
    characterName: '빨간 모자',
    author: '그림 형제',
    bookQuote: '길을 벗어난 건 실수였지만, 그 경험이 나를 더 단단하게 만들었어요.',
    ...characterImages('redhood'),
    methodReason:
      '내 직관을 무시하고 흔들렸거나, 누군가의 말에 경계를 잃은 날. 빨간 모자는 그 경험에서 가장 단단해지는 법을 알고 있어요.',
    keyword: ['분노', '스트레스', '피곤한'],
  },
]

export function toCharacterInfo(character, methodReason) {
  return {
    characterId: character.characterId,
    characterName: character.characterName,
    author: character.author,
    characterImgUrl: character.characterImgUrl,
    characterThumbUrl: character.characterThumbUrl,
    bookQuote: character.bookQuote,
    methodReason: methodReason ?? character.methodReason,
  }
}

export const COMFORT_REASON_SUFFIX = {
  '위로와 공감': ' 오늘은 애써 괜찮은 척하지 않아도 돼요. 그 마음 그대로 충분히 소중해요.',
  '현실적 조언': ' 오늘 할 수 있는 가장 작은 일 하나만 정해서 해보세요. 그거면 충분히 잘한 하루예요.',
}

export const BOOK_CHAT_REPLIES = [
  (book, text) => `"${book.title}"에 대해 이야기 나눌 수 있어서 좋아요! "${text}"라는 생각, 정말 흥미로워요. 어떤 장면에서 그렇게 느끼셨나요?`,
  (book) => `${book.author} 작가는 이 책에서 인물의 선택을 통해 많은 질문을 던지는 것 같아요. 당신이라면 그 상황에서 어떤 선택을 했을 것 같나요?`,
  (book) => `"${book.title}"은 읽기 전과 읽은 후의 느낌이 꽤 다르게 다가오는 책 같아요. 읽고 나서 달라진 생각이 있다면 들려주세요.`,
  () => '좋은 관점이에요. 그 부분을 조금 다르게 보면, 인물이 끝내 지키고 싶었던 것이 무엇이었는지가 보이는 것 같아요.',
  () => '말씀을 들으니 저도 그 장면을 다시 읽어 보고 싶어지네요. 가장 기억에 남는 문장이 있나요?',
]

export const FREE_CHAT_REPLIES = [
  (text) => `"${text}"에 대해 함께 생각해 볼게요. 이 주제가 떠오르게 된 계기가 있었나요?`,
  () => '흥미로운 이야기예요! 비슷한 마음이 들 때는 "힘내라는 말 대신"이나 "보통의 언어들" 같은 에세이를 읽어 보는 것도 좋아요.',
  () => '그 마음, 충분히 이해돼요. 책 속 인물들도 비슷한 순간에 많이 흔들렸답니다. 조금 더 이야기해 줄래요?',
  () => '좋은 질문이에요. 정답은 없지만, 여러 관점에서 바라보면 생각이 한결 정리될 거예요.',
]
