# NADOK Frontend

NADOK은 독서 기록, 감정 분석, 캐릭터 추천, 채팅 기능을 제공하는 React 기반 프론트엔드입니다. Vite로 빌드하며, Vercel 배포 환경에서는 백엔드 API와 업로드 이미지를 Vercel Function 프록시를 통해 호출합니다.

## 기술 스택

- React 18
- Vite
- React Router
- Axios
- SCSS
- Tiptap
- Vite PWA
- Vercel Functions

## 로컬 실행

```bash
npm install
npm run dev
```

기본 개발 서버 주소는 다음과 같습니다.

```txt
http://localhost:5173
```

## 환경변수

로컬 개발 시 `.env.example`을 참고해 `.env`를 생성합니다.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:8080
API_PROXY_TARGET=http://localhost:8080/api
UPLOADS_PROXY_TARGET=http://localhost:8080/uploads
```

### 변수 설명

- `VITE_API_BASE_URL`: 브라우저에서 사용할 API 기본 경로입니다. 배포 환경에서는 `/api`를 사용합니다.
- `VITE_API_PROXY_TARGET`: Vite 개발 서버의 로컬 API 프록시 대상입니다.
- `API_PROXY_TARGET`: Vercel Function이 API 요청을 전달할 백엔드 주소입니다.
- `UPLOADS_PROXY_TARGET`: Vercel Function이 업로드 이미지 요청을 전달할 백엔드 업로드 경로입니다.

실제 서버 주소는 GitHub에 커밋하지 말고 Vercel 환경변수에만 등록합니다.

## 사용 가능한 스크립트

```bash
npm run dev
```

개발 서버를 실행합니다.

```bash
npm run build
```

프로덕션 빌드를 생성합니다. 결과물은 `dist` 디렉터리에 생성됩니다.

```bash
npm run preview
```

프로덕션 빌드 결과를 로컬에서 미리 확인합니다.

## 주요 디렉터리

```txt
api/                Vercel Function 프록시
public/             정적 파일과 PWA 리소스
src/api/            Axios 인스턴스와 API 호출 함수
src/components/     공통 UI 컴포넌트
src/constants/      라우트 등 상수
src/pages/          페이지 단위 화면
src/styles/         전역 SCSS와 변수
src/utils/          공통 유틸리티
```

## 라우팅

주요 화면 경로는 `src/constants/routes.js`에서 관리합니다.

```txt
/                  스플래시
/home              홈
/character         캐릭터
/analyze           감정 입력
/result            분석 결과
/mypage            마이페이지
/login             로그인
/signup            회원가입
/book/:id          도서 상세
/memo-edit         메모 작성/수정
/shop              코인샵
/chat              채팅
/search            검색
```

## API 프록시 구조

배포 환경에서는 브라우저가 백엔드 서버를 직접 호출하지 않습니다. 모든 API 요청은 같은 도메인의 `/api/*`로 보내고, Vercel Function이 백엔드로 전달합니다.

```txt
브라우저
  -> https://<vercel-domain>/api/user/login
  -> /api/proxy
  -> API_PROXY_TARGET/user/login
```

업로드 이미지도 같은 방식으로 처리합니다.

```txt
브라우저
  -> https://<vercel-domain>/uploads/example.svg
  -> /api/proxy
  -> UPLOADS_PROXY_TARGET/example.svg
```

이 구조는 HTTPS 페이지에서 HTTP 이미지나 API를 직접 요청할 때 발생하는 Mixed Content 문제를 피하기 위한 설정입니다.

## Vercel 배포 설정

Vercel 프로젝트 설정은 다음과 같이 구성합니다.

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

GitHub 저장소 루트에 이 프로젝트 파일들이 위치한다면 Root Directory는 비워두거나 `.`로 둡니다.

Vercel Production 환경변수에는 실제 백엔드 주소를 등록합니다.

```env
VITE_API_BASE_URL=/api
API_PROXY_TARGET=<backend-origin>/api
UPLOADS_PROXY_TARGET=<backend-origin>/uploads
```

환경변수를 추가하거나 수정한 뒤에는 반드시 새 배포를 실행해야 적용됩니다.

## 서비스워커 캐시 주의

PWA 서비스워커가 활성화되어 있으면 이전 배포의 JS나 캐시가 남아 있을 수 있습니다. 배포 후 변경사항이 반영되지 않거나 API/이미지 경로가 이전 값으로 보이면 브라우저에서 서비스워커와 캐시를 삭제한 뒤 새로고침합니다.

```js
navigator.serviceWorker.getRegistrations()
  .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
  .then(() => caches.keys())
  .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  .then(() => location.reload())
```

## Mixed Content 대응

백엔드 응답에 `http://.../uploads/...` 형태의 이미지 URL이 포함될 수 있습니다. 프론트에서는 `resolveRemoteAssetUrl` 유틸리티를 통해 해당 URL을 `/uploads/...`로 변환하고, Vercel 프록시가 이를 백엔드 업로드 경로로 전달합니다.

```txt
http://<backend-origin>/uploads/image.svg
-> /uploads/image.svg
-> UPLOADS_PROXY_TARGET/image.svg
```

## 성능 개선

이미지가 늦게 뜨고 첫 로딩이 무거웠던 문제를 개선했습니다. 수치는 `npm run build` 결과 기준입니다.

| 항목 | 개선 전 | 개선 후 |
|---|---|---|
| 서비스워커 사전 캐시 전체 용량 | 23MB | 2.3MB |
| 첫 로딩 JS (메인 번들) | 796KB (gzip 261KB) | 245KB (gzip 86KB) |
| 캐릭터·배경·책 이미지 12종 | 약 15.7MB | 약 190KB |
| 마이페이지 배너 | 1.9MB | 19KB |
| 코인 이미지 | 721KB | 28KB / 2KB |
| 장식 폰트 (tvN 즐거운이야기 / Tropi Land) | 2.9MB / 77KB | 26KB / 23KB |

### 1. PNG를 감싼 SVG를 WebP로 변환

피그마에서 내보낸 SVG 대부분이 벡터가 아니라 2~3천 px 크기의 PNG를 base64로 품고 있었습니다. 예를 들어 `resultChar`는 화면에 43×48px로 보이지만 안에 1299×1443 PNG가 들어 있어 1.3MB였습니다.

- 표시 크기의 3배 해상도 WebP로 변환하고 참조를 교체했습니다.
- SVG 안의 크롭(pattern transform), 좌우 반전, 회전은 원본과 동일하게 재현했고, 원본 SVG를 브라우저로 렌더링한 결과와 픽셀 비교로 확인했습니다.
- 새 이미지를 추가할 때는 **SVG로 감싼 PNG 대신 WebP를 쓰고, 표시 크기의 2~3배 해상도**로 넣어 주세요.

### 2. 사용하지 않는 이미지 삭제

코드에서 참조하지 않지만 서비스워커가 미리 캐시하던 파일(약 13MB)을 삭제했습니다.

### 3. 폰트 경량화

- tvN 즐거운이야기는 태그라인 "펼치는 순간, 나를 다독이다"에만 쓰여 해당 글자만 남긴 woff2 서브셋을 사용합니다. **문구를 바꾸면 서브셋을 다시 만들어야 합니다** (`public/assets/fonts/README.md`).
- Tropi Land는 영문 로고용이라 기본 라틴 문자만 남겼습니다.
- 두 폰트는 `index.html`에서 preload합니다.
- Pretendard는 페이지에 필요한 글자 묶음만 받는 `pretendard-dynamic-subset` CSS를 사용합니다.

### 4. 화면별 코드 분할

- 스플래시·로그인을 제외한 화면을 `React.lazy`로 분리했습니다 (`src/routes/Router.jsx`). 메모 편집기(tiptap)처럼 무거운 의존성이 첫 로드에서 빠집니다.
- 첫 화면이 뜬 뒤 `requestIdleCallback`으로 나머지 화면 코드를 미리 받아 두므로, 화면을 넘길 때 기다림이 없습니다.

### 5. 그 밖에

- 서비스워커 사전 캐시 대상에 `webp`를 추가했습니다 (`vite.config.js`).
- 첫 화면(스플래시) 배경은 CSS `background-image`라 늦게 요청되므로 `index.html`에서 preload합니다.

### 6. 로딩 우선순위 (2차 개선)

측정 방법: Lighthouse 모바일(시뮬레이션 slow 4G, CPU 4배 느리게)로 페이지별 5회 측정한 중앙값.
로그인이 필요한 화면은 puppeteer로 데모 계정 로그인 상태를 넣고 측정했습니다.

| 화면 | 개선 전 LCP | 개선 후 LCP | Lighthouse 점수 |
|---|---|---|---|
| 서재(홈) | 4.85s | 3.2~3.3s | 79 → 90~91 |
| 마이 | 4.49s | 2.8~3.0s | 78 → 92~94 |

- **서비스워커를 페이지 load 이후 등록**: 첫 방문 때 전체 파일(약 2.3MB)을 미리 받는 작업이 지금 화면 다운로드와 경쟁하지 않게 함
- **현재 화면 청크를 앱 시작과 동시에 요청**: React 렌더링을 기다리지 않음 (`src/routes/Router.jsx`)
- **다른 화면 미리 받기는 load 이후 한가할 때 하나씩**: 데이터 절약 모드·느린 회선(2g/3g)에서는 생략, 실행 비용이 큰 메모 편집기는 제외(서비스워커가 캐시)
- **화면별 LCP 배경 이미지 preload**: 서재·검색·캐릭터·채팅·스플래시 배경을 들어온 주소에 맞춰 HTML에서 미리 요청 (`index.html`)
- **더미 데이터 모드의 인위적 API 지연(250ms) 제거**
