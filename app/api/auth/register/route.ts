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

    const passwordHash = await bcrypt.hash(password, 10)

    const existing = await prisma.user.findUnique({ where: { phone } })

    let userId: number
    let isNew: boolean

    if (existing) {
      // SMS 인증을 통해 본인 확인이 완료됐으므로 비밀번호 재설정 후 로그인
      await prisma.user.update({
        where: { phone },
        data: { passwordHash },
      })
      userId = existing.id
      isNew = false
    } else {
      const user = await prisma.user.create({ data: { phone, passwordHash } })
      userId = user.id
      isNew = true
    }

    const token = await signToken({ userId, phone })

    return NextResponse.json(
      { id: userId, phone, token, isNew },
      { status: isNew ? 201 : 200 }
    )
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
