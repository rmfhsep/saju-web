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
    // 탈퇴일 기록 — 동일 번호 30일 재가입 제한용 (User는 hard delete되므로 별도 테이블에 보관)
    if (payload.phone) {
      await prisma.withdrawnPhone.upsert({
        where: { phone: payload.phone },
        create: { phone: payload.phone },
        update: { withdrawnAt: new Date() },
      })
    }
    await prisma.user.delete({ where: { id: payload.userId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
