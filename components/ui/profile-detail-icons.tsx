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
