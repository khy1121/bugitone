# NADOK 페이지별 기능 및 구현 정리

이 문서는 현재 `frontend` 소스 기준으로 라우트별 페이지 기능, 주요 구현 방식, 사용하는 API와 상태 저장 방식을 정리한 문서입니다.

## 프로젝트 개요

- 앱 이름: `NADOK`
- 기술 스택: React 18, Vite, React Router, Axios, SCSS, Tiptap, Vite PWA
- 진입점: `src/main.jsx` -> `src/App.jsx` -> `src/routes/Router.jsx`
- 라우트 상수: `src/constants/routes.js`
- 공통 API 인스턴스: `src/api/axiosInstance.js`
- 공통 인증 저장소: `src/utils/authStorage.js`
- 공통 모바일 키보드 보정 훅: `src/hooks/useKeyboardAwareInput.js`
- PWA 설정: `vite.config.js`, `public/manifest.webmanifest`

## 공통 구조

### 라우팅과 인증 보호

구현 파일:

- `src/routes/Router.jsx`
- `src/constants/routes.js`
- `src/utils/authStorage.js`

`Router.jsx`는 `BrowserRouter`, `Routes`, `Route`를 사용한다. 인증이 필요한 라우트는 `RequireAuth`로 감싸고, `isAuthenticated()`가 false이면 `/login`으로 리다이렉트한다.

보호 라우트는 다음 기준으로 관리한다.

- `/home`
- `/character`
- `/book/`
- `/memo-edit`
- `/analyze`
- `/result`
- `/chat`
- `/mypage`
- `/search`
- `/shop`

`AuthNavigationGuard`는 브라우저 포커스 복귀, `pageshow`, `popstate`, `visibilitychange` 이벤트에서 현재 경로의 인증 상태를 다시 확인한다. 최근 추가된 백그라운드 세션 만료 정책도 이 가드에서 처리한다.

### 로그인 유지 및 백그라운드 자동 로그아웃

구현 파일:

- `src/utils/authStorage.js`
- `src/routes/Router.jsx`
- `src/api/axiosInstance.js`

프론트 단에서 앱이 백그라운드로 간 시각을 `localStorage.backgroundSessionStartedAt`에 저장한다. 앱이 다시 활성화되거나 API 요청을 보내기 전에 현재 시각과 비교해서 10분 이상 지났으면 인증 정보를 삭제하고 `/login`으로 이동한다.

핵심 함수:

- `markBackgroundSessionStarted()`: 백그라운드 진입 시각 저장
- `clearBackgroundSession()`: 백그라운드 진입 시각 초기화
- `isBackgroundSessionExpired()`: 10분 초과 여부 확인
- `clearAuthStorage()`: 인증 및 유저 프로필 로컬 데이터 삭제

백그라운드에서는 브라우저가 JS 타이머를 멈출 수 있으므로 `setTimeout` 기반이 아니라 timestamp 비교 방식으로 구현되어 있다.

### API 통신

구현 파일:

- `src/api/axiosInstance.js`
- `src/api/userApi.js`
- `src/api/bookApi.js`
- `src/api/emotionApi.js`
- `src/api/chatApi.js`

`axiosInstance`의 기본 baseURL은 `/api`이다. 로컬 개발에서는 `vite.config.js`의 dev server proxy가 `/api`와 `/uploads` 요청을 백엔드로 전달한다.

공통 처리:

- `Authorization: Bearer ${accessToken}` 자동 주입
- `FormData` 요청일 때 `Content-Type`을 제거해서 브라우저가 multipart boundary를 직접 설정
- 백그라운드 세션 만료 시 요청 전 로그아웃
- API 에러는 `normalizeApiError`를 거쳐 페이지에서 메시지로 사용

### 업로드 이미지와 원격 이미지 처리

구현 파일:

- `src/utils/resolveAssetUrl.js`
- `vite.config.js`

`resolveRemoteAssetUrl()`은 HTTPS 페이지에서 HTTP 이미지가 섞여 발생하는 mixed content 문제를 줄이기 위해 원격 asset URL을 보정한다. `/uploads/...` 경로는 앱 origin 기준 상대 경로로 사용할 수 있게 처리한다.

### 모바일 키보드/뷰포트 보정

구현 파일:

- `src/hooks/useKeyboardAwareInput.js`
- `src/hooks/useVisualViewportHeight.js`

`useKeyboardAwareInput`은 모바일 입력창 포커스 시 뷰포트가 밀리거나 확대 상태가 남는 문제를 완화한다. 주요 기능은 다음과 같다.

