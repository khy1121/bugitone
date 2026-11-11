import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
// 첫 진입 화면은 바로 그리도록 메인 번들에 포함
import SplashPage from '../pages/SplashPage/SplashPage'
import LoginPage from '../pages/LoginPage/LoginPage'

// 나머지 화면은 화면별 청크로 분리 (메모 편집기 tiptap 등 무거운 의존성이 첫 로드에서 빠짐)
const pageLoaders = {
  SignupPage: () => import('../pages/SignupPage/SignupPage'),
  NicknamePage: () => import('../pages/NicknamePage/NicknamePage'),
  LibraryPage: () => import('../pages/LibraryPage/LibraryPage'),
  BookDetailPage: () => import('../pages/BookDetailPage/BookDetailPage'),
  MemoEditPage: () => import('../pages/MemoEditPage/MemoEditPage'),
  CharacterPage: () => import('../pages/CharacterPage/CharacterPage'),
  CharacterErrorPage: () => import('../pages/CharacterPage/CharacterErrorPage'),
  AnalyzePage: () => import('../pages/AnalyzePage/AnalyzePage'),
  ResultPage: () => import('../pages/ResultPage/ResultPage'),
  InstallGuidePage: () => import('../pages/InstallGuidePage/InstallGuidePage'),
  MyPage: () => import('../pages/MyPage/MyPage'),
  ChatPage: () => import('../pages/ChatPage/ChatPage'),
  SearchPage: () => import('../pages/SearchPage/SearchPage'),
  ShopPage: () => import('../pages/ShopPage/ShopPage'),
}

const SignupPage = lazy(pageLoaders.SignupPage)
const NicknamePage = lazy(pageLoaders.NicknamePage)
const LibraryPage = lazy(pageLoaders.LibraryPage)
const BookDetailPage = lazy(pageLoaders.BookDetailPage)
const MemoEditPage = lazy(pageLoaders.MemoEditPage)
const CharacterPage = lazy(pageLoaders.CharacterPage)
const CharacterErrorPage = lazy(pageLoaders.CharacterErrorPage)
const AnalyzePage = lazy(pageLoaders.AnalyzePage)
const ResultPage = lazy(pageLoaders.ResultPage)
const InstallGuidePage = lazy(pageLoaders.InstallGuidePage)
const MyPage = lazy(pageLoaders.MyPage)
const ChatPage = lazy(pageLoaders.ChatPage)
const SearchPage = lazy(pageLoaders.SearchPage)
const ShopPage = lazy(pageLoaders.ShopPage)

// 첫 화면을 그린 뒤 브라우저가 한가할 때 나머지 화면 청크를 미리 받아 둠 (화면 전환 시 대기 없음)
function prefetchPages() {
  const run = () => Object.values(pageLoaders).forEach((load) => load().catch(() => {}))
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 })
  else window.setTimeout(run, 1500)
}

function PageFallback() {
  return <div style={{ minHeight: '100%', background: '#fefefe' }} aria-busy="true" />
}

import { ROUTES } from '../constants/routes'
import {
  clearAuthStorage,
  clearBackgroundSession,
  isAuthenticated,
  isBackgroundSessionExpired,
  markBackgroundSessionStarted,
} from '../utils/authStorage'

const PROTECTED_PATH_PREFIXES = [
  ROUTES.HOME,
  ROUTES.CHARACTER,
  '/book/',
  ROUTES.MEMO_EDIT,
  ROUTES.ANALYZE,
  ROUTES.RESULT,
  ROUTES.CHAT,
  ROUTES.MYPAGE,
  ROUTES.SEARCH,
  ROUTES.SHOP,
]

function isProtectedPath(pathname) {
  return PROTECTED_PATH_PREFIXES.some((path) =>
    pathname === path || pathname.startsWith(path),
  )
}

function AuthNavigationGuard() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyCurrentRoute = () => {
      if (isBackgroundSessionExpired()) {
        clearAuthStorage()
        navigate(ROUTES.LOGIN, { replace: true })
        return
      }

      if (document.visibilityState === 'visible') {
        clearBackgroundSession()
      }

      if (isProtectedPath(window.location.pathname) && !isAuthenticated()) {
        navigate(ROUTES.LOGIN, { replace: true })
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markBackgroundSessionStarted()
        return
      }

      verifyCurrentRoute()
    }

    verifyCurrentRoute()

    window.addEventListener('pageshow', verifyCurrentRoute)
    window.addEventListener('pagehide', markBackgroundSessionStarted)
    window.addEventListener('popstate', verifyCurrentRoute)
    window.addEventListener('focus', verifyCurrentRoute)
    window.addEventListener('blur', markBackgroundSessionStarted)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pageshow', verifyCurrentRoute)
      window.removeEventListener('pagehide', markBackgroundSessionStarted)
      window.removeEventListener('popstate', verifyCurrentRoute)
      window.removeEventListener('focus', verifyCurrentRoute)
      window.removeEventListener('blur', markBackgroundSessionStarted)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [location.pathname, navigate])

  return null
}

function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return children
}

function protectedElement(element) {
  return <RequireAuth>{element}</RequireAuth>
}

export default function Router() {
  useEffect(() => {
    prefetchPages()
  }, [])

  return (
    <BrowserRouter>
      <AuthNavigationGuard />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path={ROUTES.MAIN} element={<SplashPage />} />
          <Route path={ROUTES.HOME} element={protectedElement(<LibraryPage />)} />
          <Route path={ROUTES.CHARACTER} element={protectedElement(<CharacterPage />)} />
          <Route path={ROUTES.CHARACTER_ERROR} element={protectedElement(<CharacterErrorPage />)} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.NICKNAME} element={<NicknamePage />} />
          <Route path={ROUTES.BOOK_DETAIL} element={protectedElement(<BookDetailPage />)} />
          <Route path={ROUTES.MEMO_EDIT} element={protectedElement(<MemoEditPage />)} />
          <Route path={ROUTES.ANALYZE} element={protectedElement(<AnalyzePage />)} />
          <Route path={ROUTES.RESULT} element={protectedElement(<ResultPage />)} />
          <Route path={ROUTES.INSTALL_GUIDE} element={<InstallGuidePage />} />
          <Route path={ROUTES.CHAT} element={protectedElement(<ChatPage />)} />
          <Route path={ROUTES.MYPAGE} element={protectedElement(<MyPage />)} />
          <Route path={ROUTES.SEARCH} element={protectedElement(<SearchPage />)} />
          <Route path={ROUTES.SHOP} element={protectedElement(<ShopPage />)} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
