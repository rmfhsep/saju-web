import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * 네이티브 앱이 FCM 디바이스 토큰을 발급받으면 이 엔드포인트로 등록한다.
 * body: { token: string }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const body = await req.json().catch(() => ({}))
    const pushToken = typeof body?.token === "string" ? body.token : null
    if (!pushToken) return NextResponse.json({ error: "invalid token" }, { status: 400 })

    await prisma.user.update({
      where: { id: payload.userId },
      data: { pushToken, pushEnabled: true },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
