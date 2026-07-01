import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const VALID_GENDERS = ["MALE", "FEMALE"] as const
const VALID_CALENDAR_TYPES = ["SOLAR", "LUNAR", "LUNAR_LEAP"] as const
const BIRTH_DATE_RE = /^\d{8}$/

function isValidDate(yyyymmdd: string) {
  const y = parseInt(yyyymmdd.slice(0, 4), 10)
  const m = parseInt(yyyymmdd.slice(4, 6), 10)
  const d = parseInt(yyyymmdd.slice(6, 8), 10)
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

export async function POST(req: NextRequest) {
  try {
    const { phone, name, gender, calendarType, birthDate, birthTime, birthTimeUnknown } = await req.json()

    if (!phone || !name || !gender || !calendarType || !birthDate) {
      return NextResponse.json({ error: "required fields missing" }, { status: 400 })
    }
    if (!VALID_GENDERS.includes(gender)) {
      return NextResponse.json({ error: "invalid gender" }, { status: 400 })
    }
    if (!VALID_CALENDAR_TYPES.includes(calendarType)) {
      return NextResponse.json({ error: "invalid calendarType" }, { status: 400 })
    }
    if (!BIRTH_DATE_RE.test(birthDate) || !isValidDate(birthDate)) {
      return NextResponse.json({ error: "invalid birthDate" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (!existing) {
      return NextResponse.json({ error: "user not found" }, { status: 404 })
    }

    // 사주 리포트(Claude) 생성은 여기서 기다리지 않는다 — 결과 화면(SajuResult)의
    // 마운트 시점에 /api/saju/generate 가 호출되어 "분석 중" 화면에서 진행된다.
    const user = await prisma.user.update({
      where: { phone },
      data: {
        name: name.trim(),
        gender,
        calendarType,
        birthDate,
        birthTime: birthTimeUnknown ? null : (birthTime || null),
        birthTimeUnknown: !!birthTimeUnknown,
      },
    })

    return NextResponse.json({ id: user.id })
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
