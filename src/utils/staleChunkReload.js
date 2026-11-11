// 새 버전이 배포되면 이전 배포의 화면별 JS 청크(파일명에 해시 포함)가 사라집니다.
// 이전 버전 화면을 열어 둔 상태에서 다른 화면으로 이동하면 없는 청크를 요청하게 되므로,
// 이때 한 번만 새로고침해 최신 버전을 받습니다. 무한 새로고침을 막기 위해 짧은 시간 안에는 다시 하지 않습니다.
const STORAGE_KEY = 'nadok:stale-chunk-reload-at'
const RELOAD_GUARD_MS = 10_000

export function reloadForStaleChunk() {
  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) || 0)
    if (Date.now() - last < RELOAD_GUARD_MS) return false
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // sessionStorage를 못 쓰는 환경에서는 새로고침하지 않음 (루프 방지)
    return false
  }
  window.location.reload()
  return true
}

// Vite가 동적 import의 선행 로드(JS/CSS)에 실패하면 보내는 이벤트
export function listenForStaleChunkErrors() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForStaleChunk()) event.preventDefault()
  })
}
