/**
 * "02_추천_프로필 상세" 화면 전용 아이콘 세트 (Figma Icon/Normal/Profile 계열 + 플로팅 버튼 아이콘).
 */

interface IconProps {
  size?: number
  className?: string
}

const S = (size?: number) => size ?? 20

export function CalendarIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="5.5" width="14" height="11.5" rx="2" stroke="#1f1f1f" strokeWidth="1.4" />
      <path d="M3 8.7H17" stroke="#1f1f1f" strokeWidth="1.4" />
      <path d="M6.8 3.2V6.2M13.2 3.2V6.2" stroke="#1f1f1f" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function RulerIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 17.2 17.2" fill="none" className={className}>
      <path d="M6.89632 13.5887L5.36129 12.0536M9.19887 11.2861L7.66384 9.75108M11.5014 8.98356L9.96639 7.44853M13.804 6.68101L12.2689 5.14598M5.53684 16.2821L16.2821 5.53684C16.706 5.11295 16.706 4.42569 16.2821 4.0018L13.1982 0.917916C12.7743 0.494028 12.087 0.494028 11.6632 0.917916L0.917916 11.6632C0.494028 12.087 0.494028 12.7743 0.917916 13.1982L4.0018 16.2821C4.42569 16.706 5.11295 16.706 5.53684 16.2821Z" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BriefcaseIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M7.5 6V4.8C7.5 4.13726 8.03726 3.6 8.7 3.6H11.3C11.9627 3.6 12.5 4.13726 12.5 4.8V6" stroke="#1f1f1f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="6" width="14" height="9.5" rx="1.8" stroke="#1f1f1f" strokeWidth="1.3" />
      <path d="M3 10.2C5.1 10.9 7.5 11.3 10 11.3C12.5 11.3 14.9 10.9 17 10.2" stroke="#1f1f1f" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function PinIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 16.2 16.2" fill="none" className={className}>
      <path d="M8.1 9.975C8.1 9.975 12.45 6.585 12.45 4.26848C12.45 1.8987 10.4899 0 8.1 0C5.71006 0 3.75 1.8987 3.75 4.26848C3.75 6.585 8.1 9.975 8.1 9.975Z" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.6 12.475C15.6 14.4677 12.1959 16.2 8.1 16.2C4.00407 16.2 0.6 14.4677 0.6 12.475C0.6 11.6761 1.08421 11.0149 1.73156 10.5159C2.38492 10.0123 3.28313 9.60741 4.31734 9.31372" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12.4827 9.31372C13.5169 9.60741 14.4151 10.0123 15.0684 10.5159C15.6058 10.9284 16.0396 11.4276 16.1738 12" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8.1" cy="4.35" r="1.55" stroke="#1f1f1f" strokeWidth="1.2" />
    </svg>
  )
}

export function CigaretteIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M8 8.2C7.3 7.6 6.9 6.7 6.9 5.7V4.5" stroke="#1f1f1f" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 8.2C10.3 7.6 9.9 6.7 9.9 5.7V4.5" stroke="#1f1f1f" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="2.5" y="11.5" width="15" height="3.4" rx="1" stroke="#1f1f1f" strokeWidth="1.3" />
      <path d="M12.7 11.5V14.9" stroke="#1f1f1f" strokeWidth="1.3" />
    </svg>
  )
}