- 입력 포커스 상태 추적
- 키보드 활성화 중 루트 클래스 잠금
- visualViewport resize/scroll 대응
- 대상 입력창을 보이는 영역 안으로 스크롤
- blur 이후 일정 시간 기다렸다가 viewport lock 해제

`useVisualViewportHeight`는 앱 전체에서 실제 visual viewport 높이를 CSS 변수로 맞추는 역할을 한다.

## 라우트 요약

| 경로 | 페이지 | 보호 여부 | 주요 역할 |
| --- | --- | --- | --- |
| `/` | `SplashPage` | 공개 | 앱 시작 화면 |
| `/login` | `LoginPage` | 공개 | 로그인 |
| `/signup` | `SignupPage` | 공개 | 이메일/비밀번호 입력 및 이메일 중복 확인 |
| `/signup/nickname` | `NicknamePage` | 공개 | 닉네임 중복 확인 및 최종 회원가입 |
| `/home` | `LibraryPage` | 보호 | 내 서재, 책 검색 |
| `/search` | `LibraryPage` alias | 보호 | `/home`과 같은 책 검색/서재 화면 |
| `/book/:id` | `BookDetailPage` | 보호 | 책 상세, 독서 상태, 메모, 책 기반 채팅 진입 |
| `/memo-edit` | `MemoEditPage` | 보호 | 메모 작성, 보기, 수정, 삭제 |
| `/character` | `CharacterPage` | 보호 | 감정 분석 시작 랜딩 |
| `/character/error` | `CharacterErrorPage` | 보호 | 캐릭터 분석 오류 안내 |
| `/analyze` | `AnalyzePage` | 보호 | 감정 일기 입력, 감정 선택, 위로 방식 선택 |
| `/result` | `ResultPage` | 보호 | 감정 분석 결과, 캐릭터 추천, 공유/저장 |
| `/chat` | `ChatPage` | 보호 | AI 채팅, 채팅방 목록/검색/삭제 |
| `/mypage` | `MyPage` | 보호 | 내 계정, 리포트, 내 책/메모 모아보기 |
| `/install-guide` | `InstallGuidePage` | 공개 | PWA 설치 안내 |
| `/shop` | `ShopPage` | 보호 | 코인 상점 UI |

## 페이지별 상세

### 1. SplashPage

구현 파일:

- `src/pages/SplashPage/SplashPage.jsx`
- `src/pages/SplashPage/SplashPage.scss`

기능:

- 앱 로고와 슬로건을 보여주는 시작 화면이다.
- 텍스트 타이핑 애니메이션을 `renderTypingText()`로 문자 단위 span으로 분리해서 구현한다.
- `시작하기` 버튼을 누르면 `/login`으로 이동한다.

구현 방식:

- `useEffect`에서 `body`에 `splash-page-active` 클래스를 추가하고 unmount 시 제거한다.
- 라우팅은 `useNavigate()`로 처리한다.
- 별도 API 호출은 없다.

### 2. LoginPage

구현 파일:

- `src/pages/LoginPage/LoginPage.jsx`
- `src/pages/LoginPage/LoginPage.scss`
- `src/api/userApi.js`
- `src/utils/authStorage.js`

기능:

- 이메일/비밀번호 로그인.
- 이미 인증된 사용자가 접근하면 `/home`으로 이동.
- 이메일 형식, 비밀번호 길이 검증.
- 로그인 성공 시 유저 프로필을 로컬 저장소에 저장하고 `/home`으로 이동.
- 설치 안내 페이지로 이동할 수 있다.

구현 방식:

- 입력 상태는 `email`, `password`, blur/touched 상태, `submitting`, `apiError`로 관리한다.
- 이메일은 정규식, 비밀번호는 6~8자 조건으로 검증한다.
- `login({ email, password })` API를 호출한다.
- 응답의 `userId`가 없으면 로그인 실패로 처리한다.
- `storeUserProfile(profile, { email })`로 `userId`, `nickname`, `email`, `birthday`, `gender`, `profileImage` 등을 저장한다.
- 모바일 키보드 대응은 `useKeyboardAwareInput({ resetScrollOnFocus: true })`로 처리한다.

사용 API:

- `POST /api/user/login`

### 3. SignupPage

구현 파일:

- `src/pages/SignupPage/SignupPage.jsx`
- `src/pages/SignupPage/SignupPage.scss`
- `src/api/userApi.js`

기능:

