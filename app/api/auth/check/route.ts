import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")
  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone }, select: { signupComplete: true } })
    return NextResponse.json({ exists: !!user?.signupComplete })
  } catch (err) {
    console.error("[api/auth/check] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
