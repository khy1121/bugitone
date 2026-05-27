const AUTH_STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'token',
  'userId',
  'nickname',
  'email',
  'profileImage',
  'birthday',
  'gender',
]

export function getStoredUserId() {
  const userId = Number(localStorage.getItem('userId'))
  return Number.isFinite(userId) && userId > 0 ? userId : null
}

export function isAuthenticated() {
  return Boolean(getStoredUserId())
}

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  sessionStorage.clear()
}