export function MartiniIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 14 15.6" fill="none" className={className}>
      <path d="M1 0.599609H13C13.2404 0.599609 13.366 0.783068 13.3496 0.933594C12.9452 4.64517 10.1991 7.40039 7 7.40039C3.80091 7.40039 1.05481 4.64518 0.650391 0.933594C0.634039 0.783068 0.759614 0.599609 1 0.599609Z" stroke="#1f1f1f" strokeWidth="1.2" />
      <path d="M1.5 4H12.5" stroke="#1f1f1f" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7 15L7 8" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.00488 15H10.0049" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PurposeIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 15.9738 15.9794" fill="none" className={className}>
      <path d="M15.4513 8.32058C15.4513 7.98921 15.1827 7.72058 14.8513 7.72058C14.52 7.72058 14.2513 7.98921 14.2513 8.32058H14.8513H15.4513ZM7.72567 1.86176C8.05704 1.86176 8.32567 1.59313 8.32567 1.26176C8.32567 0.930386 8.05704 0.661757 7.72567 0.661757V1.26176V1.86176ZM11.8885 8.32058C11.8885 7.98921 11.6199 7.72058 11.2885 7.72058C10.9571 7.72058 10.6885 7.98921 10.6885 8.32058H11.2885H11.8885ZM7.72567 5.39117C8.05704 5.39117 8.32567 5.12254 8.32567 4.79117C8.32567 4.4598 8.05704 4.19117 7.72567 4.19117V4.79117V5.39117ZM11.2971 5.48498C11.5325 5.25177 11.5343 4.87187 11.3011 4.63646C11.0679 4.40104 10.688 4.39925 10.4525 4.63246L10.8748 5.05872L11.2971 5.48498ZM7.30341 7.75205C7.06799 7.98526 7.0662 8.36515 7.29941 8.60057C7.53262 8.83598 7.91251 8.83777 8.14793 8.60457L7.72567 8.17831L7.30341 7.75205ZM12.7658 5.6827L12.5777 6.25245C12.7919 6.3232 13.0277 6.26776 13.188 6.10896L12.7658 5.6827ZM10.2465 3.18703L9.82422 2.76078C9.6616 2.92186 9.60481 3.16144 9.67781 3.37839L10.2465 3.18703ZM10.8763 5.05879L10.3076 5.25014C10.3679 5.42913 10.5088 5.56931 10.6882 5.62853L10.8763 5.05879ZM13.3956 2.56312L12.8018 2.64876C12.8398 2.91269 13.0475 3.11983 13.3115 3.1572L13.3956 2.56312ZM12.7987 0.658799L13.2209 1.08506L12.7987 0.658799ZM13.1374 0.772338L12.5435 0.857978L13.1374 0.772338ZM15.3137 3.15872L14.8914 2.73246L15.3137 3.15872ZM15.2009 2.8186L15.1169 3.41268L15.2009 2.8186ZM14.8513 8.32058H14.2513C14.2513 11.8824 11.335 14.7794 7.72567 14.7794V15.3794V15.9794C11.9871 15.9794 15.4513 12.5558 15.4513 8.32058H14.8513ZM7.72567 15.3794V14.7794C4.1163 14.7794 1.2 11.8824 1.2 8.32058H0.6H0C0 12.5558 3.46424 15.9794 7.72567 15.9794V15.3794ZM0.6 8.32058H1.2C1.2 4.75879 4.1163 1.86176 7.72567 1.86176V1.26176V0.661757C3.46424 0.661757 0 4.08541 0 8.32058H0.6ZM11.2885 8.32058H10.6885C10.6885 9.93313 9.36734 11.25 7.72567 11.25V11.85V12.45C10.0194 12.45 11.8885 10.6065 11.8885 8.32058H11.2885ZM7.72567 11.85V11.25C6.084 11.25 4.76283 9.93313 4.76283 8.32058H4.16283H3.56283C3.56283 10.6065 5.43194 12.45 7.72567 12.45V11.85ZM4.16283 8.32058H4.76283C4.76283 6.70803 6.084 5.39117 7.72567 5.39117V4.79117V4.19117C5.43194 4.19117 3.56283 6.03465 3.56283 8.32058H4.16283ZM10.8748 5.05872L10.4525 4.63246L7.30341 7.75205L7.72567 8.17831L8.14793 8.60457L11.2971 5.48498L10.8748 5.05872ZM15.3137 3.15872L14.8914 2.73246L12.3435 5.25645L12.7658 5.6827L13.188 6.10896L15.7359 3.58497L15.3137 3.15872ZM10.2465 3.18703L10.6687 3.61329L13.2209 1.08506L12.7987 0.658799L12.3764 0.23254L9.82422 2.76078L10.2465 3.18703ZM12.7658 5.6827L12.9539 5.11296L11.0644 4.48905L10.8763 5.05879L10.6882 5.62853L12.5777 6.25245L12.7658 5.6827ZM10.8763 5.05879L11.445 4.86744L10.8151 2.99568L10.2465 3.18703L9.67781 3.37839L10.3076 5.25014L10.8763 5.05879ZM13.1374 0.772338L12.5435 0.857978L12.8018 2.64876L13.3956 2.56312L13.9895 2.47748L13.7312 0.686698L13.1374 0.772338ZM13.3956 2.56312L13.3115 3.1572L15.1169 3.41268L15.2009 2.8186L15.285 2.22452L13.4797 1.96904L13.3956 2.56312ZM12.7987 0.658799L13.2209 1.08506C12.9875 1.31625 12.5904 1.18312 12.5435 0.857978L13.1374 0.772338L13.7312 0.686698C13.6374 0.0364132 12.8432 -0.229845 12.3764 0.23254L12.7987 0.658799ZM15.3137 3.15872L15.7359 3.58497C16.2059 3.11946 15.94 2.31721 15.285 2.22452L15.2009 2.8186L15.1169 3.41268C14.7894 3.36634 14.6565 2.96521 14.8914 2.73246L15.3137 3.15872Z" fill="#1f1f1f" />
    </svg>
  )
}

