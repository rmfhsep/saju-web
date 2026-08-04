import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * 특정 상대와의 메시지 스레드 전체 조회 (시간순).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  const { userId } = await params
  const otherId = parseInt(userId, 10)
  if (!Number.isFinite(otherId)) return NextResponse.json({ error: "invalid id" }, { status: 400 })

  let payload: { userId: number; phone: string }
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }

  try {
    const [other, messages] = await Promise.all([
      prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true, nickname: true, name: true, photos: true },
      }),
      prisma.message.findMany({
        where: {
          OR: [
            { fromUserId: payload.userId, toUserId: otherId },
            { fromUserId: otherId, toUserId: payload.userId },
          ],
        },
        orderBy: { createdAt: "asc" },
      }),
    ])

    if (!other) return NextResponse.json({ error: "user not found" }, { status: 404 })

    return NextResponse.json({
      user: other,
      messages: messages.map(m => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        fromMe: m.fromUserId === payload.userId,
      })),
    })
  } catch (err) {
    console.error("[api/messages/:userId] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
