import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { phone, contactPhones } = await req.json()

  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 })
  }

  const phones: string[] = Array.isArray(contactPhones) ? contactPhones : []

  const user = await prisma.user.update({
    where: { phone },
    data: {
      blockedPhones: JSON.stringify(phones),
      blockedCount: phones.length,
    },
    select: { blockedCount: true },
  })

  return NextResponse.json({ blockedCount: user.blockedCount })
}
