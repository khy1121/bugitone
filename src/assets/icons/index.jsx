/**
 * IdeaTone Icon Library
 * All UI icons as React SVG components.
 * Usage:  import { ChevronLeftIcon } from '../../assets/icons'
 *         or via <Icon name="chevron-left" size={24} />
 */

// ─── Navigation (BottomNav) ────────────────────────────────────────────────

export const NavMemoIcon = ({ size = 26, color = 'currentColor', active = false, fillColor = '#F9C93B', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <path d="M20.203 8.20631L13.2662 15.4206C12.7375 15.9704 12.0752 16.3605 11.3499 16.549L8.33331 17.3333L9.08745 14.1961C9.26877 13.4418 9.6438 12.753 10.1725 12.2031L17.1093 4.98885L18.1405 3.91636C18.9949 3.02788 20.38 3.02788 21.2343 3.91636C22.0885 4.80484 22.0885 6.24534 21.2343 7.13382L20.203 8.20631ZM17.1093 4.98885L20.203 8.20631" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M19.7916 14.625C19.7916 18.1864 19.7916 19.9671 18.8458 21.1657C18.6727 21.3851 18.4793 21.5862 18.2682 21.7663C17.1158 22.75 15.4035 22.75 11.9791 22.75H11.4583C7.52996 22.75 5.56579 22.75 4.34541 21.4807C3.12503 20.2116 3.125 18.1688 3.125 14.0833V13.5416C3.125 9.98019 3.125 8.19948 4.07077 7.00094C4.24393 6.78152 4.4374 6.58031 4.64837 6.40023C5.80082 5.41663 7.51304 5.41663 10.9375 5.41663" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const NavChatIcon = ({ size = 24, color = 'currentColor', active = false, fillColor = '#F9C93B', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <g clipPath="url(#nav-chat-clip)">
      <path
        d="M12.855 1.827a1.25 1.25 0 0 0-1.71 0L9.48 3.386a3.25 3.25 0 0 1-2.2.74l-2.28-.075a1.25 1.25 0 0 0-1.274 1.274l-.075 2.28a3.25 3.25 0 0 1-.741 2.2L1.827 11.145a1.25 1.25 0 0 0 0 1.71l1.559 1.675a3.25 3.25 0 0 1 .74 2.2l-.075 2.28a1.25 1.25 0 0 0 1.274 1.274l2.28-.075a3.25 3.25 0 0 1 2.2.74l1.666 1.56a1.25 1.25 0 0 0 1.71 0l1.675-1.56a3.25 3.25 0 0 1 2.2-.74l2.28.075a1.25 1.25 0 0 0 1.274-1.274l.075-2.28a3.25 3.25 0 0 1 .74-2.2l1.56-1.675a1.25 1.25 0 0 0 0-1.71l-1.56-1.675a3.25 3.25 0 0 1-.74-2.2l-.075-2.28a1.25 1.25 0 0 0-1.274-1.274l-2.28.075a3.25 3.25 0 0 1-2.2-.74L12.855 1.827Z"
        fill={active ? fillColor : 'none'}
        stroke={color}
        strokeWidth="1.5"
      />
      <ellipse cx="9" cy="10.5" rx="0.6" ry="1" stroke={color} />
      <ellipse cx="15" cy="10.5" rx="0.6" ry="1" stroke={color} />
    </g>
    <defs>
      <clipPath id="nav-chat-clip">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const NavLibraryIcon = ({ size = 26, color = 'currentColor', active = false, fillColor = '#F9C93B', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" {...p}>
    <path
      d="M13 6.117l1.1-.412c2.504-.939 5.297-.939 7.8 0 .665.249 1.1.853 1.1 1.524V19.08c0 .921-.993 1.552-1.905 1.209-1.987-.745-4.203-.745-6.19 0L13.014 21 13 6.117Z"
      fill={active ? fillColor : 'none'}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M13 6.117l-1.1-.412c-2.504-.939-5.297-.939-7.8 0C3.435 5.954 3 6.558 3 7.229V19.08c0 .921.992 1.552 1.905 1.209 1.987-.745 4.203-.745 6.19 0L12.986 21 13 6.117Z"
      fill={active ? fillColor : 'none'}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

export const NavCharacterIcon = ({
  size = 26,
  color = 'currentColor',
  active = false,
  fillColor = '#F9C93B',
  ...p
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <circle
      cx="12"
      cy="12"
      r="9.75"
      fill={active ? fillColor : 'none'}
      stroke={color}
      strokeWidth="1.5"
    />

    <path
      d="M9 15c2.347 1.254 3.707 1.222 6 0"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    <circle cx="9" cy="11" r="0.65" fill={color} />
    <circle cx="15" cy="11" r="0.65" fill={color} />
  </svg>
)

export const NavUserIcon = ({ size = 19, color = 'currentColor', active = false, fillColor = '#F9C93B', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <circle cx="4" cy="4" r="4" transform="matrix(-1 0 0 1 11.75 0.75)" stroke={color} strokeWidth="1.5" />
    <path d="M0.75 14.6847C0.75 13.8243 1.29085 13.0568 2.10109 12.7675C5.75404 11.4628 9.74596 11.4628 13.3989 12.7675C14.2091 13.0568 14.75 13.8243 14.75 14.6847V16.0002C14.75 17.1876 13.6983 18.0998 12.5228 17.9318L11.5684 17.7955C9.03565 17.4337 6.46435 17.4337 3.93162 17.7955L2.97721 17.9318C1.8017 18.0998 0.75 17.1876 0.75 16.0002V14.6847Z" stroke={color} strokeWidth="1.5" />
  </svg>
)


// ─── char active Navigation (BottomNav) ────────────────────────────────────────────────
export const charmemoIcon = ({ size = 24, color = 'currentColor', ...p }) => (
 <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.203 8.20631L13.2662 15.4206C12.7375 15.9704 12.0752 16.3605 11.3499 16.549L8.33331 17.3333L9.08745 14.1961C9.26877 13.4418 9.6438 12.753 10.1725 12.2031L17.1093 4.98885L18.1405 3.91636C18.9949 3.02788 20.38 3.02788 21.2343 3.91636C22.0885 4.80484 22.0885 6.24534 21.2343 7.13382L20.203 8.20631ZM17.1093 4.98885L20.203 8.20631" stroke="#FEFEFE" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M19.7916 14.625C19.7916 18.1864 19.7916 19.9671 18.8458 21.1657C18.6727 21.3851 18.4793 21.5862 18.2682 21.7663C17.1158 22.75 15.4035 22.75 11.9791 22.75H11.4583C7.52996 22.75 5.56579 22.75 4.34541 21.4807C3.12503 20.2116 3.125 18.1688 3.125 14.0833V13.5416C3.125 9.98019 3.125 8.19948 4.07077 7.00094C4.24393 6.78152 4.4374 6.58031 4.64837 6.40023C5.80082 5.41663 7.51304 5.41663 10.9375 5.41663" stroke="#FEFEFE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

)

export const charchatIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1116_4729)">
<path d="M12.8545 1.82715C12.3739 1.37732 11.6261 1.37732 11.1455 1.82715L9.47949 3.38574C8.99289 3.84118 8.35753 4.1049 7.69141 4.12695L5.41016 4.20215C4.75241 4.22403 4.22403 4.75241 4.20215 5.41016L4.12695 7.69141C4.1049 8.35753 3.84118 8.99289 3.38574 9.47949L1.82715 11.1455C1.37732 11.6261 1.37732 12.3739 1.82715 12.8545L3.38574 14.5205C3.84118 15.0071 4.1049 15.6425 4.12695 16.3086L4.20215 18.5898C4.22403 19.2476 4.75241 19.776 5.41016 19.7979L7.69141 19.873C8.35753 19.8951 8.99289 20.1588 9.47949 20.6143L11.1455 22.1729C11.6261 22.6227 12.3739 22.6227 12.8545 22.1729L14.5205 20.6143C15.0071 20.1588 15.6425 19.8951 16.3086 19.873L18.5898 19.7979C19.2476 19.776 19.776 19.2476 19.7979 18.5898L19.873 16.3086C19.8951 15.6425 20.1588 15.0071 20.6143 14.5205L22.1729 12.8545C22.6227 12.3739 22.6227 11.6261 22.1729 11.1455L20.6143 9.47949C20.1588 8.99289 19.8951 8.35753 19.873 7.69141L19.7979 5.41016C19.776 4.75241 19.2476 4.22403 18.5898 4.20215L16.3086 4.12695C15.6425 4.1049 15.0071 3.84118 14.5205 3.38574L12.8545 1.82715Z" stroke="#FEFEFE" stroke-width="1.5"/>
<path d="M9 9.5C9.05695 9.5 9.16965 9.53474 9.29102 9.7168C9.41004 9.89536 9.5 10.1708 9.5 10.5C9.5 10.8292 9.41004 11.1046 9.29102 11.2832C9.16965 11.4653 9.05695 11.5 9 11.5C8.94305 11.5 8.83035 11.4653 8.70898 11.2832C8.58996 11.1046 8.5 10.8292 8.5 10.5C8.5 10.1708 8.58996 9.89536 8.70898 9.7168C8.83035 9.53474 8.94305 9.5 9 9.5Z" stroke="#FEFEFE"/>
<path d="M15 9.5C15.057 9.5 15.1696 9.53474 15.291 9.7168C15.41 9.89536 15.5 10.1708 15.5 10.5C15.5 10.8292 15.41 11.1046 15.291 11.2832C15.1696 11.4653 15.057 11.5 15 11.5C14.943 11.5 14.8304 11.4653 14.709 11.2832C14.59 11.1046 14.5 10.8292 14.5 10.5C14.5 10.1708 14.59 9.89536 14.709 9.7168C14.8304 9.53474 14.943 9.5 15 9.5Z" stroke="#FEFEFE"/>
</g>
<defs>
<clipPath id="clip0_1116_4729">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>
)

export const charlibraryIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 6.11745V20.9906M13 6.11745L14.1001 5.70461C16.6036 4.76513 19.3964 4.76513 21.8999 5.70461C22.5643 5.95395 23 6.55769 23 7.22907V19.0797C23 20.0016 22.0075 20.632 21.0951 20.2896C19.1082 19.544 16.8918 19.544 14.9049 20.2896L13.0137 20.9993C13.0071 21.0018 13 20.9972 13 20.9906M13 6.11745L11.8999 5.70461C9.39638 4.76513 6.60362 4.76513 4.10014 5.70461C3.43569 5.95395 3 6.55769 3 7.22907L3 19.0797C3 20.0016 3.99247 20.632 4.90485 20.2896C6.89175 19.544 9.10825 19.544 11.0951 20.2896L12.9863 20.9993C12.9929 21.0018 13 20.9972 13 20.9906" stroke="#FEFEFE" stroke-width="1.5"/>
</svg>

)

export const charcharacterIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM15.6621 14.6475C15.4674 14.2819 15.013 14.1433 14.6475 14.3379C13.5452 14.9251 12.759 15.1754 12.0166 15.1787C11.2756 15.1819 10.4779 14.9397 9.35352 14.3389C8.98825 14.1437 8.53414 14.2813 8.33887 14.6465C8.14367 15.0118 8.28128 15.4659 8.64648 15.6611C9.86891 16.3144 10.9247 16.6835 12.0234 16.6787C13.121 16.6739 14.1617 16.2965 15.3525 15.6621C15.7181 15.4674 15.8567 15.013 15.6621 14.6475ZM9 10C8.44772 10 8 10.4477 8 11C8 11.5523 8.44772 12 9 12C9.55228 12 10 11.5523 10 11C10 10.4477 9.55228 10 9 10ZM15 10C14.4477 10 14 10.4477 14 11C14 11.5523 14.4477 12 15 12C15.5523 12 16 11.5523 16 11C16 10.4477 15.5523 10 15 10Z" fill="#FEFEFE"/>
</svg>

)

export const charuserIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="4" cy="4" r="4" transform="matrix(-1 0 0 1 17 4)" stroke="#FEFEFE" stroke-width="1.5"/>
<path d="M6 17.9347C6 17.0743 6.54085 16.3068 7.35109 16.0175C11.004 14.7128 14.996 14.7128 18.6489 16.0175C19.4591 16.3068 20 17.0743 20 17.9347V19.2502C20 20.4376 18.9483 21.3498 17.7728 21.1818L16.8184 21.0455C14.2856 20.6837 11.7144 20.6837 9.18162 21.0455L8.22721 21.1818C7.0517 21.3498 6 20.4376 6 19.2502V17.9347Z" stroke="#FEFEFE" stroke-width="1.5"/>
</svg>


)



// ─── Directional ──────────────────────────────────────────────────────────

export const ChevronLeftIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ChevronRightIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ArrowUpIcon = ({ size = 20, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...p}>
    <path d="M10 15V5M10 5L6 9M10 5L14 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── Actions ──────────────────────────────────────────────────────────────

export const SearchIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...p}>
    <path
      d="M10.5 2.333a8.167 8.167 0 1 0 5.337 14.329l.527.497v1.508l7 7 2.333-2.334-7-7h-1.508l-.497-.527A8.167 8.167 0 0 0 10.5 2.333Zm0 2.333a5.833 5.833 0 1 1 0 11.667 5.833 5.833 0 0 1 0-11.667Z"
      fill={color}
    />
  </svg>
)

export const CheckIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M4 12L9 17L20 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const TrashIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
      stroke={color} strokeWidth="1.5" strokeLinecap="round"
    />
    <path
      d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
      stroke={color} strokeWidth="1.5" strokeLinecap="round"
    />
    <path d="M9.5 16.5L9.5 10.5M14.5 16.5L14.5 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const PencilIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M13.5 4.5L19.5 10.5L8 22H2v-6L13.5 4.5ZM10 7l7 7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ─── Memo Toolbar (Figma node 254-3276) ───────────────────────────────────

export const StarIcon = ({ size = 24, color = 'currentColor', filled = false, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"
      fill={filled ? '#F9C93B' : 'none'}
      stroke="#141B34"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const HandwritingIcon = ({ size = 26, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" {...p}>
    <path
      d="M7 23V14.6944C7 13.1287 7 12.3459 7.21454 11.6077C7.42908 10.8695 7.84589 10.2181 8.6795 8.91542L11.3359 4.76419C12.0885 3.58806 12.4648 3 13 3C13.5352 3 13.9115 3.58806 14.6641 4.76419L17.3205 8.91542C18.1541 10.2181 18.5709 10.8695 18.7855 11.6077C19 12.3459 19 13.1287 19 14.6944V23"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M8 12C8.63152 12.3231 9.4887 12.9732 10.2801 12.9991C11.2988 13.0324 11.9868 12.1372 13 12.1372C14.0132 12.1372 14.7012 13.0324 15.7199 12.9991C16.5113 12.9732 17.3685 12.3231 18 12"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
    <path d="M13 13L13 23" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 6H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const HighlighterIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M9.50122 9.64828L8.60933 10.5377C8.07366 11.0734 7.89158 11.8863 7.79924 12.6382C7.71531 13.3216 7.42742 14.2383 6.63537 15.252C6.29534 15.6872 6.28717 16.3166 6.6777 16.7071L8.79289 18.8223C9.18342 19.2128 9.81278 19.2047 10.248 18.8646C11.2617 18.0726 12.1784 17.7847 12.8618 17.7008C13.6137 17.6084 14.4266 17.4263 14.9623 16.8907L15.8517 15.9988M6.6777 16.7071L2.5 21H6.5L8.79289 18.8223M13.7353 4L9.50122 8.23407C9.1107 8.62459 9.1107 9.25776 9.50122 9.64828L15.8517 15.9988M15.8517 15.9988C16.2422 16.3893 16.8754 16.3893 17.2659 15.9988L21.5 11.7647"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
)

export const LibraryAddIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M12 5.5V19M12 5.5l-1-.37C8.8 4.32 6.4 4.32 4.2 5.13c-.6.22-1 .76-1 1.34v10.13c0 .77.8 1.28 1.5.99 1.8-.66 3.8-.66 5.6 0L12 18.22M12 5.5l1-.37c2.2-.81 4.6-.81 6.8 0 .6.22 1 .76 1 1.34v10.13c0 .77-.8 1.28-1.5.99-1.8-.66-3.8-.66-5.6 0L12 18.22"
      stroke={color} strokeWidth="1.5"
    />
    <path d="M19 21v-4M17 19h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// ─── Misc ─────────────────────────────────────────────────────────────────

export const ShareIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="18" cy="5" r="3" stroke={color} strokeWidth="1.5" />
    <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="1.5" />
    <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="1.5" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke={color} strokeWidth="1.5" />
  </svg>
)