- 회원가입 1단계 화면.
- 이메일, 비밀번호, 비밀번호 확인 입력.
- 이메일 형식과 비밀번호 조건 검증.
- 가입 진행 전 이메일 중복 확인.
- 이메일 검증이 통과하면 `/signup/nickname`으로 이동하면서 `email`, `password`를 route state로 전달한다.

구현 방식:

- `email`, `password`, `confirm`과 blur 상태를 각각 state로 관리한다.
- `canSubmit`은 이메일 형식, 비밀번호 길이, 비밀번호 확인 일치, 로딩 상태를 조합해서 계산한다.
- `checkEmail(email.trim())`을 호출하고 `available === false` 또는 409 계열 응답이면 중복으로 표시한다.
- 다음 단계 이동은 `navigate(ROUTES.NICKNAME, { state: { email, password } })`로 처리한다.
- 입력 중 모바일 viewport 보정은 `useKeyboardAwareInput`을 사용한다.

사용 API:

- `GET /api/user/check/email?email=...`

### 4. NicknamePage

구현 파일:

- `src/pages/NicknamePage/NicknamePage.jsx`
- `src/pages/NicknamePage/NicknamePage.scss`
- `src/utils/nicknameValidation.js`
- `src/api/userApi.js`

기능:

- 회원가입 2단계 화면.
- 닉네임 입력, 형식 검증, 중복 확인.
- 회원가입 최종 요청.
- 가입 성공 시 유저 프로필을 저장하고 `/home`으로 이동.

구현 방식:

- `/signup`에서 전달받은 `email`, `password`가 없으면 `/signup`으로 되돌린다.
- 닉네임은 `isValidNickname()`으로 검증한다.
- `nicknameStatus`는 `idle`, `checking`, `taken`, `available` 상태로 관리한다.
- `checkNickname(nickname)`으로 중복 확인 후 가능 상태일 때만 가입 버튼을 활성화한다.
- `signup({ email, password, nickname })` 호출 성공 시 `storeUserProfile()`로 인증/프로필 정보를 저장한다.

사용 API:

- `GET /api/user/check?nickname=...`
- `POST /api/user/signup`

### 5. LibraryPage

구현 파일:

- `src/pages/LibraryPage/LibraryPage.jsx`
- `src/pages/LibraryPage/LibraryPage.scss`
- `src/api/bookApi.js`
- `src/data/mockBooks.js`

기능:

- 내 서재에 저장된 책 목록 표시.
- 검색 모드 제공.
- 최근 검색어 저장 및 표시.
- 책 검색 결과 표시.
- 책 카드를 선택하면 `/book/:id`로 이동.
- 하단 탭바에서 서재 메뉴 활성화.

구현 방식:

- 로그인 유저가 있으면 `getMyBooks(userId)`로 서버 서재 목록을 가져온다.
- 유저가 없거나 API가 없는 상황을 고려해 `mockBooks` fallback 구조가 남아 있다.
- 검색어 입력 시 `searchApiBooks(query, { userId })`를 호출한다.
- 검색 API 실패 시 mock 검색(`searchMockBooks`)으로 fallback한다.
- 최근 검색어는 `localStorage.libraryRecentSearches`에 최대 10개 저장한다.
- 서재 목록의 스크롤 위치와 보이는 행 수는 `sessionStorage.libraryScrollTop`, `sessionStorage.libraryVisibleRows`에 저장해서 상세 페이지 왕복 시 복원한다.
- 한글 초성 검색을 위해 `extractChosung()` 기반 local 검색 로직을 포함한다.
- 검색 입력 중에는 하단 네비게이션을 숨긴다.

사용 API:

- `GET /api/main-study?userId=...`
- `GET /api/book/search?query=...`

### 6. SearchPage

구현 파일:

- `src/pages/SearchPage/SearchPage.jsx`

기능:

- 현재는 별도 검색 화면이 아니라 `LibraryPage`를 그대로 재사용한다.

구현 방식:

- `export default LibraryPage`로 구현되어 있다.
- `/search` 라우트는 `/home`과 같은 UI/검색 로직을 사용한다.

### 7. BookDetailPage

구현 파일:

- `src/pages/BookDetailPage/BookDetailPage.jsx`
- `src/pages/BookDetailPage/BookDetailPage.scss`
- `src/api/bookApi.js`

기능:

- 책 상세 정보 표시.
- 책 저장/수정/삭제.
- 독서 상태 관리: 다 읽은 책, 읽고 있는 책, 찜한 책.
- 독서 시작일/종료일 설정.
- 책 정보, 가독이 챗, 메모 탭 제공.
- 책 기반 채팅으로 이동.
- 책에 연결된 메모 목록 표시 및 메모 작성/보기 이동.

