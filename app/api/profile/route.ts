import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone, nickname, location, job, jobDetail, height, smoking, drinking, datingPurpose, politics, religion, income, photos, bioTags, bio } = body

  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { phone },
    data: {
      nickname,
      location,
      job,
      jobDetail,
      height: height ? parseInt(String(height), 10) : null,
      smoking,
      drinking,
      datingPurpose,
      politics,
      religion,
      income,
      photos: typeof photos === "string" ? photos : JSON.stringify(photos ?? []),
      bioTags: typeof bioTags === "string" ? bioTags : JSON.stringify(bioTags ?? []),
      bio: typeof bio === "string" ? bio : JSON.stringify(bio ?? {}),
      profileComplete: true,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: user.id })
}
