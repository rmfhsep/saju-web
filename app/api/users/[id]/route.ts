import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { buildCompatibilitySection } from "@/lib/matching"
import { isBlockedEitherWay } from "@/lib/moderation"
import type { SajuReport } from "@/lib/prompts/sajuReport"

/**
 * 추천/매칭 상대의 공개 프로필 조회. 전화번호 등 민감 정보는 절대 내려주지 않는다.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 })

  const { id } = await params
  const targetId = parseInt(id, 10)
  if (!Number.isFinite(targetId)) return NextResponse.json({ error: "invalid id" }, { status: 400 })

  let payload: { userId: number; phone: string }
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }

  try {
    if (await isBlockedEitherWay(payload.userId, targetId)) {
      return NextResponse.json({ error: "user not found" }, { status: 404 })
    }

    const [user, like, conversation, me] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetId, profileComplete: true },
        select: {
          id: true,
          nickname: true,
          name: true,
          birthDate: true,
          height: true,
          job: true,
          jobDetail: true,
          location: true,
          smoking: true,
          drinking: true,
          datingPurpose: true,
          politics: true,
          religion: true,
          photos: true,
          bioTags: true,
          bio: true,
          sajuResult: true,
        },
      }),
      prisma.like.findUnique({
        where: { fromUserId_toUserId: { fromUserId: payload.userId, toUserId: targetId } },
        select: { id: true },
      }),
      prisma.message.findFirst({
        where: {
          OR: [
            { fromUserId: payload.userId, toUserId: targetId },
            { fromUserId: targetId, toUserId: payload.userId },
          ],
        },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: payload.userId },
        select: { sajuResult: true, datingPurpose: true, politics: true, drinking: true, smoking: true, religion: true },
      }),
    ])

    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 })

    // sajuResult는 본인 리포트라 타인에게 원본 그대로 내려주지 않고, 궁합 섹션 계산에만 사용한다.
    const { sajuResult: candidateSajuResult, ...publicUser } = user

    let compat = null
    if (me?.sajuResult && candidateSajuResult) {
      try {
        compat = buildCompatibilitySection({
          userReport: JSON.parse(me.sajuResult) as SajuReport,
          candidateReport: JSON.parse(candidateSajuResult) as SajuReport,
          candidateNickname: user.nickname || user.name || "",
          userLifestyle: {
            datingPurpose: me.datingPurpose,
            politics: me.politics,
            drinking: me.drinking,
            smoking: me.smoking,
            religion: me.religion,
          },
          candidateLifestyle: {
            datingPurpose: user.datingPurpose,
            politics: user.politics,
            drinking: user.drinking,
            smoking: user.smoking,
            religion: user.religion,
          },
        })
      } catch (err) {
        console.error("[api/users/:id] compat 계산 실패:", err)
      }
    }

    return NextResponse.json({ ...publicUser, likedByMe: !!like, hasConversation: !!conversation, compat })
  } catch (err) {
    console.error("[api/users/:id] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
