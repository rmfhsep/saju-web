import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { effectiveTrialStars } from "@/lib/stars"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: "no token" }, { status: 401 })
  }

  try {
    const payload = await verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        gender: true,
        calendarType: true,
        birthDate: true,
        birthTime: true,
        birthTimeUnknown: true,
        signupComplete: true,
        sajuResult: true,
        nickname: true,
        location: true,
        job: true,
        jobDetail: true,
        height: true,
        smoking: true,
        drinking: true,
        datingPurpose: true,
        politics: true,
        religion: true,
        income: true,
        photos: true,
        bioTags: true,
        bio: true,
        recommendedTags: true,
        profileComplete: true,
        filterComplete: true,
        blockedPhones: true,
        blockedCount: true,
        preferredFilterType: true,
        preferredHeightMin: true,
        preferredHeightMax: true,
        preferredSmoking: true,
        preferredDrinking: true,
        preferredPolitics: true,
        preferredReligion: true,
        serviceNotify: true,
        pushEnabled: true,
        stars: true,
        trialStars: true,
        trialStarsExpireAt: true,
        miniGamePlayed: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 401 })
    }

    const trial = effectiveTrialStars(user.trialStars, user.trialStarsExpireAt)
    if (trial !== user.trialStars) {
      // 만료된 체험용 별 정리 (다음 조회부터는 DB 값도 0)
      await prisma.user.update({ where: { id: user.id }, data: { trialStars: 0, trialStarsExpireAt: null } }).catch(() => {})
    }

    // 마이/스토어 화면은 stars 하나만 읽으므로, 만료 전 체험용 별을 합산해 노출한다.
    return NextResponse.json({ ...user, stars: user.stars + trial, trialStars: trial })
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}
