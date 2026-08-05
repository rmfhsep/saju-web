import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { addMoreIntroductions, InsufficientStarsError, NoMoreCandidatesError, MORE_INTRO_COST } from "@/lib/recommendations"

/**
 * "더 소개 받기" — 별 10개로 아직 추천 안 한 이성 최대 3명을 추가로 소개받는다.
 * 추천 가능한 이성이 0명이면 별을 소모하지 않고 409로 알려준다.
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
    const { users, stars } = await addMoreIntroductions(payload.userId)
    return NextResponse.json({ ok: true, users, stars })
  } catch (err) {
    if (err instanceof NoMoreCandidatesError) {
      return NextResponse.json({ error: "no more candidates" }, { status: 409 })
    }
    if (err instanceof InsufficientStarsError) {
      return NextResponse.json({ error: "insufficient stars", stars: err.stars, cost: MORE_INTRO_COST }, { status: 409 })
    }
    console.error("[api/users/discover/more] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
