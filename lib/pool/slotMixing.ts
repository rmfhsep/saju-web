/**
 * matching_pool_spec § 6 / § 7-2 / § 7-4 — Slot Mixing. Soft Scoring으로 정렬된 풀에서
 * 등급별로 1명씩 뽑아 최종 후보를 구성한다. 해당 등급이 부족하면 잔여 풀 최상위로 보완(§7-2).
 */
import type { ScoredCandidate } from "./scoring"
import type { UserGrade } from "./grade"

function pickBySlots(scoredPool: ScoredCandidate[], slots: UserGrade[]): ScoredCandidate[] {
  const result: ScoredCandidate[] = []
  const remaining = [...scoredPool]

  for (const targetGrade of slots) {
    const idx = remaining.findIndex(c => c.user.grade === targetGrade)
    if (idx !== -1) {
      result.push(remaining.splice(idx, 1)[0])
    } else if (remaining.length > 0) {
      result.push(remaining.splice(0, 1)[0])
    }
  }

  return result
}

/** § 6 — 매일 20:00 배치: 골드 1 / 실버 1 / 뉴비 1. */
export function pickCandidates(scoredPool: ScoredCandidate[]): ScoredCandidate[] {
  return pickBySlots(scoredPool, ["gold", "silver", "newbie"])
}

/** § 7-4 — 탈퇴 직전 마지막 추천: 골드 1 / 실버 2. */
export function pickExitCandidates(scoredPool: ScoredCandidate[]): ScoredCandidate[] {
  return pickBySlots(scoredPool, ["gold", "silver", "silver"])
}
