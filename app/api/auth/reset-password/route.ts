import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signToken } from "@/lib/auth"

const PW_LETTER = /[a-zA-Z]/
const PW_NUMBER = /[0-9]/

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json()

  if (!phone || !password) {
    return NextResponse.json({ error: "phone and password are required" }, { status: 400 })
  }
  if (password.length < 8 || password.length > 12 || !PW_LETTER.test(password) || !PW_NUMBER.test(password)) {
    return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { phone }, data: { passwordHash } })

  const token = await signToken({ userId: user.id, phone })

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
