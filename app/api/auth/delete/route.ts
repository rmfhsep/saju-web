import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: "no token" }, { status: 401 })
  }

  try {
    const payload = await verifyToken(token)

    // 탈퇴 사유(app/my/settings/withdraw) — 없으면(구버전 클라이언트 등) 그냥 건너뛴다.
    let reason: string | undefined
    let detail: string | undefined
    try {
      const body = await req.json()
      reason = typeof body?.reason === "string" ? body.reason : undefined
      detail = typeof body?.detail === "string" ? body.detail : undefined
    } catch {
      // body 없음 — 무시
    }

    // 탈퇴일 기록 — 동일 번호 30일 재가입 제한용 (User는 hard delete되므로 별도 테이블에 보관)
    // 테이블 미생성 등 오류가 나도 탈퇴 자체는 진행되도록 방어
    if (payload.phone) {
      try {
        await prisma.withdrawnPhone.upsert({
          where: { phone: payload.phone },
          create: { phone: payload.phone },
          update: { withdrawnAt: new Date() },
        })
        if (reason) await prisma.withdrawReason.create({ data: { phone: payload.phone, reason, detail } })
      } catch (e) {
        console.warn("[api/auth/delete] withdrawnPhone/withdrawReason record skipped:", e)
      }
    }
    await prisma.user.delete({ where: { id: payload.userId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
