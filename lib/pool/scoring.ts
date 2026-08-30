/**
 * matching_pool_spec § 4 — Soft Scoring. Hard/User Filter를 통과한 후보의 점수(0~100)를 산출한다.
 * § 4-3 행동 신호(behaviorScore)는 스펙도 "초기 운영 시 데이터 부족으로 제외"라 이번엔 구현 안 함:
 * finalScore = sajuScore*0.6 + activityScore*0.4 (초기 운영 가중치만 적용).
 */
import { calcSajuScore } from "@/lib/matching"
import { parseAiTags } from "./hardFilter"
import { ALL_FILTERS, isFilterMatched, parsePreferenceFilters } from "./userFilter"
import type { PoolUser } from "./types"

const BONUS_PER_ITEM = 2 // § 4-3, 튜닝 가능
const INTRO_PENALTY = 5 // § 4-4, 튜닝 가능

export interface ScoredCandidate {
  user: PoolUser
  score: number
}

/** § 4-1 — 최근 7일 내 접속 여부/빈도. lastLoginAt이 없으면(로그인 갱신 전) 0점. */
export function activityScore(lastLoginAt: Date | null): number {
  if (!lastLoginAt) return 0
  const days = (Date.now() - lastLoginAt.getTime()) / (24 * 60 * 60 * 1000)
  if (days <= 1) return 100
  if (days <= 3) return 80
  if (days <= 7) return 50
  return 0
}

function hasIntroduction(bio: string | null): boolean {
  if (!bio) return false
  try {
    const parsed = JSON.parse(bio)
    return !!parsed && typeof parsed === "object" && Object.keys(parsed).length > 0
  } catch {
    return false
  }
}

/** § 4-3 — user가 켜지 않은 필터 항목 중 그래도 일치하는 게 있으면 항목당 소폭 가산점. */
function bonusScore(user: PoolUser, candidate: PoolUser): number {
  const selected = new Set(parsePreferenceFilters(user.preferenceFilters))
  const nonSelected = ALL_FILTERS.filter(f => !selected.has(f))
  let bonus = 0
  for (const f of nonSelected) {
    if (isFilterMatched(f, user, candidate)) bonus += BONUS_PER_ITEM
  }
  return bonus
}

/** 후보 하나의 finalScore를 계산한다. 사주 리포트가 없는 후보는 호출 전(§2-5 하드필터)에 이미 제외돼 있어야 한다. */
export function scoreCandidate(user: PoolUser, candidate: PoolUser): number {
  const userTags = parseAiTags(user.sajuResult)
  const candidateTags = parseAiTags(candidate.sajuResult)
  const sajuScore = userTags && candidateTags ? calcSajuScore(userTags, candidateTags) : 0

  let finalScore = sajuScore * 0.6 + activityScore(candidate.lastLoginAt) * 0.4
  finalScore = Math.min(100, finalScore + bonusScore(user, candidate))
  if (!hasIntroduction(candidate.bio)) finalScore = Math.max(0, finalScore - INTRO_PENALTY)
  return finalScore
}

export function scoreAndSort(user: PoolUser, candidates: PoolUser[]): ScoredCandidate[] {
  return candidates
    .map(candidate => ({ user: candidate, score: scoreCandidate(user, candidate) }))
    .sort((a, b) => b.score - a.score)
}
