import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPhones } from "@/lib/phoneHash"

export async function POST(req: NextRequest) {
  const { phone, contactPhones } = await req.json()

  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 })
  }

  const phones: string[] = Array.isArray(contactPhones) ? contactPhones : []
  // 동의 없이 수집한 지인(제3자) 번호이므로 원문 대신 단방향 해시로 저장한다.
  // 추천 로직에서는 후보자 번호를 같은 방식으로 해시해 포함 여부만 비교하면 됨.
  const hashedPhones = hashPhones(phones)

  const user = await prisma.user.update({
    where: { phone },
    data: {
      blockedPhones: JSON.stringify(hashedPhones),
      blockedCount: phones.length,
    },
    select: { blockedCount: true },
  })

  return NextResponse.json({ blockedCount: user.blockedCount })
}
