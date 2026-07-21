import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")
  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone }, select: { signupComplete: true } })

    // 탈퇴 후 30일 이내 재가입 제한 확인 (테이블 미생성 등 오류가 나도 로그인 흐름은 유지)
    let rejoinBlockedUntil: string | null = null
    try {
      const withdrawn = await prisma.withdrawnPhone.findUnique({ where: { phone } })
      if (withdrawn) {
        const until = withdrawn.withdrawnAt.getTime() + 30 * 24 * 60 * 60 * 1000
        if (until > Date.now()) rejoinBlockedUntil = new Date(until).toISOString()
        else await prisma.withdrawnPhone.delete({ where: { phone } }).catch(() => {})
      }
    } catch (e) {
      console.warn("[api/auth/check] withdrawnPhone lookup skipped:", e)
    }

    return NextResponse.json({ exists: !!user?.signupComplete, rejoinBlockedUntil })
  } catch (err) {
    console.error("[api/auth/check] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
