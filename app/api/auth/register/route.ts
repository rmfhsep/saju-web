import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signToken } from "@/lib/auth"

const PHONE_RE = /^01[0-9]{8,9}$/
const PW_LETTER = /[a-zA-Z]/
const PW_NUMBER = /[0-9]/

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()

    if (!phone || !password) {
      return NextResponse.json({ error: "phone and password are required" }, { status: 400 })
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "invalid phone format" }, { status: 400 })
    }
    if (password.length < 8 || password.length > 12) {
      return NextResponse.json({ error: "password must be 8-12 characters" }, { status: 400 })
    }
    if (!PW_LETTER.test(password) || !PW_NUMBER.test(password)) {
      return NextResponse.json({ error: "password must contain letters and numbers" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      if (existing.signupComplete) {
        return NextResponse.json({ error: "PHONE_ALREADY_REGISTERED" }, { status: 409 })
      }
      // 태그 선택(회원가입 완료 시점) 이전에 이탈한 미완료 계정 — 삭제 후 재가입 처리
      await prisma.user.delete({ where: { phone } })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { phone, passwordHash } })
    const token = await signToken({ userId: user.id, phone })

    return NextResponse.json({ id: user.id, phone, token, isNew: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
