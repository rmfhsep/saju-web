import type { FilterCategory } from "./types"

export const FILTER_CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: "height", label: "키" },
  { key: "smoking", label: "흡연 여부" },
  { key: "drinking", label: "음주 빈도" },
  { key: "politics", label: "정치 성향" },
  { key: "religion", label: "종교" },
]

// 선호 상대의 키 범위 — 내 성별 기준 이성의 범위 (여성: 140~170+, 남성: 168~200+)
export const HEIGHT_RANGES = {
  MALE: { min: 140, max: 170 },
  FEMALE: { min: 168, max: 200 },
} as const

export function defaultHeightRange(min: number, max: number) {
  const mid = Math.round((min + max) / 2)
  return { min: mid - 10, max: mid }
}
