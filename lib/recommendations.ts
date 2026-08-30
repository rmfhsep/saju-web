import { prisma } from "@/lib/db"
import { spendEffectiveStars, InsufficientStarsError } from "@/lib/stars"
import { getBlockedUserIds } from "@/lib/moderation"
import { buildPool } from "@/lib/pool/buildPool"
import { toRecoUser, POOL_USER_SELECT } from "@/lib/pool/types"

export const MORE_INTRO_LIMIT = 3
export const MORE_INTRO_COST = 10

export class NoMoreCandidatesError extends Error {
  constructor() {
    super("no more candidates")
  }
}

export { InsufficientStarsError }

export type RecoUser = ReturnType<typeof toRecoUser>

// § 6-0 — 매일 20:00 KST(= 11:00 UTC, vercel.json 참고) 고정 배치 기준 시각.
// 지금이 그 시각 이전이면 "오늘 배치"는 아직 어제 20:00 것이다.
function lastBatchBoundaryUTC(now: Date): Date {
  const boundary = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 11, 0, 0))
  if (now.getTime() < boundary.getTime()) boundary.setUTCDate(boundary.getUTCDate() - 1)
  return boundary
}

// 차단은 언제든 발생할 수 있어(과거에 추천됐던 상대를 나중에 차단), 누적 추천 이력을 읽을 때마다
// 매번 걸러낸다 — Recommendation 테이블 자체에서 지우지는 않고 조회 시점에만 숨긴다.
async function getRecommendedList(userId: number): Promise<RecoUser[]> {
  const [recos, blockedIds] = await Promise.all([
    prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { recommendedId: true },
    }),
    getBlockedUserIds(userId),
  ])
  if (recos.length === 0) return []
  const blocked = new Set(blockedIds)

  const users = await prisma.user.findMany({
    where: { id: { in: recos.map(r => r.recommendedId) } },
    select: POOL_USER_SELECT,
  })
  const userMap = new Map(users.map(u => [u.id, u]))
  return recos
    .map(r => userMap.get(r.recommendedId))
    .filter((u): u is (typeof users)[number] => !!u && !blocked.has(u.id))
    .map(toRecoUser)
}

/**
 * 홈 화면 "오늘의 추천" — 이제 순수 읽기 전용이다. 실제 추천 선별(하드필터→유저필터→소프트스코어링→
 * 슬롯믹싱)은 app/api/cron/daily-recommendations가 매일 20:00 KST에 미리 채워두고, 여기서는
 * 누적 목록을 읽고 "가장 최근 배치에 새로 추가된 게 있는가"만 판단한다.
 */
export async function getDailyRecommendations(userId: number): Promise<{ users: RecoUser[]; noNewToday: boolean }> {
  const [users, foundInLastBatch] = await Promise.all([
    getRecommendedList(userId),
    prisma.recommendation.count({ where: { userId, createdAt: { gte: lastBatchBoundaryUTC(new Date()) } } }),
  ])
  return { users, noNewToday: foundInLastBatch === 0 }
}

/**
 * "더 소개 받기" — 별 소모하고 매칭 풀(하드필터+유저필터+소프트스코어링, 등급 슬롯믹싱은 미적용)
 * 상위 N명을 더 추가한다. 추천 가능한 상대가 0명이면 별을 소모하지 않고 NoMoreCandidatesError.
 */
export async function addMoreIntroductions(userId: number): Promise<{ users: RecoUser[]; stars: number }> {
  const scored = await buildPool(userId)
  const candidates = scored.slice(0, MORE_INTRO_LIMIT).map(c => c.user)
  if (candidates.length === 0) throw new NoMoreCandidatesError()

  const stars = await prisma.$transaction(async tx => {
    const spent = await spendEffectiveStars(tx, userId, MORE_INTRO_COST, "인연 추천 더 받기")
    await tx.recommendation.createMany({
      data: candidates.map(c => ({ userId, recommendedId: c.id })),
      skipDuplicates: true,
    })
    return spent.stars
  })

  return { users: await getRecommendedList(userId), stars }
}
