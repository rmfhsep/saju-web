import type { FilterCategory } from "./types"

export const FILTER_CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: "height", label: "키" },
  { key: "smoking", label: "흡연 여부" },
  { key: "drinking", label: "음주 빈도" },
  { key: "politics", label: "정치 성향" },
  { key: "religion", label: "종교" },
]

export const HEIGHT_MIN = 168
export const HEIGHT_MAX = 200
export const DEFAULT_HEIGHT_MIN = 174
export const DEFAULT_HEIGHT_MAX = 184
