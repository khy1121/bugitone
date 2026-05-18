import React from 'react'
import { useNavigate } from 'react-router-dom'
import { mockBooks } from '../../../data/mockBooks'
import { ROUTES } from '../../../constants/routes'
import {
  NavMemoIcon,
  NavChatIcon,
  NavLibraryIcon,
  NavCharacterIcon,
  NavUserIcon,
  charmemoIcon as CharacterMemoIcon,
  charchatIcon as CharacterChatIcon,
  charlibraryIcon as CharacterLibraryIcon,
  charcharacterIcon as CharacterCharacterIcon,
  charuserIcon as CharacterUserIcon,
} from '../../../assets/icons'
import './BottomNav.scss'

const NAV_ITEMS = [
  { id: 'memo',      label: '메모',      path: ROUTES.MEMO_EDIT, Icon: NavMemoIcon,      CharacterIcon: CharacterMemoIcon },
  { id: 'chat',      label: '가독이 챗',  path: ROUTES.CHAT,      Icon: NavChatIcon,      CharacterIcon: CharacterChatIcon },
  { id: 'library',   label: '서재',      path: ROUTES.HOME,      Icon: NavLibraryIcon,   CharacterIcon: CharacterLibraryIcon },
  { id: 'character', label: '캐릭터',    path: ROUTES.CHARACTER,  Icon: NavCharacterIcon, CharacterIcon: CharacterCharacterIcon },
  { id: 'mypage',    label: '마이',      path: ROUTES.MYPAGE,    Icon: NavUserIcon,      CharacterIcon: CharacterUserIcon },
]

export default function BottomNav({ active = 'library', className = '' }) {
  const navigate = useNavigate()
  const isCharacterLanding = className.split(' ').includes('bottom-nav--character-landing')

  const handleNavigate = (item) => {
    if (item.id === 'memo') {
      navigate(item.path, { state: { bookId: mockBooks[0]?.id ?? 1 } })
      return
    }
    navigate(item.path)
  }

  return (
    <nav className={`bottom-nav${className ? ` ${className}` : ''}`} aria-label="하단 내비게이션">
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id
        const Icon = isCharacterLanding && isActive ? item.CharacterIcon : item.Icon
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleNavigate(item)}
          >
            <span className="bottom-nav__icon-wrap" aria-hidden="true">
              <Icon active={isActive} fillColor="var(--bottom-nav-active-fill)" />
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
