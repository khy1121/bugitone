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
    key: "shop",
    label: "상점",
    path: ROUTES.SHOP,
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
        const isCharacterLandingActive =
          isCharacterLanding && item.key === "character" && isActive;

        const Icon = item.Icon;
        const iconColor = "#282723";
        const activeFillColor = isCharacterLandingActive
          ? "#FEFEFE"
          : isActive
            ? "#F8BC0A"
            : "transparent";

        const iconProps = {
          size: 24,
          active: isActive,
          color: iconColor,
          fillColor: activeFillColor,
        };

        if (item.key === "character") {
          iconProps.strokeColor = isCharacterLandingActive
            ? "#FEFEFE"
            : iconColor;

          iconProps.detailColor = isCharacterLandingActive
            ? "#F9C93B"
            : iconColor;
        }

        return (
          <button
            key={item.key}
            className={`bottom-nav__item ${
              isActive ? "bottom-nav__item--active" : ""
            }`}
            type="button"
            onClick={() => navigate(item.path)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              <Icon {...iconProps} />
            </span>

            <span className="bottom-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
