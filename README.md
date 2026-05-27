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
