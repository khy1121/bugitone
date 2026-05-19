import React from 'react'
import {
  NavMemoIcon,
  NavChatIcon,
  NavLibraryIcon,
  NavCharacterIcon,
  NavUserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  SearchIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  HandwritingIcon,
  HighlighterIcon,
  LibraryAddIcon,
  ShareIcon,
} from '../../../assets/icons'
import './Icon.scss'

const ICON_MAP = {
  'nav-memo': NavMemoIcon,
  'nav-chat': NavChatIcon,
  'nav-library': NavLibraryIcon,
  'nav-character': NavCharacterIcon,
  'nav-user': NavUserIcon,

  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'arrow-up': ArrowUpIcon,

  search: SearchIcon,
  check: CheckIcon,
  trash: TrashIcon,
  pencil: PencilIcon,
  star: StarIcon,
  handwriting: HandwritingIcon,
  highlighter: HighlighterIcon,
  'library-add': LibraryAddIcon,
  share: ShareIcon,
}

export default function Icon({
  name,
  size = 24,
  color = 'currentColor',
  active = false,
  filled = false,
  fillColor = '#F9C93B',
  className = '',
  ...rest
}) {
  const IconComponent = ICON_MAP[name]

  if (!IconComponent) {
    console.warn(`[Icon] "${name}" 아이콘을 찾을 수 없습니다.`)
    return null
  }

  const classNames = ['icon', className].filter(Boolean).join(' ')

  return (
    <span
      className={classNames}
      style={{
        '--icon-size': `${size}px`,
        color,
      }}
      aria-hidden="true"
    >
      <IconComponent
        size={size}
        color={color}
        active={active}
        filled={filled}
        fillColor={fillColor}
        {...rest}
      />
    </span>
  )
}