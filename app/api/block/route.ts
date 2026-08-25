import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { createBlock } from "@/lib/moderation"

/**
 * 상대 유저 차단. body: { toUserId: number }
 * 차단하면 양방향으로 서로의 프로필/추천 목록에서 제외된다(lib/moderation.ts 참고).
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

    await createBlock(payload.userId, toUserId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/block] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
