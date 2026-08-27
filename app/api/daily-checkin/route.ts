import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { addStars, effectiveTrialStars } from "@/lib/stars"

const CHECKIN_INTERVAL_MS = 24 * 60 * 60 * 1000

/**
 * 매일 출석 별 적립. 추천 탭 진입 시마다 호출되지만, lastStarCheckInAt로부터
 * 24시간이 지났을 때만 별 1개를 지급한다(하루 여러 번 방문해도 1회만 적립).
 *
 * TODO(심사 완료 후 제거): 결제 심사 기간 동안 스토어를 가리는 대신 넣은 임시 보상
 * 수단이다. 심사 끝나고 스토어를 다시 열면 이 라우트와 호출부(app/page.tsx의
 * 체크인 fetch, 적립 모달), StarInfoModal, User.lastStarCheckInAt 컬럼을 함께 정리할 것.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  try {
    const payload = await verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { lastStarCheckInAt: true, stars: true, trialStars: true, trialStarsExpireAt: true },
    })
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 401 })

    const needsCheckIn =
      !user.lastStarCheckInAt || Date.now() - user.lastStarCheckInAt.getTime() >= CHECKIN_INTERVAL_MS

    if (!needsCheckIn) {
      const stars = user.stars + effectiveTrialStars(user.trialStars, user.trialStarsExpireAt)
      return NextResponse.json({ credited: false, stars })
    }

    const { stars } = await prisma.$transaction(async tx => {
      const result = await addStars(tx, { userId: payload.userId, amount: 1, reason: "매일 출석" })
      await tx.user.update({ where: { id: payload.userId }, data: { lastStarCheckInAt: new Date() } })
      return result
    })

    return NextResponse.json({ credited: true, stars })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
