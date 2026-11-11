<!-- ===================================================== -->
<!--                     PROJECT HEADER                    -->
<!-- ===================================================== -->

<h1 align="center">NADOK Frontend</h1>

<p align="center">
  <b>펼치는 순간, 나를 다독이다</b><br/>
  독서 기록 · 감정 분석 · 캐릭터 추천 · AI 채팅을 제공하는 모바일 웹앱(PWA)
</p>

<p align="center">
  <a href="https://bugitone.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-bugitone.vercel.app-F8BC0A?style=flat-square&logo=vercel&logoColor=white"/></a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white"/>
</p>

---

## 목차

1. [프로젝트 소개](#about)
2. [기술 스택](#tech-stack)
3. [시작하기](#getting-started)
4. [환경변수](#env)
5. [데모(더미 데이터) 모드](#mock-mode)
6. [디렉터리 구조](#structure)
7. [라우팅](#routing)
8. [API 프록시 구조](#api-proxy)
9. [Vercel 배포](#deploy)
10. [PWA · 서비스워커](#pwa)
11. [모바일 대응](#mobile)
12. [성능 개선](#performance)

---

<a id="about"></a>

## 프로젝트 소개

NADOK은 독서 기록, 감정 분석, 캐릭터 추천, 채팅 기능을 제공하는 React 기반 프론트엔드입니다.

- **서재** — 읽은 책·읽고 있는 책·찜한 책 관리, 도서 검색
- **메모** — 책별 독서 메모 작성 (Tiptap 에디터)
- **감정 분석** — 오늘의 일기와 감정으로 어울리는 책 속 캐릭터 추천
- **가독이 챗** — 책 내용을 바탕으로 AI 챗봇과 토론
- **월간 리포트** — 이 달 만난 캐릭터와 자주 느낀 감정

Vite로 빌드하며, Vercel 배포 환경에서는 백엔드 API와 업로드 이미지를 Vercel Function 프록시로 호출합니다.

---

<a id="tech-stack"></a>

## 기술 스택

### Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,vite,js,sass,html,css"/>
</p>

<p>
  <img src="https://img.shields.io/badge/React%20Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white"/>
  <img src="https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tiptap-3-000000?style=flat-square&logo=tiptap&logoColor=white"/>
  <img src="https://img.shields.io/badge/DOMPurify-3-1E90FF?style=flat-square"/>
</p>

### PWA / Deploy

<p>
  <img src="https://skillicons.dev/icons?i=vercel"/>
</p>

<p>
  <img src="https://img.shields.io/badge/vite--plugin--pwa-Workbox-5A0FC8?style=flat-square&logo=pwa&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vercel-Functions-000000?style=flat-square&logo=vercel&logoColor=white"/>
</p>

### Tools

<p>
  <img src="https://skillicons.dev/icons?i=git,github,figma"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Lighthouse-%EC%84%B1%EB%8A%A5%20%EC%B8%A1%EC%A0%95-F44B21?style=flat-square&logo=lighthouse&logoColor=white"/>
</p>

---

<a id="getting-started"></a>

## 시작하기

```bash
npm install
npm run dev
```

기본 개발 서버 주소는 `http://localhost:5173` 입니다.

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 (`dist/`) |
| `npm run preview` | 프로덕션 빌드를 로컬에서 미리 확인 |

---

<a id="env"></a>

## 환경변수

로컬 개발 시 `.env.example`을 참고해 `.env`를 생성합니다.

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
| `VITE_API_PROXY_TARGET` | Vite 개발 서버의 로컬 API 프록시 대상 |
| `API_PROXY_TARGET` | Vercel Function이 API 요청을 전달할 백엔드 주소 |
| `UPLOADS_PROXY_TARGET` | Vercel Function이 업로드 이미지 요청을 전달할 백엔드 업로드 경로 |
| `VITE_USE_MOCK` | `true`면 백엔드 없이 더미 데이터로 동작 ([데모 모드](#mock-mode)) |

> 실제 서버 주소는 GitHub에 커밋하지 말고 Vercel 환경변수에만 등록합니다.

---

<a id="mock-mode"></a>

## 데모(더미 데이터) 모드

`VITE_USE_MOCK=true`이면 백엔드 서버 없이 화면이 정상 동작합니다. 현재 배포 사이트는 이 모드로 운영 중입니다.

- 기존 API 코드(`src/api/*`)와 페이지 코드는 그대로 두고 `axiosInstance`의 adapter만 교체합니다 (`src/mock/`).
- 데이터는 브라우저 `localStorage`에 저장되어 새로고침해도 유지되고, 방문자마다 따로 저장됩니다.
- 로그인 화면에 "체험용 데모 모드" 안내가 표시되고, **로그인 버튼만 누르면 데모 계정으로 바로 입장**합니다.
- 데모 계정: `demo@nadok.com` / `demo1234`
- 백엔드를 다시 연결할 때는 Vercel 환경변수에서 `VITE_USE_MOCK`을 지우고 재배포합니다.

자세한 내용은 [`src/mock/README.md`](src/mock/README.md)를 참고하세요.

---

<a id="structure"></a>

## 디렉터리 구조

```txt
api/                Vercel Function 프록시
public/             정적 파일, PWA 리소스, 이미지(WebP)·폰트(woff2 서브셋)
src/api/            Axios 인스턴스와 API 호출 함수
src/components/     공통 UI 컴포넌트
src/constants/      라우트 등 상수
src/hooks/          뷰포트·키보드·드래그 스크롤 등 공통 훅
src/mock/           데모(더미 데이터) 모드
src/pages/          페이지 단위 화면
src/pwa/            서비스워커 등록·업데이트 안내
src/routes/         라우터 (화면별 코드 분할)
src/styles/         전역 SCSS와 변수
src/utils/          공통 유틸리티
```

---

<a id="routing"></a>

## 라우팅

주요 화면 경로는 `src/constants/routes.js`에서 관리합니다. 스플래시·로그인을 제외한 화면은 `React.lazy`로 분리되어 필요할 때 불러옵니다.

| 경로 | 화면 | 경로 | 화면 |
|---|---|---|---|
| `/` | 스플래시 | `/book/:id` | 도서 상세 |
| `/login` | 로그인 | `/memo-edit` | 메모 작성/수정 |
| `/signup` | 회원가입 | `/analyze` | 감정 입력 |
| `/home` | 서재(홈) | `/result` | 분석 결과 |
| `/search` | 검색 | `/character` | 캐릭터 |
| `/chat` | 가독이 챗 | `/mypage` | 마이페이지 |
| `/shop` | 코인샵 | `/install-guide` | 앱 설치 안내 |

---

<a id="api-proxy"></a>

## API 프록시 구조

배포 환경에서는 브라우저가 백엔드 서버를 직접 호출하지 않습니다. 모든 API 요청은 같은 도메인의 `/api/*`로 보내고, Vercel Function이 백엔드로 전달합니다.

```txt
브라우저 -> https://<vercel-domain>/api/user/login   -> /api/proxy -> API_PROXY_TARGET/user/login
브라우저 -> https://<vercel-domain>/uploads/a.svg    -> /api/proxy -> UPLOADS_PROXY_TARGET/a.svg
```

### Mixed Content 대응

HTTPS 페이지에서 HTTP 이미지나 API를 직접 요청할 때 생기는 Mixed Content 문제를 피하기 위한 구조입니다. 백엔드 응답에 `http://.../uploads/...` 이미지 URL이 있으면 `resolveRemoteAssetUrl`이 `/uploads/...`로 바꾸고, Vercel 프록시가 백엔드 업로드 경로로 전달합니다.

```txt
http://<backend-origin>/uploads/image.svg -> /uploads/image.svg -> UPLOADS_PROXY_TARGET/image.svg
```

---

<a id="deploy"></a>

## Vercel 배포

```txt
Framework Preset: Vite
Build Command:    npm run build
Output Directory: dist
```

GitHub 저장소 루트에 프로젝트 파일이 있으면 Root Directory는 비워두거나 `.`로 둡니다. Production 환경변수에는 실제 백엔드 주소를 등록합니다.

```env
VITE_API_BASE_URL=/api
API_PROXY_TARGET=<backend-origin>/api
UPLOADS_PROXY_TARGET=<backend-origin>/uploads
```

- 환경변수를 추가·수정한 뒤에는 **새 배포를 실행해야** 적용됩니다.
- `vercel.json`의 SPA rewrite는 앱 경로만 `index.html`로 보내고, 없는 `/assets/*`·`.js`·`.css` 파일은 404로 응답합니다 (이전 배포의 JS를 HTML로 받아 생기는 MIME 오류 방지).

---

<a id="pwa"></a>

## PWA · 서비스워커

- 서비스워커는 페이지 `load` 이후 등록되며, 모든 파일에 내용 기반 revision을 붙여 **같은 이름으로 교체한 이미지·폰트도 업데이트**됩니다 (`vite.config.js`).
- 새 배포가 감지되면 "새 버전이 있어요" 안내가 뜨고, 업데이트를 누르면 최신 버전이 적용됩니다.
- 이전 배포의 화면 청크를 불러오지 못하면 한 번만 자동 새로고침해 최신 버전을 받습니다 (`src/utils/staleChunkReload.js`).

배포 후 변경사항이 반영되지 않으면 브라우저 콘솔에서 서비스워커와 캐시를 지운 뒤 새로고침합니다.

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

| 항목 | 내용 |
|---|---|
| 화면 폭 비례 조절 | 393px 디자인을 화면 폭에 맞춰 0.92~1.2배로 확대·축소 (레이아웃·버튼·글자 함께), 가장 작은 글자도 약 11px 이상 (`src/utils/appScale.js`) |
| 브라우저 / 설치 앱 구분 | 사파리·카카오톡 인앱 브라우저에서는 상태바·홈 인디케이터 여백을 줄이고, 홈 화면 설치 앱에서는 전체 화면 여백 사용 |
| 상태바 색 | 화면마다 맨 위 색에 맞춰 `theme-color`와 배경색을 바꿔 사파리 상태바 영역 색을 맞춤 (`PageTopColorSync`) |
| 키보드 대응 | 입력 중에만 화면 높이를 유지하고, 툴바가 나타나거나 사라지면 실제 보이는 높이를 따라감 |
| 데스크탑 | 768px 이상에서는 핸드폰 모양 프레임 안에 표시 |

---

<a id="performance"></a>

## 성능 개선

이미지가 늦게 뜨고 첫 로딩이 무거웠던 문제를 측정하고 개선했습니다.

### 결과 요약

**용량** (`npm run build` 기준)

| 항목 | 개선 전 | 개선 후 |
|---|---|---|
| 서비스워커 사전 캐시 전체 용량 | 23MB | 2.3MB |
| 첫 로딩 JS (메인 번들) | 796KB (gzip 261KB) | 245KB (gzip 86KB) |
| 캐릭터·배경·책 이미지 12종 | 약 15.7MB | 약 190KB |
| 마이페이지 배너 | 1.9MB | 19KB |
| 코인 이미지 | 721KB | 28KB / 2KB |
| 장식 폰트 (tvN 즐거운이야기 / Tropi Land) | 2.9MB / 77KB | 26KB / 23KB |

**로딩 속도** (배포 사이트, Lighthouse 모바일)

| 화면 | 성능 점수 | LCP |
|---|---|---|
| 서재(홈) | 85 → **94** | 3.92s → **2.70s** |
| 마이 | 88 → **97** | 3.47s → **2.27s** |
| 가독이 챗 | 85 → **93** | 3.62s → **2.45s** |

> 측정 방법: Lighthouse 모바일(시뮬레이션 slow 4G, CPU 4배 느리게). 로그인이 필요한 화면은 puppeteer로 데모 계정 로그인 상태를 넣고 측정. 개선 전은 1회, 개선 후는 3회 측정 중앙값입니다.

### 1. PNG를 감싼 SVG를 WebP로 변환

피그마에서 내보낸 SVG 대부분이 벡터가 아니라 2~3천 px 크기의 PNG를 base64로 품고 있었습니다. 예를 들어 `resultChar`는 화면에 43×48px로 보이지만 안에 1299×1443 PNG가 들어 있어 1.3MB였습니다.

- 표시 크기의 3배 해상도 WebP로 변환하고 참조를 교체했습니다.
- SVG 안의 크롭(pattern transform), 좌우 반전, 회전은 원본과 동일하게 재현했고, 원본 SVG를 브라우저로 렌더링한 결과와 픽셀 비교로 확인했습니다.
- 새 이미지를 추가할 때는 **SVG로 감싼 PNG 대신 WebP를 쓰고, 표시 크기의 2~3배 해상도**로 넣어 주세요.

### 2. 사용하지 않는 이미지 삭제

코드에서 참조하지 않지만 서비스워커가 미리 캐시하던 파일(약 13MB)을 삭제했습니다.

### 3. 폰트 경량화

- tvN 즐거운이야기는 태그라인 "펼치는 순간, 나를 다독이다"에만 쓰여 해당 글자만 남긴 woff2 서브셋을 사용합니다. **문구를 바꾸면 서브셋을 다시 만들어야 합니다** (`public/assets/fonts/README.md`).
- Tropi Land는 영문 로고용이라 기본 라틴 문자와 대체 글자·합자 글리프만 남겼습니다. 로고 `NADOK`의 "NA"는 합자 글리프(U+F046)입니다.
- 두 폰트는 `index.html`에서 preload합니다.
- Pretendard는 페이지에 필요한 글자 묶음만 받는 `pretendard-dynamic-subset` CSS를 사용합니다.

### 4. 화면별 코드 분할

- 스플래시·로그인을 제외한 화면을 `React.lazy`로 분리했습니다 (`src/routes/Router.jsx`). 메모 편집기(tiptap)처럼 무거운 의존성이 첫 로드에서 빠집니다.

### 5. 로딩 우선순위

| 개선 | 내용 |
|---|---|
| 서비스워커 등록 시점 | 페이지 `load` 이후 등록해, 전체 파일(약 2.3MB)을 미리 받는 작업이 지금 화면 다운로드와 경쟁하지 않게 함 |
| 현재 화면 먼저 | 현재 주소의 화면 청크를 앱 시작과 동시에 요청 (React 렌더링을 기다리지 않음) |
| 다른 화면 미리 받기 | `load` 이후 한가할 때 하나씩. 데이터 절약 모드·느린 회선(2g/3g)에서는 생략, 실행 비용이 큰 메모 편집기는 제외 |
| LCP 배경 이미지 preload | 서재·검색·캐릭터·채팅·스플래시 배경을 들어온 주소에 맞춰 HTML에서 미리 요청 (`index.html`) |
| 데모 모드 지연 제거 | 더미 데이터 모드의 인위적 API 지연(250ms) 제거 |

### 6. 그 밖에

- 서비스워커 사전 캐시 대상에 `webp`를 추가했습니다 (`vite.config.js`).
- 스크롤바는 앱 전체에서 숨기고 스크롤 동작은 유지합니다 (`src/styles/_reset.scss`).
