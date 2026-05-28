import { resolveRemoteAssetUrl } from './resolveAssetUrl'

const PROFILE_IMAGE_CACHE_PREFIX = 'profileImage:'
const BACKGROUND_SESSION_STARTED_AT_KEY = 'backgroundSessionStartedAt'
const BACKGROUND_SESSION_LIMIT_MS = 10 * 60 * 1000

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
  BACKGROUND_SESSION_STARTED_AT_KEY,
]

function normalizeStoredDate(value) {
  if (!value) return ''
  return `${value}`.slice(0, 10).replace(/-/g, '.')
}

function getProfileImageCacheKey(userId) {
  return userId ? `${PROFILE_IMAGE_CACHE_PREFIX}${userId}` : ''
}

export function storeUserProfile(profile, fallback = {}) {
  const userId = profile?.userId ?? profile?.id ?? fallback.userId
  const profileImageCacheKey = getProfileImageCacheKey(userId)
  const cachedProfileImage = profileImageCacheKey
    ? localStorage.getItem(profileImageCacheKey)
    : ''
  const birthday =
    profile?.birthday ?? profile?.birthDay ?? profile?.birthdate ?? fallback.birthday
  const gender = profile?.gender ?? profile?.Gender ?? fallback.gender
  const profileImage =
    profile?.profileImgUrl ??
    profile?.profileImageUrl ??
    profile?.profileImage ??
    fallback.profileImage ??
    cachedProfileImage

  if (userId) localStorage.setItem('userId', String(userId))
  localStorage.setItem('nickname', profile?.nickname ?? fallback.nickname ?? '')
  localStorage.setItem('email', profile?.email ?? fallback.email ?? '')
  localStorage.setItem('birthday', normalizeStoredDate(birthday))
  localStorage.setItem('gender', gender ?? '')
  const resolvedProfileImage = resolveRemoteAssetUrl(profileImage, '')
  localStorage.setItem('profileImage', resolvedProfileImage)
  if (profileImageCacheKey && resolvedProfileImage) {
    localStorage.setItem(profileImageCacheKey, resolvedProfileImage)
  }
  clearBackgroundSession()
}

export function getStoredUserId() {
  const userId = Number(localStorage.getItem('userId'))
  return Number.isFinite(userId) && userId > 0 ? userId : null
}

export function markBackgroundSessionStarted() {
  if (!getStoredUserId()) return
  localStorage.setItem(BACKGROUND_SESSION_STARTED_AT_KEY, String(Date.now()))
}

export function clearBackgroundSession() {
  localStorage.removeItem(BACKGROUND_SESSION_STARTED_AT_KEY)
}

export function isBackgroundSessionExpired() {
  if (!getStoredUserId()) return false

  const startedAt = Number(localStorage.getItem(BACKGROUND_SESSION_STARTED_AT_KEY))
  if (!Number.isFinite(startedAt) || startedAt <= 0) return false

  return Date.now() - startedAt >= BACKGROUND_SESSION_LIMIT_MS
}

export function isAuthenticated() {
  return Boolean(getStoredUserId()) && !isBackgroundSessionExpired()
}

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  sessionStorage.clear()
}
