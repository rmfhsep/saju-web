import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signToken } from "@/lib/auth"

/**
 * 앱스토어 심사용 백도어 로그인 — 전화번호 인증 없이 아이디/비밀번호로 로그인.
 * /onboarding/phone 타이틀 3초 롱프레스로만 진입 가능한 숨김 기능.
 */
export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: "username and password are required" }, { status: 400 })
  }

  const account = await prisma.reviewAccount.findUnique({ where: { username } })
  if (!account) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, account.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: account.userId } })
  if (!user) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 })
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
