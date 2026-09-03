/**
 * matching_pool_spec 전체 파이프라인 조립 — § 1 Overview 그대로:
 * 거주지 단계적 확장(§7-1) 안에서 Hard Filter → User Filter를 반복하고, 마지막에 Soft Scoring(§4)까지
 * 적용한 정렬된 후보 리스트를 반환한다. Slot Mixing(§6)은 호출부(용도별로 슬롯 구성이 다름)에서 한다.
 */
import { prisma } from "@/lib/db"
import { POOL_USER_SELECT, type PoolUser } from "./types"
import { fetchHardFilteredCandidates, getExcludedCandidateIds, matchesRegionStage } from "./hardFilter"
import { applyUserFilters } from "./userFilter"
import { scoreAndSort, type ScoredCandidate } from "./scoring"
import { getRegion, type RegionStage } from "./region"

const MIN_POOL_SIZE = 3 // § 7-1 — 슬롯당(=풀) 최소 후보 수
const REGION_STAGES: RegionStage[] = ["same", "adjacent", "nation"]

export async function buildPool(userId: number): Promise<ScoredCandidate[]> {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: POOL_USER_SELECT })
  if (!me) return []
  return buildPoolForUser(me)
}

export async function buildPoolForUser(me: PoolUser): Promise<ScoredCandidate[]> {
  const excludeIds = await getExcludedCandidateIds(me.id)
  // region 단계(같은 시/도 → 인접 → 전국)별로 따로 쿼리하던 것을 한 번의 전국 단위 조회로 합치고,
  // 단계 구분은 메모리에서 matchesRegionStage로 나눠 DB 왕복을 최대 3회 → 1회로 줄인다.
  const allCandidates = await fetchHardFilteredCandidates(me, excludeIds)
  const myRegion = getRegion(me.location)

  let userFiltered: PoolUser[] = []
  for (const stage of REGION_STAGES) {
    const staged = allCandidates.filter(c => matchesRegionStage(myRegion, c.location, stage))
    userFiltered = staged.filter(c => applyUserFilters(me, c))
    if (userFiltered.length >= MIN_POOL_SIZE) break
  }

  return scoreAndSort(me, userFiltered)
}
