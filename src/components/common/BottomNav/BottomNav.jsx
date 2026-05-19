import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import {
  NavMemoIcon,
  NavChatIcon,
  NavLibraryIcon,
  NavCharacterIcon,
  NavUserIcon,
} from "../../../assets/icons";
import "./BottomNav.scss";

const NAV_ITEMS = [
  {
    key: "memo",
    label: "메모",
    path: ROUTES.MEMO_EDIT,
    Icon: NavMemoIcon,
  },
  {
    key: "chat",
    label: "가독이 챗",
    path: ROUTES.CHAT,
    Icon: NavChatIcon,
  },
  {
    key: "library",
    label: "서재",
    path: ROUTES.HOME,
    Icon: NavLibraryIcon,
  },
  {
    key: "character",
    label: "캐릭터",
    path: ROUTES.CHARACTER,
    Icon: NavCharacterIcon,
  },
  {
    key: "my",
    label: "마이",
    path: ROUTES.MYPAGE,
    Icon: NavUserIcon,
  },
];

export default function BottomNav({ active = "library", className = "" }) {
  const navigate = useNavigate();

  const isCharacterLanding = className.includes(
    "bottom-nav--character-landing",
  );
  const classNames = ["bottom-nav", className].filter(Boolean).join(" ");

  return (
    <nav className={classNames} aria-label="하단 메뉴">
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        const Icon = item.Icon;

        const iconColor =
          isCharacterLanding && isActive
            ? "#F9C93B" // 얼굴 눈/입 색
            : isActive
              ? "#FEFEFE"
              : "#282723";

        const activeFillColor =
          isCharacterLanding && isActive
            ? "#FEFEFE" // 얼굴 원 내부 흰색
            : isActive
              ? "#F9C93B"
              : "transparent";

        return (
          <button
            key={item.key}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`}
            type="button"
            onClick={() => navigate(item.path)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              <Icon
                active={isActive}
                color={iconColor}
                fillColor={activeFillColor}
              />
            </span>

            <span className="bottom-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
