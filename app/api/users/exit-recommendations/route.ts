import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { buildExitRecommendations } from "@/lib/pool/exitRecommendations"
import { toRecoUser } from "@/lib/pool/types"

/**
 * matching_pool_spec § 7-4 — 탈퇴 사유로 "만나고 싶은 사람이 없어요"를 고른 유저에게
 * 마지막으로 3명(골드 1 / 실버 2)을 추천하고, 홈 화면 "오늘의 추천"에도 그대로 누적한다.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const picked = await buildExitRecommendations(payload.userId)

    if (picked.length > 0) {
      await prisma.recommendation.createMany({
        data: picked.map(c => ({ userId: payload.userId, recommendedId: c.user.id })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ ok: true, users: picked.map(c => toRecoUser(c.user)) })
  } catch (err) {
    console.error("[api/users/exit-recommendations] failed:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
