import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { computeDailyFortune } from "@/lib/dailyFortune"

/**
 * 오늘의 연애운 배너 + 상세 리포트 데이터.
 * AI 호출 없는 결정론적 규칙 계산이라 캐싱 없이 요청마다 재계산한다 (prompt/maju_today_fortune.md 참고).
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
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { birthDate: true, birthTime: true, birthTimeUnknown: true, calendarType: true, gender: true, sajuResult: true },
    })
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 })

    const fortune = computeDailyFortune({ userId: payload.userId, ...user })
    if (!fortune) return NextResponse.json({ error: "birth info missing" }, { status: 409 })

    return NextResponse.json(fortune)
  } catch (err) {
    console.error("[api/daily-fortune/me] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
