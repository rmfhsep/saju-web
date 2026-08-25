/**
 * "02_추천_프로필 상세" 화면 전용 아이콘 세트 (Figma Icon/Normal/Profile 계열 + 플로팅 버튼 아이콘).
 */

interface IconProps {
  size?: number
  className?: string
}

const CHIP_ICON_STATES = [
  "birthday",
  "tall",
  "job",
  "location",
  "tabacco",
  "alchohol",
  "purpose",
  "politics",
  "religion",
] as const

export type ChipIconState = (typeof CHIP_ICON_STATES)[number]

/** Figma Icon/Normal/Profile 세트 — /public/icons/normal/profile/{state}.svg */
export function ProfileChipIcon({ state, size = 20, className }: { state: ChipIconState } & IconProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/icons/normal/profile/${state}.svg`} width={size} height={size} alt="" className={className} />
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

/**
 * 호감 탭 "받은 호감" 카드 모서리의 맞호감 토글 하트(Figma btn_heart_on/off) — 반투명 원 배경 +
 * 하트 아이콘(FlirtingHeartIcon과 같은 Icon/normal/flirting 계열, 28px 배지용 20px 변형).
 * on/off는 fill 유무 차이뿐이라 별도 이미지 두 장 대신 이 컴포넌트 하나로 토글한다.
 */
export function LikeToggleHeartIcon({ on, size = 28, className }: { on: boolean } & IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      <circle cx="14" cy="14" r="14" fill="white" opacity="0.35" />
      <path
        d="M17.0496 8.5C16.0488 8.5 15.1384 9.18711 14.4693 9.99915C14.1891 10.3391 13.6291 10.3391 13.3489 9.99915C12.6798 9.18711 11.7694 8.5 10.7686 8.5C8.69587 8.5 7 10.3 7 12.5C7 15.978 12.3117 19.5073 13.6204 20.3241C13.7983 20.4351 14.0202 20.4354 14.1984 20.325C15.5082 19.5133 20.8182 16.0067 20.8182 12.5C20.8182 10.3 19.1223 8.5 17.0496 8.5Z"
        fill={on ? "white" : "none"}
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
