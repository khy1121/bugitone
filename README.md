<!-- ===================================================== -->
<!--                     PROJECT HEADER                    -->
<!-- ===================================================== -->

<h1 align="center">NADOK</h1>

<p align="center">
  <b>펼치는 순간, 나를 다독이다</b><br/>
  읽은 책을 기록하고, 오늘의 감정에 어울리는 책 속 캐릭터를 만나는 독서 앱
</p>

<p align="center">
  <a href="https://bugitone.vercel.app"><img src="https://img.shields.io/badge/%EB%B0%94%EB%A1%9C%20%EC%8D%A8%EB%B3%B4%EA%B8%B0-bugitone.vercel.app-F8BC0A?style=flat-square&logo=vercel&logoColor=white"/></a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white"/>
</p>

---

## 목차

**누구나 읽을 수 있는 소개**

1. [NADOK은 어떤 서비스인가요?](#about)
2. [바로 써보기](#try)
3. [주요 기능](#features)
4. [이렇게 빨라졌어요](#results)
5. [사용한 기술](#tech-stack)

**개발자를 위한 안내**

6. [내 컴퓨터에서 실행하기](#getting-started)
7. [환경변수](#env)
8. [데모(더미 데이터) 모드](#mock-mode)
9. [폴더 구조](#structure)
10. [화면 주소](#routing)
11. [서버와 통신하는 방법](#api-proxy)
12. [배포](#deploy)
13. [앱처럼 설치하기 (PWA)](#pwa)
14. [모바일 대응](#mobile)
15. [성능 개선 자세히 보기](#performance)
16. [용어 풀이](#glossary)

---

<a id="about"></a>

## NADOK은 어떤 서비스인가요?

책을 읽고 나서 느낀 점을 기록하고, 오늘 하루의 감정을 들려주면 그 감정에 어울리는 **책 속 캐릭터**를 추천해 주는 서비스입니다.

- 읽은 책과 메모를 한곳에 모아 둘 수 있어요.
- "오늘 어떤 하루였는지"를 적으면 어린 왕자, 앨리스, 빨간 머리 앤 같은 캐릭터가 위로나 조언을 건네요.
- 책 이야기를 AI 챗봇 '가독이'와 나눌 수 있어요.
- 한 달 동안 만난 캐릭터와 자주 느낀 감정을 리포트로 돌아볼 수 있어요.

휴대폰에 맞춰 만든 웹사이트라 별도 설치 없이 브라우저에서 바로 쓸 수 있고, 원하면 홈 화면에 앱처럼 추가할 수도 있습니다.

---

<a id="try"></a>

## 바로 써보기

1. 휴대폰이나 컴퓨터에서 **https://bugitone.vercel.app** 에 접속합니다.
2. **시작하기**를 누릅니다.
3. 로그인 화면에서 아무것도 입력하지 않고 **로그인** 버튼만 누르면 체험용 계정으로 바로 들어갑니다.

> 지금 공개된 사이트는 **체험용 데모 모드**로 운영 중입니다. 실제 서버 없이 미리 준비된 예시 데이터로 동작하고, 입력한 내용은 내 브라우저에만 저장되어 다른 사람에게 보이지 않습니다.

컴퓨터로 접속하면 화면이 휴대폰 모양 틀 안에 표시됩니다.

---

<a id="features"></a>

## 주요 기능

| 기능 | 할 수 있는 일 |
|---|---|
| **서재** | 다 읽은 책, 읽고 있는 책, 찜한 책을 책장처럼 모아 보고 새 책을 검색해 추가 |
| **메모** | 책마다 느낀 점을 글로 기록 (제목, 소제목, 목록 같은 꾸미기 지원) |
| **감정 분석** | 오늘의 일기와 감정을 고르면 어울리는 책 속 캐릭터와 위로·조언 한마디를 추천 |
| **가독이 챗** | AI 챗봇과 책 내용으로 토론하거나 감상문 쓰기 |
| **월간 리포트** | 이번 달 만난 캐릭터와 자주 느낀 감정을 한눈에 정리 |
| **코인샵** | 활동으로 모은 코인 확인 |

---

<a id="results"></a>

## 이렇게 빨라졌어요

처음에는 이미지가 늦게 뜨고 첫 화면이 무거웠습니다. 원인을 하나씩 측정하고 고쳐서 아래처럼 개선했습니다.

**내려받는 용량이 크게 줄었어요**

| 항목 | 개선 전 | 개선 후 |
|---|---|---|
| 처음 방문할 때 미리 받아 두는 전체 파일 | 23MB | 2.3MB (약 10분의 1) |
| 캐릭터·배경·책 이미지 12종 | 약 15.7MB | 약 190KB |
| 첫 화면에 필요한 프로그램 코드 | 796KB | 245KB |

**첫 화면이 더 빨리 떠요** (구글 Lighthouse로 휴대폰 환경을 흉내 내 측정, 100점 만점)

| 화면 | 속도 점수 | 첫 화면이 다 보이기까지 |
|---|---|---|
| 서재(홈) | 85점 → **94점** | 3.9초 → **2.7초** |
| 마이페이지 | 88점 → **97점** | 3.5초 → **2.3초** |
| 가독이 챗 | 85점 → **93점** | 3.6초 → **2.5초** |

구글은 "첫 화면이 다 보이기까지 2.5초 이내"를 좋은 기준으로 봅니다. 실제 사용자 기기에서의 속도는 **Vercel Speed Insights**로 계속 확인하고 있습니다.

어떻게 고쳤는지는 [성능 개선 자세히 보기](#performance)에 정리했습니다.

---

<a id="tech-stack"></a>

## 사용한 기술

### 화면 만들기 (Frontend)

<p>
  <img src="https://skillicons.dev/icons?i=react,vite,js,sass,html,css"/>
</p>

<p>
  <img src="https://img.shields.io/badge/React%20Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white"/>
  <img src="https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tiptap-3-000000?style=flat-square&logo=tiptap&logoColor=white"/>
  <img src="https://img.shields.io/badge/DOMPurify-3-1E90FF?style=flat-square"/>
</p>

| 기술 | 쉽게 말하면 |
|---|---|
| React | 화면을 부품(컴포넌트)처럼 나눠 만드는 도구 |
| Vite | 만든 코드를 웹사이트용 파일로 묶어 주는 도구 |
| React Router | 주소(`/home`, `/mypage` 등)에 맞는 화면을 보여 주는 도구 |
| Axios | 서버와 데이터를 주고받는 도구 |
| Sass(SCSS) | 화면 디자인(색, 크기, 배치)을 작성하는 언어 |
| Tiptap | 메모 작성에 쓰는 글쓰기 편집기 |
| DOMPurify | 사용자가 쓴 글에서 위험한 코드를 걸러 내는 보안 도구 |

### 배포 · 앱 설치 (PWA / Deploy)

<p>
  <img src="https://skillicons.dev/icons?i=vercel"/>
</p>

<p>
  <img src="https://img.shields.io/badge/vite--plugin--pwa-Workbox-5A0FC8?style=flat-square&logo=pwa&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vercel-Functions-000000?style=flat-square&logo=vercel&logoColor=white"/>
</p>

| 기술 | 쉽게 말하면 |
|---|---|
| Vercel | 웹사이트를 인터넷에 올려 누구나 접속할 수 있게 해 주는 서비스 |
| PWA (vite-plugin-pwa) | 웹사이트를 휴대폰 홈 화면에 앱처럼 추가할 수 있게 해 주는 기술 |

### 도구 (Tools)

<p>
  <img src="https://skillicons.dev/icons?i=git,github,figma"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Lighthouse-%EC%84%B1%EB%8A%A5%20%EC%B8%A1%EC%A0%95-F44B21?style=flat-square&logo=lighthouse&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vercel-Speed%20Insights-000000?style=flat-square&logo=vercel&logoColor=white"/>
</p>

| 기술 | 쉽게 말하면 |
|---|---|
| Git · GitHub | 코드 변경 기록을 남기고 팀원과 함께 관리하는 도구 |
| Figma | 화면 디자인 시안을 만드는 도구 |
| Lighthouse | 구글이 만든 웹사이트 속도 측정 도구 |
| Vercel Speed Insights | 실제 방문자 기기에서 체감 속도를 모아 보여 주는 도구 |

---

<a id="getting-started"></a>

## 내 컴퓨터에서 실행하기

> 쉽게 말하면: 코드를 내려받은 뒤 두 줄의 명령어로 내 컴퓨터에서 사이트를 띄워 볼 수 있습니다. ([Node.js](https://nodejs.org) 설치 필요)

```bash
npm install
npm run dev
```

실행 후 브라우저에서 `http://localhost:5173` 에 접속합니다.

| 명령어 | 하는 일 |
|---|---|
| `npm run dev` | 개발용 서버 실행 (코드를 고치면 바로 반영) |
| `npm run build` | 실제 배포용 파일 만들기 (`dist/` 폴더) |
| `npm run preview` | 배포용 파일을 내 컴퓨터에서 미리 확인 |

---

<a id="env"></a>

## 환경변수

> 쉽게 말하면: 서버 주소처럼 환경마다 달라지는 설정값입니다. 코드에 직접 적지 않고 별도 파일이나 Vercel 설정에 넣습니다.

로컬 개발 시 `.env.example`을 참고해 `.env`를 만듭니다.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:8080
API_PROXY_TARGET=http://localhost:8080/api
UPLOADS_PROXY_TARGET=http://localhost:8080/uploads
VITE_USE_MOCK=false
```

| 변수 | 설명 |
|---|---|
| `VITE_API_BASE_URL` | 브라우저에서 사용할 API 기본 경로. 배포 환경에서는 `/api` |
| `VITE_API_PROXY_TARGET` | 개발 서버가 API 요청을 전달할 로컬 백엔드 주소 |
| `API_PROXY_TARGET` | Vercel Function이 API 요청을 전달할 백엔드 주소 |
| `UPLOADS_PROXY_TARGET` | Vercel Function이 업로드 이미지 요청을 전달할 백엔드 주소 |
| `VITE_USE_MOCK` | `true`면 서버 없이 예시 데이터로 동작 ([데모 모드](#mock-mode)) |

> 실제 서버 주소는 GitHub에 올리지 말고 Vercel 환경변수에만 등록합니다.

---

<a id="mock-mode"></a>

## 데모(더미 데이터) 모드

> 쉽게 말하면: 실제 서버가 없어도 미리 준비한 예시 데이터로 모든 화면을 체험할 수 있게 하는 모드입니다. 지금 공개된 사이트가 이 모드로 동작합니다.

- `VITE_USE_MOCK=true`일 때만 켜집니다.
- 기존 API 코드(`src/api/*`)와 화면 코드는 그대로 두고, 서버 대신 응답하는 부분(`axiosInstance`의 adapter)만 바꿉니다 (`src/mock/`).
- 데이터는 브라우저 `localStorage`에 저장되어 새로고침해도 남고, 방문자마다 따로 저장됩니다.
- 로그인 화면에 "체험용 데모 모드" 안내가 보이고, 로그인 버튼만 누르면 데모 계정으로 들어갑니다.
- 데모 계정: `demo@nadok.com` / `demo1234`
- 실제 서버를 다시 연결할 때는 Vercel 환경변수에서 `VITE_USE_MOCK`을 지우고 다시 배포합니다.

자세한 내용은 [`src/mock/README.md`](src/mock/README.md)를 참고하세요.

---

<a id="structure"></a>

## 폴더 구조

> 쉽게 말하면: 코드가 역할별로 어느 폴더에 들어 있는지 정리한 지도입니다.

```txt
api/                Vercel Function 프록시 (서버 요청 전달)
public/             정적 파일, 앱 아이콘, 이미지(WebP)·폰트(woff2)
src/api/            서버와 통신하는 코드
src/components/     여러 화면에서 함께 쓰는 부품
src/constants/      화면 주소 등 고정값
src/hooks/          화면 높이·키보드·드래그 등 공통 동작
src/mock/           데모(더미 데이터) 모드
src/pages/          화면별 코드
src/pwa/            앱 설치·업데이트 안내
src/routes/         주소별 화면 연결 (화면별 코드 나눠 불러오기)
src/styles/         공통 디자인(색, 글자 크기 등)
src/utils/          공통 도구 함수
```

---

<a id="routing"></a>

## 화면 주소

> 쉽게 말하면: 각 화면이 어떤 주소로 열리는지 정리한 표입니다. 주소 목록은 `src/constants/routes.js`에서 관리합니다.

| 주소 | 화면 | 주소 | 화면 |
|---|---|---|---|
| `/` | 시작 화면 | `/book/:id` | 책 상세 |
| `/login` | 로그인 | `/memo-edit` | 메모 쓰기/고치기 |
| `/signup` | 회원가입 | `/analyze` | 감정 입력 |
| `/home` | 서재(홈) | `/result` | 감정 분석 결과 |
| `/search` | 책 검색 | `/character` | 캐릭터 |
| `/chat` | 가독이 챗 | `/mypage` | 마이페이지 |
| `/shop` | 코인샵 | `/install-guide` | 앱 설치 안내 |

시작 화면과 로그인을 뺀 나머지 화면은 처음에 다 받지 않고, 그 화면에 들어갈 때 필요한 만큼만 불러옵니다(`React.lazy`).

---

<a id="api-proxy"></a>

## 서버와 통신하는 방법

> 쉽게 말하면: 브라우저가 백엔드 서버에 직접 연결하지 않고, 같은 사이트 주소(`/api`)로 요청하면 Vercel이 대신 서버에 전달합니다. 보안 경고 없이 안전하게 통신하기 위한 구조입니다.

```txt
브라우저 -> https://<vercel-domain>/api/user/login   -> /api/proxy -> API_PROXY_TARGET/user/login
브라우저 -> https://<vercel-domain>/uploads/a.svg    -> /api/proxy -> UPLOADS_PROXY_TARGET/a.svg
```

### Mixed Content 대응

HTTPS(보안 연결) 사이트에서 HTTP(일반 연결) 이미지나 API를 바로 부르면 브라우저가 막습니다. 백엔드 응답에 `http://.../uploads/...` 이미지 주소가 있으면 `resolveRemoteAssetUrl`이 `/uploads/...`로 바꾸고, Vercel이 백엔드로 전달합니다.

```txt
http://<backend-origin>/uploads/image.svg -> /uploads/image.svg -> UPLOADS_PROXY_TARGET/image.svg
```

---

<a id="deploy"></a>

## 배포

> 쉽게 말하면: GitHub의 `master` 브랜치에 코드가 합쳐지면 Vercel이 자동으로 사이트를 새로 만들어 올립니다.

```txt
Framework Preset: Vite
Build Command:    npm run build
Output Directory: dist
```

GitHub 저장소 최상위에 프로젝트 파일이 있으면 Root Directory는 비워 두거나 `.`로 둡니다. Production 환경변수에는 실제 백엔드 주소를 등록합니다.

```env
VITE_API_BASE_URL=/api
API_PROXY_TARGET=<backend-origin>/api
UPLOADS_PROXY_TARGET=<backend-origin>/uploads
```

- 환경변수를 추가하거나 고친 뒤에는 **다시 배포해야** 적용됩니다.
- `vercel.json`은 앱 주소만 `index.html`로 보내고, 없는 `/assets/*`·`.js`·`.css` 파일은 404로 응답합니다. 이전 배포의 파일을 찾다가 생기는 오류를 막기 위한 설정입니다.

---

<a id="pwa"></a>

## 앱처럼 설치하기 (PWA)

> 쉽게 말하면: 휴대폰 홈 화면에 아이콘을 추가해 앱처럼 쓸 수 있고, 한 번 방문하면 필요한 파일을 저장해 두어 다음부터 더 빨리 열립니다. 새 버전이 나오면 "새 버전이 있어요" 안내가 뜹니다.

- 파일 저장(서비스워커)은 첫 화면이 다 뜬 뒤에 시작해 처음 접속을 느리게 하지 않습니다.
- 모든 파일에 내용 기반 버전 표시(revision)를 붙여, 같은 이름으로 교체한 이미지·폰트도 업데이트됩니다 (`vite.config.js`).
- 이전 배포의 화면 파일을 불러오지 못하면 한 번만 자동 새로고침해 최신 버전을 받습니다 (`src/utils/staleChunkReload.js`).

새 버전이 반영되지 않으면 브라우저 개발자 도구 콘솔에서 아래 코드를 실행해 저장된 파일을 지운 뒤 새로고침합니다.

```js
navigator.serviceWorker.getRegistrations()
  .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
  .then(() => caches.keys())
  .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  .then(() => location.reload())
```

---

<a id="mobile"></a>

## 모바일 대응

> 쉽게 말하면: 휴대폰 크기나 브라우저(사파리, 카카오톡 등)가 달라도 화면이 깨지지 않고 보기 좋게 맞춰지도록 한 부분입니다.

| 항목 | 내용 |
|---|---|
| 화면 크기에 맞춰 확대·축소 | 디자인 기준 폭(393px)에 맞춰 0.92~1.2배로 전체를 키우거나 줄임. 글자, 버튼, 배치가 함께 바뀌고 가장 작은 글자도 약 11px 이상 (`src/utils/appScale.js`) |
| 브라우저 / 설치 앱 구분 | 사파리·카카오톡 브라우저에서는 위아래 빈 여백을 줄이고, 홈 화면에 설치한 앱에서는 전체 화면 여백 사용 |
| 상태바 색 맞추기 | 화면 맨 위 색에 맞춰 사파리 상단 상태바 영역 색도 바꿈 (`PageTopColorSync`) |
| 키보드 대응 | 글자를 입력할 때만 화면 높이를 유지하고, 브라우저 툴바가 나타나거나 사라지면 실제 보이는 높이에 맞춤 |
| 컴퓨터 화면 | 768px 이상에서는 휴대폰 모양 틀 안에 표시 |

---

<a id="performance"></a>

## 성능 개선 자세히 보기

> 쉽게 말하면: 사이트가 느렸던 원인을 측정 도구로 찾아내고, 이미지·글꼴·코드를 가볍게 만들고, 꼭 필요한 것부터 먼저 받도록 순서를 바꿨습니다. 결과 요약은 [이렇게 빨라졌어요](#results)에 있습니다.

### 어떻게 측정했나요?

| 방법 | 설명 |
|---|---|
| 실험실 측정 (Lighthouse) | 휴대폰 환경(느린 4G, 느린 CPU)을 흉내 내 화면마다 여러 번 측정하고 중앙값 사용. 로그인이 필요한 화면은 자동화 도구(puppeteer)로 체험 계정 로그인 상태를 넣고 측정 |
| 실사용자 측정 (Vercel Speed Insights) | 실제 방문자 기기에서 측정한 속도를 화면별로 수집. 책 상세(`/book/1`, `/book/2` …)는 한 화면으로 묶음. Vercel 대시보드의 Speed Insights 탭에서 확인 |

### 1. 이미지를 가볍게 (SVG → WebP)

디자인 도구에서 내보낸 SVG 이미지 대부분이 실제로는 아주 큰 사진(2~3천 픽셀)을 품고 있었습니다. 예를 들어 화면에 43×48 크기로 보이는 캐릭터 그림이 1.3MB였습니다.

- 화면에 보이는 크기의 3배 해상도로 줄여 가벼운 WebP 형식으로 바꿨습니다.
- 원본과 나란히 비교해 눈으로 차이가 없는 것을 확인했습니다 (자르기, 좌우 반전, 회전도 원본과 동일).
- 새 이미지를 추가할 때는 **WebP 형식으로, 화면 크기의 2~3배 해상도**로 넣어 주세요.

### 2. 쓰지 않는 이미지 삭제

코드에서 쓰지 않는데 앱이 미리 받아 두던 파일(약 13MB)을 지웠습니다.

### 3. 글꼴을 가볍게

- 장식용 글꼴(tvN 즐거운이야기)은 "펼치는 순간, 나를 다독이다" 한 문장에만 쓰여서 그 글자만 남겼습니다 (2.9MB → 26KB). **문구를 바꾸면 글꼴 파일을 다시 만들어야 합니다** (`public/assets/fonts/README.md`).
- 로고 글꼴(Tropi Land)은 영문과 특수 글자만 남겼습니다. 로고 `NADOK`의 "NA"는 이 글꼴의 연결 글자(U+F046)라 지우면 안 됩니다.
- 기본 글꼴(Pretendard)은 화면에 필요한 글자 묶음만 받아 옵니다.

### 4. 화면별로 코드 나눠 받기

시작 화면과 로그인을 뺀 화면은 들어갈 때 필요한 만큼만 받습니다 (`src/routes/Router.jsx`). 메모 편집기처럼 무거운 부분이 첫 화면에서 빠집니다.

### 5. 꼭 필요한 것부터 먼저 받기

| 개선 | 쉽게 말하면 |
|---|---|
| 앱 파일 저장은 나중에 | 오프라인용 파일 저장(약 2.3MB)을 첫 화면이 다 뜬 뒤에 시작 |
| 지금 화면 먼저 | 들어온 주소의 화면 코드를 앱 시작과 동시에 요청 |
| 다른 화면은 한가할 때 | 다른 화면 코드는 여유가 있을 때 하나씩 미리 받고, 느린 회선이나 데이터 절약 모드에서는 받지 않음 |
| 큰 배경 이미지 먼저 | 화면에서 가장 큰 배경 이미지를 들어온 주소에 맞춰 가장 먼저 요청 (`index.html`) |
| 데모 모드 대기 시간 제거 | 체험용 데이터에 일부러 넣어 두었던 0.25초 대기를 없앰 |

### 6. 그 밖에

- 앱이 미리 저장하는 파일에 WebP 이미지를 포함했습니다 (`vite.config.js`).
- 스크롤바는 앱 전체에서 숨기고 스크롤은 그대로 됩니다 (`src/styles/_reset.scss`).

---

<a id="glossary"></a>

## 용어 풀이

| 용어 | 뜻 |
|---|---|
| LCP (Largest Contentful Paint) | 화면에서 가장 큰 요소(배경 이미지, 제목 등)가 다 보이기까지 걸린 시간. 2.5초 이내면 좋음 |
| INP (Interaction to Next Paint) | 버튼을 누르는 등 조작했을 때 화면이 반응하기까지 걸린 시간 |
| CLS (Cumulative Layout Shift) | 화면이 뜨는 동안 내용이 갑자기 밀리는 정도. 낮을수록 좋음 |
| Core Web Vitals | 구글이 정한 웹사이트 사용자 경험 핵심 지표 (LCP, INP, CLS) |
| Lighthouse | 구글이 만든 웹사이트 속도·품질 측정 도구 |
| PWA | 웹사이트를 휴대폰에 앱처럼 설치해 쓸 수 있게 하는 기술 |
| 서비스워커 | PWA에서 파일을 미리 저장해 두고 다음 방문을 빠르게 해 주는 기능 |
| WebP | 같은 품질에서 JPG·PNG보다 훨씬 가벼운 이미지 형식 |
| 배포 | 만든 코드를 인터넷에 올려 누구나 접속할 수 있게 하는 것 |
| 프록시 | 요청을 대신 받아 실제 서버로 전달해 주는 중간 다리 |
| 데모(더미 데이터) 모드 | 실제 서버 없이 미리 준비한 예시 데이터로 동작하는 체험용 상태 |
