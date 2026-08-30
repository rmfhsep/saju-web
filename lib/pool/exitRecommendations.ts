/**
 * matching_pool_spec § 7-4 — 탈퇴 사유로 "만나고 싶은 사람이 없어서"를 고른 유저에게 마지막으로
 * 3명(골드 1 / 실버 2)을 추천한다. 하드필터 중 차단/신고/이미 교류만 적용하고, 거주지·연애목적·
 * 유저 선택 필터·사주 궁합 최소 기준은 전부 적용하지 않는다(스펙 원문 그대로).
 */
import { prisma } from "@/lib/db"
import { POOL_USER_SELECT } from "./types"
import { fetchExitCandidates } from "./hardFilter"
import { scoreAndSort } from "./scoring"
import { pickExitCandidates } from "./slotMixing"
import type { ScoredCandidate } from "./scoring"

export async function buildExitRecommendations(userId: number): Promise<ScoredCandidate[]> {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: POOL_USER_SELECT })
  if (!me) return []

  const candidates = await fetchExitCandidates(me)
  const scored = scoreAndSort(me, candidates)
  return pickExitCandidates(scored)
}
