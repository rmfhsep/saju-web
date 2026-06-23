import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

type FilterType = "height" | "smoking" | "drinking" | "politics" | "religion"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone, type, heightMin, heightMax, value } = body as {
    phone?: string
    type?: FilterType
    heightMin?: number
    heightMax?: number
    value?: string
  }

  if (!phone || !type) {
    return NextResponse.json({ error: "phone and type are required" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { phone },
    data: {
      preferredFilterType: type,
      preferredHeightMin: type === "height" ? heightMin ?? null : null,
      preferredHeightMax: type === "height" ? heightMax ?? null : null,
      preferredSmoking: type === "smoking" ? value ?? null : null,
      preferredDrinking: type === "drinking" ? value ?? null : null,
      preferredPolitics: type === "politics" ? value ?? null : null,
      preferredReligion: type === "religion" ? value ?? null : null,
      filterComplete: true,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: user.id })
}
