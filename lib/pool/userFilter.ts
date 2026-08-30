/**
 * matching_pool_spec § 3 — User Filter. 유저가 켠 필터 항목만 하드필터처럼 AND로 적용한다.
 *
 * 주의: 이 프로젝트의 흡연 필터 UI(app/my/filter)는 스펙의 2지선다(비흡연/흡연)가 아니라
 * SMOKING_OPTIONS 4개 라벨을 그대로 라디오로 보여준다(modules/filter/constants.ts). 저장된
 * preferredSmoking 값이 "비흡연"이면 스펙의 "비흡연 선택" 규칙을, 그 외 3개 값 중 무엇이든
 * 스펙의 "흡연 선택" 규칙(비흡연이 아니면 전부 통과)을 적용해 매핑한다 — 필터 UI를 다중선택으로
 * 바꾸지 않기로 한 이번 스코프에서는 이 근사가 최선이라 판단.
 */
import { politicsMatched, DRINKING_ORDER } from "@/lib/matching"
import type { PoolUser } from "./types"

export type FilterType = "height" | "smoking" | "drinking" | "politics" | "religion"
export const ALL_FILTERS: FilterType[] = ["height", "smoking", "drinking", "politics", "religion"]

export function parsePreferenceFilters(json: string | null): FilterType[] {
  if (!json) return []
  try {
    const arr = JSON.parse(json)
    return Array.isArray(arr) ? arr.filter((f): f is FilterType => ALL_FILTERS.includes(f)) : []
  } catch {
    return []
  }
}

function heightMatched(user: PoolUser, candidate: PoolUser): boolean {
  if (candidate.height == null) return false
  if (user.preferredHeightMin != null && candidate.height < user.preferredHeightMin) return false
  if (user.preferredHeightMax != null && candidate.height > user.preferredHeightMax) return false
  return true
}

function smokingMatched(user: PoolUser, candidate: PoolUser): boolean {
  if (!user.preferredSmoking || !candidate.smoking) return true // 미설정 시 통과(§6 예외처리 취지)
  if (user.preferredSmoking === "비흡연") return candidate.smoking === "비흡연"
  return candidate.smoking !== "비흡연"
}

function drinkingMatched(user: PoolUser, candidate: PoolUser): boolean {
  if (!user.preferredDrinking || !candidate.drinking) return true
  const limit = DRINKING_ORDER[user.preferredDrinking]
  const value = DRINKING_ORDER[candidate.drinking]
  if (limit == null || value == null) return true
  return value <= limit
}

function politicsFilterMatched(user: PoolUser, candidate: PoolUser): boolean {
  const userView = user.preferredPolitics ?? user.politics
  const candidateView = candidate.politics
  if (!userView || !candidateView) return true
  return politicsMatched(userView, candidateView)
}

function religionFilterMatched(user: PoolUser, candidate: PoolUser): boolean {
  const userFilters = parsePreferenceFilters(user.preferenceFilters)
  const candidateFilters = parsePreferenceFilters(candidate.preferenceFilters)
  const userSelected = userFilters.includes("religion")
  const candidateSelected = candidateFilters.includes("religion")
  if (!userSelected && !candidateSelected) return true
  if (!user.religion || !candidate.religion) return true
  return user.religion === candidate.religion
}

const MATCHERS: Record<FilterType, (user: PoolUser, candidate: PoolUser) => boolean> = {
  height: heightMatched,
  smoking: smokingMatched,
  drinking: drinkingMatched,
  politics: politicsFilterMatched,
  religion: religionFilterMatched,
}

export function isFilterMatched(type: FilterType, user: PoolUser, candidate: PoolUser): boolean {
  return MATCHERS[type](user, candidate)
}

/** § 3-6 applyUserFilters — user가 켠 필터 전부를 AND로 적용. */
export function applyUserFilters(user: PoolUser, candidate: PoolUser): boolean {
  const filters = parsePreferenceFilters(user.preferenceFilters)
  return filters.every(f => isFilterMatched(f, user, candidate))
}
