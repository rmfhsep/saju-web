import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDailyRecommendations } from "@/lib/recommendations"

/**
 * 메인(추천) 홈에 보여줄 이성 유저 목록.
 * 누적 추천 이력을 반환하고, 24시간이 지났으면 새 후보를 찾아 배치로 추가한다.
 * (본인 제외, 프로필 완성한 유저만, 이미 추천한 사람은 중복 추천하지 않음)
 */
export async function GET(req: NextRequest) {
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
    const { users, noNewToday } = await getDailyRecommendations(payload.userId)
    return NextResponse.json({ users, noNewToday })
  } catch (err) {
    console.error("[api/users/discover] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
