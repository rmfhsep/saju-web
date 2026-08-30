import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { effectiveTrialStars, spendEffectiveStars, InsufficientStarsError } from "@/lib/stars"

const COMPAT_UNLOCK_COST = 1

/** 실제 stars + 만료 전 trialStars 합산 (auth/me 등 다른 화면에 노출되는 잔액과 동일 기준). */
async function getCombinedStars(userId: number): Promise<number> {
  const cur = await prisma.user.findUnique({
    where: { id: userId },
    select: { stars: true, trialStars: true, trialStarsExpireAt: true },
  })
  if (!cur) return 0
  return cur.stars + effectiveTrialStars(cur.trialStars, cur.trialStarsExpireAt)
}

/**
 * 궁합 잠금해제 — 별 1개 소모, 같은 상대는 한 번만 차감(이미 열었으면 재차감 없이 200).
 * body: { targetUserId: number }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  let payload: { userId: number; phone: string }
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const targetUserId = Number(body?.targetUserId)
    if (!Number.isFinite(targetUserId) || targetUserId === payload.userId) {
      return NextResponse.json({ error: "invalid targetUserId" }, { status: 400 })
    }

    const existing = await prisma.compatUnlock.findUnique({
      where: { userId_targetUserId: { userId: payload.userId, targetUserId } },
    })
    if (existing) {
      return NextResponse.json({ ok: true, stars: await getCombinedStars(payload.userId) })
    }

    let stars: number
    try {
      stars = await prisma.$transaction(async tx => {
        const spent = await spendEffectiveStars(tx, payload.userId, COMPAT_UNLOCK_COST, "궁합 보기")
        await tx.compatUnlock.create({ data: { userId: payload.userId, targetUserId } })
        return spent.stars
      })
    } catch (err) {
      if (err instanceof InsufficientStarsError) {
        return NextResponse.json({ error: "insufficient stars", stars: err.stars }, { status: 409 })
      }
      throw err
    }

    return NextResponse.json({ ok: true, stars })
  } catch (err) {
    console.error("[api/compat/unlock POST] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
