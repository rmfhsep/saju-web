import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: "no token" }, { status: 401 })
  }

  try {
    const payload = await verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        gender: true,
        calendarType: true,
        birthDate: true,
        birthTime: true,
        birthTimeUnknown: true,
        profileComplete: true,
        filterComplete: true,
        blockedPhones: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
