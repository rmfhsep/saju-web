import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 게임 점수 → 별 환산: 10점당 1개, 1회 최대 100개 (클라이언트 점수 조작 대비 상한)
const POINTS_PER_STAR = 10
const MAX_STARS_PER_GAME = 100

function scoreToStars(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0
  return Math.min(Math.floor(score / POINTS_PER_STAR), MAX_STARS_PER_GAME)
}

/**
 * 미니게임 점수를 별로 적립한다.
 * body: { score: number }  → 서버에서 환산·상한 적용 후 User.stars 에 가산.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const body = await req.json().catch(() => ({}))
    const earned = scoreToStars(Number(body?.score))

    if (earned <= 0) {
      const cur = await prisma.user.findUnique({ where: { id: payload.userId }, select: { stars: true } })
      return NextResponse.json({ ok: true, earned: 0, stars: cur?.stars ?? 0 })
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { stars: { increment: earned } },
      select: { stars: true },
    })
    return NextResponse.json({ ok: true, earned, stars: user.stars })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
