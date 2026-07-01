import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    if (!phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 })
    }

    await prisma.user.update({
      where: { phone },
      data: { signupComplete: true },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
