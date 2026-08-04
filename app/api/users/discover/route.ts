import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * 메인(추천) 홈에 보여줄 이성 유저 목록.
 * 내가 남성이면 여성, 여성이면 남성 유저를 최대 2명 반환한다.
 * (본인 제외, 프로필 완성한 유저만)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const me = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { gender: true },
    })

    const opposite = me?.gender === "MALE" ? "FEMALE" : me?.gender === "FEMALE" ? "MALE" : null
    if (!opposite) return NextResponse.json({ users: [] })

    const users = await prisma.user.findMany({
      where: {
        gender: opposite,
        profileComplete: true,
        id: { not: payload.userId },
      },
      select: { id: true, nickname: true, name: true, photos: true, birthDate: true, bioTags: true },
      orderBy: { createdAt: "desc" },
      take: 2,
    })

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
