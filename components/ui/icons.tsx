/**
 * 마주 디자인 시스템 아이콘 세트
 * - Icon-Normal (114-820): 상태/기능 아이콘
 * - Icon-Action (114-822): chevron/검색/eye/close/edit
 * - App icons (151-426): 홈/하트/채팅/아바타
 *
 * 컬러 토큰: Blue600 #1A75FF, Red(Destructive) #FF334B, Red550 #FF4242,
 *           Gray850 #1F1F1F, Gray400 #B7B7B7, Gray300 #DFDFDF, White #FFFFFF, Star Gold #FFB020
 */

interface IconProps {
  size?: number
  color?: string
  className?: string
}

const S = (size?: number) => size ?? 24

/* ── Chevron (Icon-Action) ─────────────────────────────── */
export function ChevronRight({ size, color = "#1f1f1f", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 5l7 7-7 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function ChevronLeft({ size, color = "#1f1f1f", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 5l-7 7 7 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function ChevronDown({ size, color = "#1f1f1f", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 9l7 7 7-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Search (Icon-Action) ──────────────────────────────── */
export function SearchIcon({ size, color = "#949494", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="1.6" />
      <path d="M15.5 15.5L20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ── Eye / EyeOff (Icon-Action) ────────────────────────── */
export function EyeIcon({ size, color = "#b7b7b7", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}
export function EyeOffIcon({ size, color = "#b7b7b7", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 3l18 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.6 10.6a2 2 0 002.8 2.8M6.7 6.8C4.3 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.9 0 3.6-.65 5-1.6M11.3 5.55C11.5 5.52 11.7 5.5 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 01-2.4 3.05" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Edit / Pencil (Icon-Action) ───────────────────────── */
export function PencilIcon({ size, color = "#777777", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M16.5 3.5l4 4L8 20l-4.5 1 1-4.5L16.5 3.5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 5.5l4 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ── Close / X (Icon-Action) ───────────────────────────── */
export function CloseIcon({ size, color = "#1f1f1f", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 5l14 14M19 5L5 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
/** 반투명 원형 닫기(삭제) — 태그 삭제용. Gray850 61% 배경 + 흰 X (Figma 161:3676) */
export function CloseCircleIcon({ size, color = "#1f1f1f", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 14 14" fill="none" className={className}>
      <circle cx="7" cy="7" r="7" fill={color} opacity="0.61" />
      <path d="M9 5L5 9M5 5L9 9" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Check (Icon-Normal) ───────────────────────────────── */
export function CheckIcon({ size, color = "#1a75ff", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12.5l4.5 4.5L19 6.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
/** 파랑 원형 체크 — 완료/계정확인. Blue600 배경 + 흰 체크 */
export function CheckCircleIcon({ size, color = "#1a75ff", className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
  <circle cx="28" cy="28" r="28" fill="#69A5FF"/>
  <path d="M19 28L25 34L37 22" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  )
}

/* ── Warning (Icon-Normal) — 주의 포인트. 빨강 원형 + 흰 느낌표 ── */
export function WarningIcon({ size, color = "#ff334b", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="11" fill={color} />
      <path d="M12 6.5V13" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1.15" fill="white" />
    </svg>
  )
}

/* ── Plus (Icon-Normal) — 사진 추가 ────────────────────── */
export function PlusIcon({ size, color = "#1f1f1f", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ── ShieldCheck (Icon-Normal) — 인증/보안 로딩 아이콘 ──── */
export function ShieldCheckIcon({ size, color = "#b6d0ff", className }: IconProps) {
  return (
    <svg width={S(size)} height={S(size)} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2.5L4 6v6.5c0 5.2 3.5 9.9 8 11.2 4.5-1.3 8-6 8-11.2V6l-8-3.5z" fill={color} />
      <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Star는 기존 components/ui/star-icon.tsx (default export) 사용 */