export function PoliticsIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2" y="2" width="16" height="16" rx="2" stroke="#1f1f1f" strokeWidth="1.2" />
      <path d="M6 10.2L8.5 12.7L14 6.9" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ReligionIcon({ size, className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 13.2 16.2" fill="none" className={className}>
      <path d="M12.6 4.06154H9V0.6H4.2V4.06154H0.6V8.67692H4.2V15.6H9V8.67692H12.6V4.06154Z" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const CHIP_ICONS = {
  birthday: CalendarIcon,
  tall: RulerIcon,
  job: BriefcaseIcon,
  location: PinIcon,
  tabacco: CigaretteIcon,
  alchohol: MartiniIcon,
  purpose: PurposeIcon,
  politics: PoliticsIcon,
  religion: ReligionIcon,
} as const

export type ChipIconState = keyof typeof CHIP_ICONS

export function ProfileChipIcon({ state, size = 20, className }: { state: ChipIconState } & IconProps) {
  const Icon = CHIP_ICONS[state]
  return <Icon size={size} className={className} />
}

/** 헤더 우측 상단 "더보기" 점 3개 아이콘 */
export function MoreDotsIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size * (3 / 19)} viewBox="0 0 19 3" fill="none" className={className}>
      <circle cx="1.5" cy="1.5" r="1.5" fill="#1f1f1f" />
      <circle cx="9.5" cy="1.5" r="1.5" fill="#1f1f1f" />
      <circle cx="17.5" cy="1.5" r="1.5" fill="#1f1f1f" />
    </svg>
  )
}

/** 플로팅 버튼 내부 흰색 하트 아이콘 */
export function FlirtingHeartIcon({ size = 36, className }: IconProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icons/flirting.svg" width={size} height={size} alt="" className={className} />
}

/** 플로팅 버튼 내부 흰색 메시지 아이콘 */
export function FlirtingMessageIcon({ size = 36, className }: IconProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icons/flirting-1.svg" width={size} height={size} alt="" className={className} />
}

/** 프로필 사진 캐러셀 하단 인디케이터 점 */
export function CarouselIndicator({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-white"
          style={{ opacity: i === activeIndex ? 1 : 0.43 }}
        />
      ))}
    </div>
  )
}
