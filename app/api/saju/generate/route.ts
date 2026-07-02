import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { computeSaju } from "@/lib/saju"
import { generateSajuReport } from "@/lib/prompts/sajuReport"

// Vercel 함수 최대 실행 시간 (초) — Claude API 호출이 길어질 수 있음
export const maxDuration = 60

/**
 * 사주 리포트 생성 전용 엔드포인트.
 * auth/birth에서 생성이 실패했을 때 결과 페이지에서 재시도용으로 사용.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { gender: true, calendarType: true, birthDate: true, birthTime: true, birthTimeUnknown: true },
    })

    if (!user?.gender || !user.calendarType || !user.birthDate) {
      return NextResponse.json({ error: "birth info missing" }, { status: 400 })
    }

    const saju = computeSaju(
      {
        birthDate: user.birthDate,
        birthTime: user.birthTimeUnknown ? null : user.birthTime,
        birthTimeUnknown: !!user.birthTimeUnknown,
        calendarType: user.calendarType as "SOLAR" | "LUNAR" | "LUNAR_LEAP",
      },
      user.gender as "MALE" | "FEMALE",
    )

    const report = await generateSajuReport(saju)
    const sajuResult = JSON.stringify(report)

    await prisma.user.update({
      where: { id: payload.userId },
      data: { sajuResult },
    })

    return NextResponse.json({ ok: true, sajuResult })
  } catch (err) {
    console.error("[saju/generate] error:", err)
    return NextResponse.json(
      { error: "generation failed", detail: String(err) },
      { status: 500 },
    )
  }
}
