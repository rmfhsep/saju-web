import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { starsForBestSurvival, trialStarsExpireAt } from "@/lib/stars"

/**
 * 온보딩 미니게임 별 지급. body: { bestSeconds: number }
 * 3회 도전 중 최고 생존시간(bestSeconds) 하나만 클라이언트에서 집계해 보낸다.
 * 최초 리포트 생성 시 1회만 지급하며(미니게임 재도전 어뷰징 방지), 지급된 별은 체험용(trialStars)으로 7일 후 만료된다.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const body = await req.json().catch(() => ({}))
    const bestSeconds = Number(body?.bestSeconds)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { miniGamePlayed: true, trialStars: true, stars: true },
    })
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 401 })

    if (user.miniGamePlayed) {
      return NextResponse.json({ ok: true, earned: 0, alreadyPlayed: true, stars: user.stars + user.trialStars })
    }

    const earned = starsForBestSurvival(Number.isFinite(bestSeconds) ? Math.max(0, bestSeconds) : 0)
    const expireAt = trialStarsExpireAt()

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: { trialStars: { increment: earned }, trialStarsExpireAt: expireAt, miniGamePlayed: true },
      select: { stars: true, trialStars: true },
    })

    return NextResponse.json({ ok: true, earned, stars: updated.stars + updated.trialStars, trialStarsExpireAt: expireAt })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
