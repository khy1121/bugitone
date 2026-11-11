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

// 청크 로드에 실패하면(이전 배포의 파일) 한 번 새로고침해 최신 버전을 받음
function lazyPage(loader) {
  return lazy(() =>
    loader().catch((error) => {
      if (reloadForStaleChunk()) return new Promise(() => {})
      throw error
    }),
  )
}

const SignupPage = lazyPage(pageLoaders.SignupPage)
const NicknamePage = lazyPage(pageLoaders.NicknamePage)
const LibraryPage = lazyPage(pageLoaders.LibraryPage)
const BookDetailPage = lazyPage(pageLoaders.BookDetailPage)
const MemoEditPage = lazyPage(pageLoaders.MemoEditPage)
const CharacterPage = lazyPage(pageLoaders.CharacterPage)
const CharacterErrorPage = lazyPage(pageLoaders.CharacterErrorPage)
const AnalyzePage = lazyPage(pageLoaders.AnalyzePage)
const ResultPage = lazyPage(pageLoaders.ResultPage)
const InstallGuidePage = lazyPage(pageLoaders.InstallGuidePage)
const MyPage = lazyPage(pageLoaders.MyPage)
const ChatPage = lazyPage(pageLoaders.ChatPage)
const SearchPage = lazyPage(pageLoaders.SearchPage)
const ShopPage = lazyPage(pageLoaders.ShopPage)

// 현재 주소의 화면 청크를 앱 시작과 동시에 요청 (React 렌더링을 기다리지 않음)
const ROUTE_LOADER_KEYS = [
  [ROUTES.HOME, 'LibraryPage'],
  [ROUTES.MYPAGE, 'MyPage'],
  [ROUTES.CHAT, 'ChatPage'],
  [ROUTES.CHARACTER_ERROR, 'CharacterErrorPage'],
  [ROUTES.CHARACTER, 'CharacterPage'],
  [ROUTES.ANALYZE, 'AnalyzePage'],
  [ROUTES.RESULT, 'ResultPage'],
  [ROUTES.SEARCH, 'SearchPage'],
  [ROUTES.SHOP, 'ShopPage'],
  [ROUTES.MEMO_EDIT, 'MemoEditPage'],
  [ROUTES.NICKNAME, 'NicknamePage'],
  [ROUTES.SIGNUP, 'SignupPage'],
  [ROUTES.INSTALL_GUIDE, 'InstallGuidePage'],
  ['/book/', 'BookDetailPage'],
]

function preloadCurrentRoute() {
  const { pathname } = window.location
  const match = ROUTE_LOADER_KEYS.find(([path]) => pathname === path || pathname.startsWith(path))
  if (match) pageLoaders[match[1]]().catch(() => {})
}
preloadCurrentRoute()

// 나머지 화면 청크는 페이지 load 이후 한가할 때 하나씩 미리 받음
// (지금 화면의 JS·이미지와 대역폭을 나눠 쓰지 않도록 가벼운 화면부터 하나씩.
//  메모 편집기(tiptap)는 실행 비용이 커서 제외: 서비스워커가 백그라운드에서 파일을 미리 캐시해 둠)
const PREFETCH_ORDER = [
  'LibraryPage', 'CharacterPage', 'ChatPage', 'MyPage', 'AnalyzePage', 'ResultPage',
  'BookDetailPage', 'SearchPage', 'ShopPage', 'SignupPage', 'NicknamePage',
  'CharacterErrorPage', 'InstallGuidePage',
]

function shouldSkipPrefetch() {
  const connection = navigator.connection
  return Boolean(connection?.saveData || /(^|-)2g$|^3g$/.test(connection?.effectiveType ?? ''))
}

function prefetchPages() {
  if (shouldSkipPrefetch()) return

  const runSequentially = async () => {
    for (const key of PREFETCH_ORDER) {
      await pageLoaders[key]().catch(() => {})
    }
  }
  const scheduleIdle = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(runSequentially, { timeout: 4000 })
    else window.setTimeout(runSequentially, 2000)
  }

  if (document.readyState === 'complete') scheduleIdle()
  else window.addEventListener('load', scheduleIdle, { once: true })
}

// Vercel Speed Insights: 실제 사용자 기기에서 측정한 Core Web Vitals(LCP·INP·CLS 등)를 화면별로 수집
// 책 상세(/book/1, /book/2 …)는 한 화면으로 묶어 집계
function SpeedInsightsTracker() {
  const { pathname } = useLocation()
  const route = pathname.startsWith('/book/') ? '/book/[id]' : pathname
  return <SpeedInsights route={route} />
}

function PageFallback() {
  return <div style={{ minHeight: '100%', background: '#fefefe' }} aria-busy="true" />
}

import { ROUTES } from '../constants/routes'
import { reloadForStaleChunk } from '../utils/staleChunkReload'
import PageTopColorSync from '../components/common/PageTopColorSync'
import { SpeedInsights } from '@vercel/speed-insights/react'
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
      <PageTopColorSync />
      <SpeedInsightsTracker />
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
