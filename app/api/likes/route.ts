import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendPushNotification } from "@/lib/push"
import { effectiveTrialStars, spendEffectiveStars, InsufficientStarsError } from "@/lib/stars"

const LIKE_COST = 1

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
 * 호감 보내기 — 별 1개 소모, 같은 상대에게 중복 전송 불가.
 * body: { toUserId: number }
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
    const toUserId = Number(body?.toUserId)
    if (!Number.isFinite(toUserId) || toUserId === payload.userId) {
      return NextResponse.json({ error: "invalid toUserId" }, { status: 400 })
    }

    const existing = await prisma.like.findUnique({
      where: { fromUserId_toUserId: { fromUserId: payload.userId, toUserId } },
    })
    if (existing) {
      return NextResponse.json({ ok: true, alreadyLiked: true, stars: await getCombinedStars(payload.userId) })
    }

    // 별 차감 + 호감 기록 생성을 하나의 트랜잭션으로 묶어, 동시에 같은 요청이
    // 두 번 들어와도(더블클릭 등) 한쪽이 실패하면 차감분이 자동으로 롤백되게 한다.
    let stars: number
    try {
      stars = await prisma.$transaction(async tx => {
        const spent = await spendEffectiveStars(tx, payload.userId, LIKE_COST, "좋아요 보내기")
        await tx.like.create({ data: { fromUserId: payload.userId, toUserId } })
        return spent.stars
      })
    } catch (err) {
      if (err instanceof InsufficientStarsError) {
        return NextResponse.json({ error: "insufficient stars", stars: err.stars }, { status: 409 })
      }
      // 동시 요청 두 개가 경합해 같은 상대에게 호감 기록을 동시에 만들려던 경우 —
      // 차감분은 트랜잭션 롤백으로 안전하게 되돌아가 있다.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({ ok: true, alreadyLiked: true, stars: await getCombinedStars(payload.userId) })
      }
      throw err
    }

    const me = await prisma.user.findUnique({ where: { id: payload.userId }, select: { nickname: true, name: true } })
    const fromLabel = me?.nickname || me?.name || "누군가"
    sendPushNotification(toUserId, { title: "새로운 호감", body: `${fromLabel}님이 회원님에게 호감을 보냈어요.` }).catch(() => {})

    return NextResponse.json({ ok: true, stars })
  } catch (err) {
    console.error("[api/likes POST] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}

/**
 * 내가 받은 호감 목록.
 */
export async function GET(req: NextRequest) {
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
    const likes = await prisma.like.findMany({
      where: { toUserId: payload.userId },
      orderBy: { createdAt: "desc" },
    })
    if (likes.length === 0) return NextResponse.json({ likes: [] })

    const fromUsers = await prisma.user.findMany({
      where: { id: { in: likes.map(l => l.fromUserId) } },
      select: { id: true, nickname: true, name: true, photos: true, birthDate: true, bioTags: true },
    })
    const userMap = new Map(fromUsers.map(u => [u.id, u]))

    const result = likes
      .map(l => {
        const u = userMap.get(l.fromUserId)
        if (!u) return null
        return { ...u, likedAt: l.createdAt }
      })
      .filter(Boolean)

    return NextResponse.json({ likes: result })
  } catch (err) {
    console.error("[api/likes GET] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
