import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { spendEffectiveStars, InsufficientStarsError } from "@/lib/stars"

export const DAILY_RECO_LIMIT = 2
export const MORE_INTRO_LIMIT = 3
export const MORE_INTRO_COST = 10
const RECO_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000

export class NoMoreCandidatesError extends Error {
  constructor() {
    super("no more candidates")
  }
}

export { InsufficientStarsError }

const RECO_USER_SELECT = {
  id: true,
  nickname: true,
  name: true,
  photos: true,
  birthDate: true,
  bioTags: true,
} satisfies Prisma.UserSelect

type RecoUser = Prisma.UserGetPayload<{ select: typeof RECO_USER_SELECT }>

function oppositeGender(gender: string | null): string | null {
  return gender === "MALE" ? "FEMALE" : gender === "FEMALE" ? "MALE" : null
}

async function findEligibleCandidates(
  tx: Prisma.TransactionClient,
  userId: number,
  opposite: string,
  excludeIds: number[],
  limit: number,
): Promise<RecoUser[]> {
  return tx.user.findMany({
    where: {
      gender: opposite,
      profileComplete: true,
      id: { notIn: [...excludeIds, userId] },
    },
    select: RECO_USER_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

async function getRecommendedList(userId: number): Promise<RecoUser[]> {
  const recos = await prisma.recommendation.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { recommendedId: true },
  })
  if (recos.length === 0) return []

  const users = await prisma.user.findMany({
    where: { id: { in: recos.map(r => r.recommendedId) } },
    select: RECO_USER_SELECT,
  })
  const userMap = new Map(users.map(u => [u.id, u]))
  return recos.map(r => userMap.get(r.recommendedId)).filter((u): u is RecoUser => !!u)
}

/**
 * 홈 화면 "오늘의 추천" — 누적 추천 목록을 반환하고, 마지막 확인으로부터 24시간이
 * 지났으면 새 후보를 찾아 배치로 추가한다(없으면 noNewToday만 표시).
 */
export async function getDailyRecommendations(userId: number): Promise<{ users: RecoUser[]; noNewToday: boolean }> {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { gender: true, lastRecoCheckAt: true } })
  const opposite = oppositeGender(me?.gender ?? null)
  if (!opposite) return { users: await getRecommendedList(userId), noNewToday: false }

  const needsCheck = !me?.lastRecoCheckAt || Date.now() - me.lastRecoCheckAt.getTime() >= RECO_CHECK_INTERVAL_MS
  let lastCheckAt = me?.lastRecoCheckAt ?? null

  if (needsCheck) {
    const checkedAt = new Date()
    await prisma.$transaction(async tx => {
      const existing = await tx.recommendation.findMany({ where: { userId }, select: { recommendedId: true } })
      const candidates = await findEligibleCandidates(tx, userId, opposite, existing.map(r => r.recommendedId), DAILY_RECO_LIMIT)

      if (candidates.length > 0) {
        await tx.recommendation.createMany({
          data: candidates.map(c => ({ userId, recommendedId: c.id, createdAt: checkedAt })),
          skipDuplicates: true,
        })
      }
      await tx.user.update({ where: { id: userId }, data: { lastRecoCheckAt: checkedAt } })
    })
    lastCheckAt = checkedAt
  }

  // "오늘은 추천 인연이 없어요" 카드는 "후보 풀이 바닥났는지"가 아니라 "가장 최근 체크 주기에서
  // 실제로 새 추천이 추가됐는지"로 판단한다 — 이번 주기에 추천을 받았으면(그게 마지막 남은
  // 후보였더라도) 표시하지 않고, 다음 24시간 주기에 추가된 게 하나도 없을 때만 표시한다.
  // Recommendation.createdAt을 lastRecoCheckAt과 동일한 시각으로 심어두었기 때문에
  // needsCheck=false로 같은 날 재방문한 요청에서도 그 주기의 결과가 그대로 유지된다.
  const users = await getRecommendedList(userId)
  const foundInLastCheck = lastCheckAt
    ? await prisma.recommendation.count({ where: { userId, createdAt: lastCheckAt } })
    : 0

  return { users, noNewToday: foundInLastCheck === 0 }
}

/**
 * "더 소개 받기" — 별 소모하고 아직 추천 안 한 상대를 최대 N명 더 추가한다.
 * 추천 가능한 상대가 0명이면 별을 소모하지 않고 NoMoreCandidatesError를 던진다.
 */
export async function addMoreIntroductions(userId: number): Promise<{ users: RecoUser[]; stars: number }> {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { gender: true } })
  const opposite = oppositeGender(me?.gender ?? null)
  if (!opposite) throw new NoMoreCandidatesError()

  const stars = await prisma.$transaction(async tx => {
    const existing = await tx.recommendation.findMany({ where: { userId }, select: { recommendedId: true } })
    const candidates = await findEligibleCandidates(tx, userId, opposite, existing.map(r => r.recommendedId), MORE_INTRO_LIMIT)
    if (candidates.length === 0) throw new NoMoreCandidatesError()

    const spent = await spendEffectiveStars(tx, userId, MORE_INTRO_COST, "인연 추천 더 받기")
    await tx.recommendation.createMany({
      data: candidates.map(c => ({ userId, recommendedId: c.id })),
      skipDuplicates: true,
    })
    return spent.stars
  })

  return { users: await getRecommendedList(userId), stars }
}
