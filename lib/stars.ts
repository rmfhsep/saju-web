import type { Prisma, PrismaClient } from "@prisma/client"

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

export class InsufficientStarsError extends Error {
  constructor(public stars: number) {
    super("insufficient stars")
  }
}

/**
 * 호감/메시지 등에서 별을 소모할 때 쓰는 공용 헬퍼.
 * 표시되는 잔액(auth/me 등)은 stars + 만료 전 trialStars 합산이므로, 실제 차감도
 * 그 합산 잔액 기준으로 판단하고 trialStars부터 먼저 소모한다(어차피 만료되는 값이라).
 * 트랜잭션 클라이언트(tx)를 받아 호출부의 $transaction 안에서 원자적으로 실행되게 한다.
 */
export async function spendEffectiveStars(
  tx: Prisma.TransactionClient | PrismaClient,
  userId: number,
  cost: number,
): Promise<{ stars: number }> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { stars: true, trialStars: true, trialStarsExpireAt: true },
  })
  const trial = effectiveTrialStars(user?.trialStars ?? 0, user?.trialStarsExpireAt ?? null)
  const total = (user?.stars ?? 0) + trial
  if (!user || total < cost) {
    throw new InsufficientStarsError(total)
  }

  const fromTrial = Math.min(trial, cost)
  const fromReal = cost - fromTrial

  const updated = await tx.user.update({
    where: { id: userId },
    data: {
      trialStars: { decrement: fromTrial },
      stars: { decrement: fromReal },
    },
    select: { stars: true, trialStars: true, trialStarsExpireAt: true },
  })

  return { stars: updated.stars + effectiveTrialStars(updated.trialStars, updated.trialStarsExpireAt) }
}
