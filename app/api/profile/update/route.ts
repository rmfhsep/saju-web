import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { computeSaju } from "@/lib/saju"
import { generateSajuReport } from "@/lib/prompts/sajuReport"

const SIMPLE_FIELDS = [
  "nickname", "location", "job", "jobDetail",
  "smoking", "drinking", "datingPurpose", "politics", "religion", "income",
] as const

/** 마이페이지 > 프로필 편집에서 단일/소수 필드만 부분 업데이트한다. 넘기지 않은 필드는 그대로 유지된다. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone } = body
    if (!phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    for (const key of SIMPLE_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    if (body.height !== undefined) data.height = body.height ? parseInt(String(body.height), 10) : null
    if (body.photos !== undefined) data.photos = JSON.stringify(body.photos)
    if (body.bioTags !== undefined) data.bioTags = JSON.stringify(body.bioTags)
    if (body.bio !== undefined) data.bio = JSON.stringify(body.bio)

    // 태어난 시간 변경 시 사주 리포트를 재생성한다 (다른 출생 정보는 수정 불가).
    if (body.birthTime !== undefined || body.birthTimeUnknown !== undefined) {
      const user = await prisma.user.findUnique({
        where: { phone },
        select: { gender: true, calendarType: true, birthDate: true },
      })
      if (user?.gender && user.calendarType && user.birthDate) {
        const birthTimeUnknown = !!body.birthTimeUnknown
        data.birthTime = birthTimeUnknown ? null : (body.birthTime || null)
        data.birthTimeUnknown = birthTimeUnknown
        try {
          const saju = computeSaju(
            {
              birthDate: user.birthDate,
              birthTime: birthTimeUnknown ? null : body.birthTime,
              birthTimeUnknown,
              calendarType: user.calendarType as "SOLAR" | "LUNAR" | "LUNAR_LEAP",
            },
            user.gender as "MALE" | "FEMALE",
          )
          const report = await generateSajuReport(saju)
          data.sajuResult = JSON.stringify(report)
        } catch (err) {
          console.error("saju report regeneration failed", err)
        }
      }
    }

    const user = await prisma.user.update({ where: { phone }, data, select: { id: true } })
    return NextResponse.json({ ok: true, id: user.id })
  } catch (err) {
    console.error("profile update failed", err)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