구현 방식:

- URL 파라미터 `id`와 `location.state.book`을 조합해 초기 책 정보를 구성한다.
- 검색에서 진입한 책과 내 서재에서 진입한 책을 구분하기 위해 `fromSearch`, `fromLibrary`, `inMyStudy`, `mainId`를 사용한다.
- 서버 유저가 있으면 `getBookDetail()`과 `getMyBooks()`를 함께 호출해서 상세 정보와 내 서재 저장 여부를 병합한다.
- 저장/상태 변경은 edit sheet에서 처리한다.
- 새 저장은 `addMyBook(userId, payload)`, 기존 저장 수정은 `updateMyBook(mainId, userId, payload)`를 호출한다.
- 내 서재 제거는 `removeMyBook(mainId, userId)`를 호출한다.
- 메모 탭은 `getBookMemos(book.mainId)`로 서버 메모를 가져온다.
- 메모 삭제는 `deleteMemo(memoId)`를 호출하고 로컬 state에서 제거한다.
- 서버가 없는 경우를 대비해 `localStorage.savedBookIds`, `bookInfo_${bookId}`, `memos_${bookId}` fallback이 남아 있다.
- 책 표지 이미지에서 canvas로 대표 색상을 추출해 hero 영역 배경 색상에 반영한다.
- 채팅 탭의 CTA는 `/chat`으로 이동하면서 `bookId`를 route state로 넘긴다.

사용 API:

- `GET /api/books/{isbn}?userId=...`
- `GET /api/main-study?userId=...`
- `POST /api/main-study?userId=...`
- `PATCH /api/main-study/{mainId}?userId=...`
- `DELETE /api/main-study/{mainId}?userId=...`
- `GET /api/main-study/{mainId}/memos`
- `DELETE /api/memos/{memoId}`

### 8. MemoEditPage

구현 파일:

- `src/pages/MemoEditPage/MemoEditPage.jsx`
- `src/pages/MemoEditPage/MemoEditPage.scss`
- `src/components/common/MemoToolbar/MemoToolbar.jsx`
- `src/api/bookApi.js`

기능:

- 메모 작성, 보기, 수정, 삭제.
- 제목 입력 모달.
- Tiptap 기반 rich text editor.
- 서식 도구: H1, H2, 밑줄, 글머리, 인용, 굵게, 수평선.
- 저장 후 view mode로 전환.
- 나가기 시 제목이 비어 있으면 제목 입력 모달을 띄운다.
- 모바일 키보드/visual viewport 문제를 보정한다.

구현 방식:

- `@tiptap/react`의 `useEditor`, `EditorContent`를 사용한다.
- `StarterKit`에 heading level 1/2를 설정하고, custom `Underline` mark를 추가한다.
- `pageMode`는 `view`와 `edit`로 나뉜다.
- 기존 메모는 `location.state.memo` 또는 `stateMemoId`로 진입하고, 로그인 유저와 `memoId`가 있으면 `getMemoDetail(userId, memoId)`로 최신 내용을 다시 가져온다.
- 저장은 `persistMemo()`에서 처리한다.
- 기존 서버 메모는 `updateMemo(memoId, { title, content })`.
- 새 서버 메모는 `createMemo({ mainId, title, content })`.
- 서버 정보가 없으면 `localStorage.memos_${bookId}`에 저장한다.
- 보기 모드에서는 `DOMPurify.sanitize()`로 HTML을 정화해서 렌더링한다.
- 삭제는 `deleteMemo(memoId)` 또는 로컬 메모 배열 제거로 처리한다.
- `resetInputViewport()`는 저장/나가기/제목 모달 열기 전에 editor blur, visual viewport lock 해제, 스크롤 초기화를 수행한다.

사용 API:

- `GET /api/memos/{userId}/{memoId}`
- `POST /api/memos`
- `PATCH /api/memos/{memoId}`
- `DELETE /api/memos/{memoId}`

### 9. CharacterPage

구현 파일:

- `src/pages/CharacterPage/CharacterPage.jsx`
- `src/pages/CharacterPage/CharacterPage.scss`

기능:

- 감정 분석/캐릭터 추천 시작 랜딩.
- 캐릭터 이미지와 CTA를 보여준다.
- CTA 클릭 시 `/analyze`로 이동.
- 하단 탭바에서 캐릭터 메뉴 활성화.

구현 방식:

- 정적 SVG asset과 SCSS 애니메이션 중심으로 구성되어 있다.
- API 호출은 없다.
- 이동은 `useNavigate()`로 처리한다.

