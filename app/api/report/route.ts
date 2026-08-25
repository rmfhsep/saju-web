import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { createReport } from "@/lib/moderation"
import { REPORT_REASONS, REPORT_REASON_OTHER } from "@/lib/reportReasons"

/**
 * 프로필 신고. body: { toUserId: number, reason: string, detail?: string }
 * "기타" 사유는 detail(500자 이하)이 필수다.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  let payload: { userId: number; phone: string }
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const toUserId = Number(body?.toUserId)
    const reason = typeof body?.reason === "string" ? body.reason : ""
    const detail = typeof body?.detail === "string" ? body.detail.trim().slice(0, 500) : ""

    if (!Number.isFinite(toUserId) || toUserId === payload.userId) {
      return NextResponse.json({ error: "invalid toUserId" }, { status: 400 })
    }
    if (!REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
      return NextResponse.json({ error: "invalid reason" }, { status: 400 })
    }
    if (reason === REPORT_REASON_OTHER && !detail) {
      return NextResponse.json({ error: "detail required" }, { status: 400 })
    }

    await createReport(payload.userId, toUserId, reason, detail || undefined)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/report] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
