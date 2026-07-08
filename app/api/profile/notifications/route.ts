import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * 알림 설정 저장.
 * - serviceNotify: 서비스(혜택/이벤트) 알림 수신 토글
 * - pushEnabled: 기기 푸시 권한 허용 여부 (추후 네이티브 연동 시 갱신)
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const body = await req.json()

    const data: Record<string, unknown> = {}
    if (typeof body.serviceNotify === "boolean") data.serviceNotify = body.serviceNotify
    if (typeof body.pushEnabled === "boolean") data.pushEnabled = body.pushEnabled

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "no fields" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data,
      select: { id: true, serviceNotify: true, pushEnabled: true },
    })
    return NextResponse.json({ ok: true, ...user })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
