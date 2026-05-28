import React, { useEffect } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import SplashPage from '../pages/SplashPage/SplashPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import SignupPage from '../pages/SignupPage/SignupPage'
import NicknamePage from '../pages/NicknamePage/NicknamePage'
import LibraryPage from '../pages/LibraryPage/LibraryPage'
import BookDetailPage from '../pages/BookDetailPage/BookDetailPage'
import MemoEditPage from '../pages/MemoEditPage/MemoEditPage'
import CharacterPage from '../pages/CharacterPage/CharacterPage'
import CharacterErrorPage from '../pages/CharacterPage/CharacterErrorPage'
import AnalyzePage from '../pages/AnalyzePage/AnalyzePage'
import ResultPage from '../pages/ResultPage/ResultPage'
import InstallGuidePage from '../pages/InstallGuidePage/InstallGuidePage'
import MyPage from '../pages/MyPage/MyPage'
import ChatPage from '../pages/ChatPage/ChatPage'
import SearchPage from '../pages/SearchPage/SearchPage'
import ShopPage from '../pages/ShopPage/ShopPage'
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
  return (
    <BrowserRouter>
      <AuthNavigationGuard />
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
    </BrowserRouter>
  )
}
