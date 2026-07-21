/**
 * 온보딩 미니게임 별 지급 정책.
 * - 참여 보상: 1회 이상 플레이(즉시 충돌 포함) 시 별 1개 확정
 * - 최고 기록(생존초) 구간별 추가 지급, 3회 중 최고 기록 1개만 반영(합산 아님)
 * - 지급된 별은 체험용(trialStars)으로 별도 관리, 지급일로부터 7일 후 만료
 */
export const TRIAL_STAR_EXPIRY_DAYS = 7

export function starsForBestSurvival(bestSeconds: number): number {
  const base = 1 // 참여 보상
  let bonus = 0
  if (bestSeconds >= 25) bonus = 3
  else if (bestSeconds >= 15) bonus = 2
  else if (bestSeconds >= 5) bonus = 1
  return base + bonus
}

export function trialStarsExpireAt(from = new Date()): Date {
  return new Date(from.getTime() + TRIAL_STAR_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
}

/** trialStarsExpireAt 이 지났으면 만료된 것으로 간주해 0을 반환한다. */
export function effectiveTrialStars(trialStars: number, expireAt: Date | null): number {
  if (!expireAt) return trialStars > 0 ? trialStars : 0
  return expireAt.getTime() > Date.now() ? trialStars : 0
}
