import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateTagSuggestion } from "@/lib/prompts/tagSuggestion"
import type { SajuReport } from "@/lib/prompts/sajuReport"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { phone, datingPurpose, politics, drinking, smoking } = await req.json()
    if (!phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { phone }, select: { sajuResult: true } })
    if (!user?.sajuResult) {
      return NextResponse.json({ error: "saju result not found" }, { status: 404 })
    }

    const report: SajuReport = JSON.parse(user.sajuResult)
    const { express, emotion, lead, attach } = report.섹션1_연애기질.ai_tags

    const suggestion = await generateTagSuggestion({
      purpose: datingPurpose ?? "",
      politics: politics ?? "",
      drink: drinking ?? "",
      smoke: smoking ?? "",
      express, emotion, lead, attach,
    })

    await prisma.user.update({
      where: { phone },
      data: { recommendedTags: JSON.stringify(suggestion) },
    })

    return NextResponse.json(suggestion)
  } catch (err) {
    console.error("tag suggestion failed", err)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