### 10. CharacterErrorPage

구현 파일:

- `src/pages/CharacterPage/CharacterErrorPage.jsx`
- `src/pages/CharacterPage/CharacterErrorPage.scss`

기능:

- 캐릭터/분석 흐름에서 오류 발생 시 보여줄 단순 오류 안내 화면.
- 버튼 클릭 시 `/character`로 돌아간다.

구현 방식:

- 별도 API 호출 없이 정적 안내 화면으로 구현되어 있다.

### 11. AnalyzePage

구현 파일:

- `src/pages/AnalyzePage/AnalyzePage.jsx`
- `src/pages/AnalyzePage/AnalyzePage.scss`
- `src/api/emotionApi.js`

기능:

- 감정 분석 입력 3단계 플로우.
- 1단계: 일기/텍스트 입력.
- 2단계: 감정 태그 최대 3개 선택.
- 3단계: 위로 방식 선택.
- 뒤로가기 시 이탈 확인 모달.
- 일기 분석 불가 시 안내 모달.
- 완료 시 `/result`로 이동하면서 입력값을 route state로 전달.

구현 방식:

- `step`, `diary`, `emotions`, `comfort`, 모달 상태, 검증 상태를 state로 관리한다.
- 1단계 다음 버튼 클릭 시 `validateEmotionInput(diary.trim())`를 호출해서 입력 분석 가능 여부를 확인한다.
- 감정 선택은 `toggleEmotion()`에서 최대 3개까지 허용한다.
- `useKeyboardAwareInput`과 `visualViewport` 이벤트를 함께 사용해 모바일 키보드가 올라왔을 때 textarea 높이와 스크롤 위치를 보정한다.
- `textarea` 높이는 입력 내용, visual viewport, 고정 액션 버튼 위치를 기준으로 동적으로 계산한다.
- 최종 단계에서 `navigate(ROUTES.RESULT, { state: { prompt, emotions, comfort, loading: true } })`로 결과 페이지에 데이터를 전달한다.

사용 API:

- `POST /api/emotion-inputs/input-text`

### 12. ResultPage

구현 파일:

- `src/pages/ResultPage/ResultPage.jsx`
- `src/pages/ResultPage/ResultPage.scss`
- `src/api/emotionApi.js`
- `src/utils/resolveAssetUrl.js`

기능:

- 감정 분석 결과 로딩 화면.
- 분석 결과 캐릭터, 작가, 문장, 이유/위로 문구 표시.
- 결과 이미지 저장.
- Web Share API 또는 clipboard fallback 공유.
- 코인을 사용한 다시 생성 진입.
- 코인이 부족하면 상점으로 이동할 수 있다.

구현 방식:

- `AnalyzePage`에서 전달된 `prompt`, `emotions`, `comfort`, `loading` state를 사용한다.
- `prompt`와 `userId`가 있으면 `createEmotionAnalysis()`를 호출한다.
- API 실패 또는 초기 분석값이 없을 때는 `FALLBACK_ANALYSIS`를 사용한다.
- 로딩 중에는 5초마다 안내 문구를 랜덤 교체한다.
- 결과 이미지 저장은 canvas로 직접 그린 뒤 blob을 만들어 다운로드한다.
- CORS/mixed content 이슈를 줄이기 위해 원격 이미지는 `getCanvasSafeImageSource()`와 `resolveRemoteAssetUrl()`을 거친다.
- 공유는 `navigator.share`를 우선 사용하고, 데스크톱 fallback으로 clipboard 복사를 시도한다.
- 코인 수는 `localStorage.coinCount` 또는 `localStorage.coins`에서 읽고, 다시 생성 시 2개 차감 후 `/analyze`로 이동한다.

사용 API:

- `POST /api/emotion-inputs`

### 13. ChatPage

구현 파일:

- `src/pages/ChatPage/ChatPage.jsx`
- `src/pages/ChatPage/ChatPage.scss`
- `src/api/chatApi.js`

기능:

- 가독이 AI 채팅.
- 새 채팅방 생성.
- 책 상세에서 전달된 `bookId`가 있으면 책 기반 채팅방 생성.
- 채팅 메시지 송수신.
- 최근 채팅방 drawer.
- 채팅방 검색.
- 채팅방 삭제.
- 추천 빠른 질문 버튼.

구현 방식:

