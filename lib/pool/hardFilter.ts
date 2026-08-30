/**
 * matching_pool_spec § 2 — Hard Filter. 조건 불일치 유저를 풀에서 완전히 제거한다(전부 AND).
 * region(§2-1)은 단계적 확장(§7-1)이 필요해서 이 파일이 아니라 lib/pool/buildPool.ts가 stage를
 * 넘겨 호출한다. 나머지(연애목적/차단·신고·이미 교류/사주 궁합 최소 기준)는 이 파일에서 전부 처리.
 */
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { datingPurposeCompatible, calcSajuScore, type AiTags } from "@/lib/matching"
import { getBlockedUserIds } from "@/lib/moderation"
import { POOL_USER_SELECT, type PoolUser } from "./types"
import { getRegion, adjacentRegions, type RegionStage } from "./region"

const SAJU_FLOOR = 50

export function parseAiTags(sajuResult: string | null): AiTags | null {
  if (!sajuResult) return null
  try {
    const report = JSON.parse(sajuResult)
    const tags = report?.섹션1_연애기질?.ai_tags
    if (!tags || typeof tags !== "object") return null
    const { express, emotion, lead, attach } = tags
    if ([express, emotion, lead, attach].some(v => typeof v !== "number")) return null
    return { express, emotion, lead, attach }
  } catch {
    return null
  }
}

export function oppositeGender(gender: string | null): string | null {
  return gender === "MALE" ? "FEMALE" : gender === "FEMALE" ? "MALE" : null
}

/**
 * 차단/신고/이미 교류(좋아요·쪽지)/이미 추천됨 + 본인 — 하드필터 § 2-3, 2-4에 해당하는 후보 id 전부.
 * "이미 추천됨"은 스펙에 명시된 항목은 아니지만, 같은 상대를 반복 추천하지 않는 기존 앱 동작
 * (lib/recommendations.ts의 누적 Recommendation 방식)을 유지하기 위해 추가로 제외한다.
 */
export async function getExcludedCandidateIds(userId: number): Promise<number[]> {
  const [blockedIds, reports, likes, messages, recommendations] = await Promise.all([
    getBlockedUserIds(userId),
    prisma.report.findMany({ where: { reporterId: userId }, select: { reportedId: true } }),
    prisma.like.findMany({ where: { fromUserId: userId }, select: { toUserId: true } }),
    prisma.message.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      select: { fromUserId: true, toUserId: true },
    }),
    prisma.recommendation.findMany({ where: { userId }, select: { recommendedId: true } }),
  ])
  const ids = new Set<number>([userId])
  blockedIds.forEach(id => ids.add(id))
  reports.forEach(r => ids.add(r.reportedId))
  likes.forEach(l => ids.add(l.toUserId))
  messages.forEach(m => ids.add(m.fromUserId === userId ? m.toUserId : m.fromUserId))
  recommendations.forEach(r => ids.add(r.recommendedId))
  return [...ids]
}

function regionWhere(myRegion: string | null, stage: RegionStage): Prisma.UserWhereInput {
  if (stage === "nation" || !myRegion) return {}
  if (stage === "same") return { location: { startsWith: myRegion } }
  const adjacent = adjacentRegions(myRegion)
  if (adjacent.length === 0) return { id: -1 } // 인접 지역 없음(제주 등) → 매칭 없음
  return { OR: adjacent.map(r => ({ location: { startsWith: r } })) }
}

/**
 * region 단계 하나에 대해 성별/profileComplete/제외목록/거주지단계로 DB에서 후보를 가져온 뒤,
 * datingPurpose 호환성(§2-2) + 사주 궁합 50점 미만 제외(§2-5)를 JS에서 마저 적용해 반환한다.
 * 내 sajuResult가 없거나(비정상 케이스) 파싱 실패하면 궁합 계산이 불가능하므로 빈 배열을 반환한다.
 */
export async function fetchHardFilteredCandidates(
  me: PoolUser,
  stage: RegionStage,
  excludeIds: number[],
): Promise<PoolUser[]> {
  const opposite = oppositeGender(me.gender)
  if (!opposite) return []

  const myTags = parseAiTags(me.sajuResult)
  if (!myTags) return []

  const where: Prisma.UserWhereInput = {
    gender: opposite,
    profileComplete: true,
    id: { notIn: excludeIds },
    ...regionWhere(getRegion(me.location), stage),
  }

  const rows = await prisma.user.findMany({ where, select: POOL_USER_SELECT, orderBy: { createdAt: "desc" } })

  return rows.filter(c => {
    if (me.datingPurpose && c.datingPurpose && !datingPurposeCompatible(me.datingPurpose, c.datingPurpose)) return false
    const candidateTags = parseAiTags(c.sajuResult)
    if (!candidateTags) return false
    return calcSajuScore(myTags, candidateTags) >= SAJU_FLOOR
  })
}

/** § 7-4 탈퇴 직전 추천 — 하드필터 중 차단/신고/이미 교류만 적용(거주지·연애목적·사주 궁합 미적용). */
export async function fetchExitCandidates(me: PoolUser): Promise<PoolUser[]> {
  const opposite = oppositeGender(me.gender)
  if (!opposite) return []

  const excludeIds = await getExcludedCandidateIds(me.id)
  return prisma.user.findMany({
    where: { gender: opposite, profileComplete: true, id: { notIn: excludeIds } },
    select: POOL_USER_SELECT,
    orderBy: { createdAt: "desc" },
  })
}
