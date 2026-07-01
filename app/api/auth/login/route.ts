import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json()

  if (!phone || !password) {
    return NextResponse.json({ error: "phone and password are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user || !user.signupComplete) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 })
  }

  const token = await signToken({ userId: user.id, phone: user.phone })

  return NextResponse.json({
    id: user.id,
    phone: user.phone,
    token,
    name: user.name,
    gender: user.gender,
    birthDate: user.birthDate,
    profileComplete: user.profileComplete,
    filterComplete: user.filterComplete,
  })
}