- 루트 `ChatPage`는 `drawerOpen`, `activeChat`, `roomResetKey`를 관리한다.
- 로그인 유저가 없으면 `/login`으로 이동한다.
- `ChatRoom`은 첫 메시지를 보낼 때 방이 없으면 `createRoom({ userId, bookId, topic })` 또는 `createNoBookRoom({ userId, topic })`을 먼저 호출한다.
- 이후 `sendMessage(roomId, { userId, content })`로 사용자 메시지와 AI 응답을 받아 `messages`에 반영한다.
- 기존 채팅 선택 시 `getMessages(roomId, userId)`로 메시지 이력을 불러온다.
- 전송 중에는 optimistic user message를 먼저 추가하고, 실패 시 제거한다.
- textarea 높이는 입력 내용에 맞춰 자동 조절하고, ResizeObserver로 입력 영역 높이를 CSS 변수에 반영한다.
- `ChatList` drawer는 열릴 때 `getRoomList(userId)`로 목록을 로드한다.
- 검색어가 있으면 300ms debounce 후 `searchRoomList(userId, keyword)`를 호출한다.
- 채팅방 삭제는 `deleteRoom(roomId, userId)` 호출 후 목록 state에서 제거한다.

사용 API:

- `GET /api/chat/{userId}`
- `GET /api/chat/{userId}/search?keyword=...`
- `POST /api/chat/rooms`
- `POST /api/chat/rooms/nobook`
- `GET /api/chat/rooms/{roomId}/messages?userId=...`
- `POST /api/chat/rooms/{roomId}/message`
- `DELETE /api/chat/rooms/{roomId}/delete?userId=...`

### 14. MyPage

구현 파일:

- `src/pages/MyPage/MyPage.jsx`
- `src/pages/MyPage/MyPage.scss`
- `src/api/userApi.js`
- `src/api/bookApi.js`
- `src/api/emotionApi.js`

기능:

- 마이페이지 메인.
- 계정 프로필 카드.
- 최근 감정 캐릭터/리포트 진입.
- 내 서재 카테고리 요약.
- 최근 작성 메모 요약.
- 내 계정 수정.
- 프로필 이미지 업로드.
- 닉네임, 생일, 성별 수정.
- 로그아웃.
- 회원탈퇴.
- 내 리포트 상세.
- 내 책 카테고리별 목록.
- 내 메모 목록.
- 설치 안내 진입.

구현 방식:

- `MyPage` root는 내부 view state로 `main`, `report`, `account`, `memo`, `install`, `library`를 전환한다.
- 서버 프로필 동기화는 `getUserProfile(userId)`를 통해 수행한다.
- 마이페이지 진입, 브라우저 focus/visibility 복귀, 내 계정 진입 시 `fetchAndSyncUserProfile()`로 최신 프로필을 가져와 localStorage와 `profileSnapshot` state에 반영한다.
- `normalizeUserProfile()`은 서버 응답의 `profileImgUrl`, `profileImageUrl`, `profileImage`, `birthday`, `gender`를 화면에 맞는 값으로 정규화한다.
- `syncStoredUserProfile()`은 프로필 정보를 `localStorage`에 저장하고, 프로필 이미지는 `profileImage:{userId}` 캐시 키에도 저장한다.

#### MyPage MainView

기능:

- 내 계정 카드.
- 월별 감정 캐릭터 preview.
- 내 서재 카테고리별 count.
- 최근 메모 preview.
- 하단 네비게이션.

구현 방식:

- `profileSnapshot`을 prop으로 받아 화면을 렌더링한다.
- 감정 캐릭터는 `getMonthlyCharacters(userId)`로 가져온다.
- 내 서재는 root에서 `getMyBooks(userId)`로 가져온 `libraryBooks`를 사용한다.

#### ReportView

기능:

- 월간 감정 리포트.
- 감정별 count, 캐릭터 카드, 결과 상세 이동.

구현 방식:

- `getMonthlyCharacters(userId)`와 `getMonthlyEmotions(userId)`를 병렬 호출한다.
- 캐릭터 카드를 누르면 `/result`로 이동하면서 기존 분석 결과를 route state로 넘긴다.

사용 API:

- `GET /api/emotion-inputs/{userId}/characters`
- `GET /api/emotion-inputs/{userId}/emotions`

#### AccountView

기능:

- 프로필 이미지 변경.
- 닉네임 수정.
- 생일 수정.
- 성별 수정.
- 로그아웃.
- 회원탈퇴.

구현 방식:

