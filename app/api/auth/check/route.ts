import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")
  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { phone }, select: { id: true } })
  return NextResponse.json({ exists: !!user })
}
