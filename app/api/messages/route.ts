import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendPushNotification } from "@/lib/push"

const MESSAGE_COST = 3

class InsufficientStarsError extends Error {
  constructor(public stars: number) {
    super("insufficient stars")
  }
}

/**
 * 메시지 보내기 — 상대와의 첫 메시지는 별 3개 소모, 이미 대화가 시작된 사이면 무료.
 * body: { toUserId: number, body: string }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const body = await req.json().catch(() => ({}))
    const toUserId = Number(body?.toUserId)
    const text = typeof body?.body === "string" ? body.body.trim().slice(0, 500) : ""
    if (!Number.isFinite(toUserId) || toUserId === payload.userId) {
      return NextResponse.json({ error: "invalid toUserId" }, { status: 400 })
    }
    if (!text) return NextResponse.json({ error: "empty message" }, { status: 400 })

    const hasConversation = await prisma.message.findFirst({
      where: {
        OR: [
          { fromUserId: payload.userId, toUserId },
          { fromUserId: toUserId, toUserId: payload.userId },
        ],
      },
      select: { id: true },
    })
    const cost = hasConversation ? 0 : MESSAGE_COST

    // 별 차감 + 메시지 생성을 하나의 트랜잭션으로 묶어, 메시지 생성이 실패해도
    // 이미 차감된 별이 남지 않고 자동으로 롤백되게 한다.
    let message: Awaited<ReturnType<typeof prisma.message.create>>
    let stars: number
    try {
      const result = await prisma.$transaction(async tx => {
        if (cost > 0) {
          const spent = await tx.user.updateMany({
            where: { id: payload.userId, stars: { gte: cost } },
            data: { stars: { decrement: cost } },
          })
          if (spent.count === 0) {
            const cur = await tx.user.findUnique({ where: { id: payload.userId }, select: { stars: true } })
            throw new InsufficientStarsError(cur?.stars ?? 0)
          }
        }
        const msg = await tx.message.create({ data: { fromUserId: payload.userId, toUserId, body: text } })
        const me = await tx.user.findUnique({ where: { id: payload.userId }, select: { stars: true } })
        return { msg, stars: me?.stars ?? 0 }
      })
      message = result.msg
      stars = result.stars
    } catch (err) {
      if (err instanceof InsufficientStarsError) {
        return NextResponse.json({ error: "insufficient stars", stars: err.stars }, { status: 409 })
      }
      throw err
    }

    const me = await prisma.user.findUnique({ where: { id: payload.userId }, select: { nickname: true, name: true } })
    const fromLabel = me?.nickname || me?.name || "누군가"
    sendPushNotification(toUserId, { title: `${fromLabel}님의 메시지`, body: text }).catch(() => {})

    return NextResponse.json({ ok: true, message, cost, stars })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}

/**
 * 내 메시지함 — 상대별 최근 메시지 1건씩 묶어서 최신순으로 반환.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)

    const messages = await prisma.message.findMany({
      where: { OR: [{ fromUserId: payload.userId }, { toUserId: payload.userId }] },
      orderBy: { createdAt: "desc" },
    })
    if (messages.length === 0) return NextResponse.json({ conversations: [] })

    const latestByCounterpart = new Map<number, (typeof messages)[number]>()
    for (const m of messages) {
      const counterpartId = m.fromUserId === payload.userId ? m.toUserId : m.fromUserId
      if (!latestByCounterpart.has(counterpartId)) latestByCounterpart.set(counterpartId, m)
    }

    const counterpartIds = Array.from(latestByCounterpart.keys())
    const users = await prisma.user.findMany({
      where: { id: { in: counterpartIds } },
      select: { id: true, nickname: true, name: true, photos: true },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    const conversations = counterpartIds
      .map(id => {
        const u = userMap.get(id)
        const last = latestByCounterpart.get(id)!
        if (!u) return null
        return {
          user: u,
          lastMessage: last.body,
          lastAt: last.createdAt,
          lastFromMe: last.fromUserId === payload.userId,
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.lastAt).getTime() - new Date(a!.lastAt).getTime())

    return NextResponse.json({ conversations })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