- 프로필 이미지는 파일 선택 후 canvas로 최대 1024px 기준 JPEG로 변환해서 `updateProfileImage(userId, file)`로 업로드한다.
- 닉네임 수정은 `NicknameSheet`에서 닉네임 검증/중복 확인 후 `updateUser(userId, { nickname })`를 호출한다.
- 생일 수정은 `BirthdayEditor`에서 year/month/day select로 선택하고 API에는 `YYYY-MM-DD` 형식으로 보낸다.
- 성별 수정은 `GenderSheet`에서 `Male` 또는 `Female`만 선택하도록 제한하고 `updateUser(userId, { gender })`를 호출한다.
- 로그아웃은 `clearAuthStorage()` 후 `/login`으로 이동한다.
- 회원탈퇴는 로그아웃 모달과 같은 스타일의 confirm modal에서 `deleteAccount(userId)` 호출 후 인증 정보를 삭제한다.

사용 API:

- `GET /api/user/{userId}`
- `PATCH /api/user/update/{userId}`
- `POST /api/user/updateimg/{userId}`
- `DELETE /api/user/{userId}`
- `GET /api/user/check?nickname=...`

#### LibraryCategoryView

기능:

- 내 서재를 전체, 다 읽은 책, 읽고 있는 책, 찜한 책 기준으로 필터링해서 보여준다.

구현 방식:

- `MyPage` root에서 내려받은 `libraryBooks`를 사용한다.
- 탭 상태를 local state로 관리한다.
- 책 선택 시 `/book/:id`로 이동하면서 `fromLibrary`와 `book` state를 함께 넘긴다.

#### MemoView

기능:

- 전체 메모 목록 또는 로컬 mock 메모 목록 표시.
- 메모 선택 시 `MemoEditPage` view mode로 이동.

구현 방식:

- 로그인 유저가 있으면 `getAllMemos(userId)`를 호출한다.
- API 메모는 `normalizeMemo()`로 정규화한다.
- 서버 유저가 없을 때는 `mockBooks`와 `localStorage.memos_${book.id}`를 조합한 fallback 목록을 사용한다.

사용 API:

- `GET /api/memos/{userId}`

### 15. InstallGuidePage

구현 파일:

- `src/pages/InstallGuidePage/InstallGuidePage.jsx`
- `src/pages/InstallGuidePage/InstallGuidePage.scss`

기능:

- Android, iOS, Desktop별 PWA 설치 안내.
- 설치 가능 환경이면 브라우저의 install prompt 실행.
- 이미 설치된 상태, iOS 수동 설치 필요 상태, prompt 사용 불가 상태를 모달로 안내.

구현 방식:

- `beforeinstallprompt` 이벤트를 전역에서 가로채 `window.__nadokPwaInstallPrompt`에 저장한다.
- prompt 구독자는 `installPromptSubscribers` Set으로 관리한다.
- `appinstalled` 이벤트 발생 시 설치 완료 모달을 띄운다.
- iOS는 `navigator.userAgent`, `navigator.platform`, `navigator.maxTouchPoints`로 판별하고 수동 설치 안내를 보여준다.
- standalone PWA 실행 여부는 `matchMedia('(display-mode: standalone)')`와 `window.navigator.standalone`으로 확인한다.

### 16. ShopPage

구현 파일:

- `src/pages/ShopPage/ShopPage.jsx`
- `src/pages/ShopPage/ShopPage.scss`

기능:

- 코인 보유량 표시.
- 이벤트 상품, 출석 보상, 광고 보상, 일반 패키지 UI 표시.
- 캐릭터 페이지로 돌아가기.
- 하단 네비게이션 영역 구조 포함.

구현 방식:

- 현재는 결제/광고 API 연동 없이 정적 데이터 기반 UI이다.
- `DAILY_REWARDS`, `PACKAGES` 배열을 map으로 렌더링한다.
- `coinCount`는 현재 컴포넌트 내부 상수로 표시한다.

## 공통 컴포넌트 사용

주요 공통 컴포넌트:

- `BottomNav`: 하단 탭 네비게이션. shop, chat, library, character, my 메뉴를 제공한다.
- `Button`: 온보딩/폼 버튼.
- `Input`: 로그인/회원가입 입력창.
- `DuplicateCheckButton`: 닉네임 중복 확인 버튼.
- `LoadingSpinner`: 로딩 표시.
- `ChatLoadingDots`: AI 채팅 응답 대기 표시.
- `MemoToolbar`: Tiptap 메모 에디터 서식 도구.

## 주요 로컬 저장소 키

