import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
    const [user, like, conversation] = await Promise.all([
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
    ])

    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 })

    return NextResponse.json({ ...user, likedByMe: !!like, hasConversation: !!conversation })
  } catch (err) {
    console.error("[api/users/:id] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
