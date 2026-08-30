import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAuthorizedCronRequest } from "@/lib/cron"
import { buildPool } from "@/lib/pool/buildPool"
import { pickCandidates } from "@/lib/pool/slotMixing"

export const maxDuration = 60

/**
 * matching_pool_spec § 6-0 — 매일 20:00 KST(vercel.json: 11:00 UTC) 고정 발송.
 * 전체 유저를 순회해 골드 1 / 실버 1 / 뉴비 1을 Recommendation에 누적 저장한다.
 * 유저 한 명 실패가 배치 전체를 막지 않도록 개별 try/catch.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { profileComplete: true },
    select: { id: true },
  })

  let ok = 0
  let failed = 0
  let totalPicked = 0

  for (const { id: userId } of users) {
    try {
      const scored = await buildPool(userId)
      const picked = pickCandidates(scored)
      if (picked.length > 0) {
        await prisma.recommendation.createMany({
          data: picked.map(c => ({ userId, recommendedId: c.user.id })),
          skipDuplicates: true,
        })
      }
      totalPicked += picked.length
      ok++
    } catch (err) {
      failed++
      console.error(`[cron/daily-recommendations] user ${userId} 실패:`, err)
    }
  }

  return NextResponse.json({ ok, failed, totalPicked, totalUsers: users.length })
}