| 키 | 저장 위치 | 용도 |
| --- | --- | --- |
| `userId` | localStorage | 로그인 유저 식별자 |
| `nickname` | localStorage | 현재 유저 닉네임 |
| `email` | localStorage | 현재 유저 이메일 |
| `birthday` | localStorage | 현재 유저 생일 |
| `gender` | localStorage | 현재 유저 성별 |
| `profileImage` | localStorage | 현재 유저 프로필 이미지 URL |
| `profileImage:{userId}` | localStorage | 유저별 프로필 이미지 캐시 |
| `backgroundSessionStartedAt` | localStorage | 백그라운드 진입 시각 |
| `libraryRecentSearches` | localStorage | 최근 책 검색어 |
| `savedBookIds` | localStorage | 서버 미사용 fallback 책 저장 목록 |
| `bookInfo_{bookId}` | localStorage | 서버 미사용 fallback 책 상태/날짜 |
| `memos_{bookId}` | localStorage | 서버 미사용 fallback 메모 목록 |
| `coinCount`, `coins` | localStorage | 결과 재생성용 코인 수 |
| `libraryScrollTop` | sessionStorage | 서재 스크롤 복원 |
| `libraryVisibleRows` | sessionStorage | 서재 노출 행 수 복원 |

## API 래퍼 요약

### userApi

파일: `src/api/userApi.js`

- `login({ email, password })`: 로그인
- `signup({ email, password, nickname })`: 회원가입
- `checkNickname(nickname)`: 닉네임 중복 확인
- `checkEmail(email)`: 이메일 중복 확인
- `getUserProfile(userId)`: 회원정보 조회
- `updateUser(userId, body)`: 닉네임, 성별, 생일 등 회원정보 수정
- `updateProfileImage(userId, file)`: 프로필 이미지 multipart 업로드
- `deleteAccount(userId)`: 회원탈퇴

### bookApi

파일: `src/api/bookApi.js`

- `searchBooks(keyword, options)`: 책 검색
- `getMyBooks(userId)`: 내 서재 목록
- `addMyBook(userId, book)`: 내 서재 저장
- `getBookDetail(isbn, userId)`: 책 상세 조회
- `updateMyBook(mainId, userId, body)`: 내 서재 책 상태 수정
- `removeMyBook(mainId, userId)`: 내 서재 책 삭제
- `getBookMemos(mainId)`: 특정 책 메모 목록
- `getAllMemos(userId)`: 전체 메모 목록
- `getMemoDetail(userId, memoId)`: 메모 상세
- `createMemo(body)`: 메모 생성
- `updateMemo(memoId, body)`: 메모 수정
- `deleteMemo(memoId)`: 메모 삭제

### emotionApi

파일: `src/api/emotionApi.js`

- `validateEmotionInput(inputText)`: 감정 입력 분석 가능 여부 확인
- `createEmotionAnalysis({ userId, inputText, emotionTag, comfortMethod })`: 감정 분석 생성
- `getMonthlyCharacters(userId)`: 월간 캐릭터 기록 조회
- `getMonthlyEmotions(userId)`: 월간 감정 통계 조회

### chatApi

파일: `src/api/chatApi.js`

- `getRoomList(userId)`: 채팅방 목록
- `searchRoomList(userId, keyword)`: 채팅방 검색
- `createRoom({ userId, bookId, topic })`: 책 기반 채팅방 생성
- `createNoBookRoom({ userId, topic })`: 일반 채팅방 생성
- `getMessages(roomId, userId)`: 채팅 메시지 조회
- `sendMessage(roomId, { userId, content })`: 메시지 전송
- `deleteRoom(roomId, userId)`: 채팅방 삭제

## 유지보수 메모

- 페이지별 API 응답 shape가 다양해서 각 페이지에 `normalizeBook`, `normalizeMemo`, `normalizeUserProfile` 같은 정규화 함수가 존재한다.
- 일부 페이지에는 서버 API가 없던 시절의 mock/localStorage fallback이 남아 있다. 서버 연동이 완전히 안정화되면 fallback 제거 여부를 검토할 수 있다.
- 모바일 입력 화면은 `useKeyboardAwareInput` 의존도가 높다. 입력창이 있는 신규 페이지는 이 훅을 먼저 적용하는 편이 안전하다.
- 프로필 이미지와 업로드 파일은 `/uploads` proxy와 `resolveRemoteAssetUrl()` 동작이 맞물려 있으므로 배포 환경 변수와 Vite/Vercel proxy 설정을 함께 확인해야 한다.
- 프론트 단 자동 로그아웃은 앱 재활성화 또는 API 요청 시점에 확정된다. 백그라운드 상태에서 정확히 10분이 되는 순간 UI를 변경하는 것은 모바일 브라우저 제약상 보장하지 않는다.
