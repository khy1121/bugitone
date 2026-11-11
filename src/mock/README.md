# 더미 데이터 모드 (src/mock)

백엔드 서버 없이 프론트 화면이 정상 동작하도록 가짜 API 응답을 돌려주는 모드입니다.
기존 API 코드(`src/api/*`)와 페이지 코드는 수정하지 않고, `axiosInstance`의 adapter만 교체합니다.

## 켜고 끄기

| 환경 | 설정 |
|---|---|
| 로컬 | `.env.local`에 `VITE_USE_MOCK=true` 추가 후 `npm run dev` |
| Vercel | Project Settings → Environment Variables에 `VITE_USE_MOCK=true` 추가 후 재배포 |

백엔드를 다시 붙일 때는 `VITE_USE_MOCK`을 지우거나 `false`로 바꾸면 됩니다.

## 동작 방식

- 데이터는 브라우저 `localStorage`(`nadok:mockdb:v2`)에 저장됩니다. 새로고침해도 유지되고, 방문자마다 따로 저장됩니다.
- 처음 보는 이메일로 로그인하면 자동으로 계정이 만들어지고, 샘플 서재/메모/채팅/감정 기록이 채워집니다.
- 데모 계정: `demo@nadok.com` / `demo1234`
- 감정 분석은 선택한 감정 태그와 캐릭터 키워드를 비교해 5명 중 한 명을 추천합니다.
- 채팅 답변과 책 검색(10권)은 `data.js`에 정의된 고정 데이터를 사용합니다.
- 책 표지와 캐릭터 이미지는 팀 피그마 시안의 원본 에셋을 WebP로 변환해 `public/mock/`에 두었습니다.
- 데이터 초기화: 브라우저 콘솔에서 `localStorage.removeItem('nadok:mockdb:v2')`

## 파일

- `index.js` — 모드 스위치, axios adapter
- `handlers.js` — API 경로별 가짜 응답 (백엔드 DTO 형식과 동일)
- `db.js` — localStorage 저장소, 샘플 데이터 시드
- `data.js` — 책 카탈로그, 캐릭터, 채팅 답변 템플릿
- `public/mock/books`, `public/mock/characters` — 피그마에서 가져온 책 표지 / 캐릭터 이미지
