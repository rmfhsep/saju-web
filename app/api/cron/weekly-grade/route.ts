import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAuthorizedCronRequest } from "@/lib/cron"
import { computeGradeScore, classifyGrades } from "@/lib/pool/grade"

export const maxDuration = 60

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * matching_pool_spec § 5-2 — 주간 등급 갱신. responseRate(받은 좋아요 대비 응답)와
 * activityBonus(최근 7일 행동 수/7)로 gradeScore를 계산하고, § 5-1/5-2 기준으로 grade를 매긴다.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const since = new Date(Date.now() - SEVEN_DAYS_MS)

  const [users, allLikes, allMessages, recentLikes, recentMessages] = await Promise.all([
    prisma.user.findMany({ where: { profileComplete: true }, select: { id: true, createdAt: true } }),
    prisma.like.findMany({ select: { fromUserId: true, toUserId: true } }),
    prisma.message.findMany({ select: { fromUserId: true, toUserId: true } }),
    prisma.like.findMany({ where: { createdAt: { gte: since } }, select: { fromUserId: true } }),
    prisma.message.findMany({ where: { createdAt: { gte: since } }, select: { fromUserId: true } }),
  ])

  const likePairs = new Set(allLikes.map(l => `${l.fromUserId}>${l.toUserId}`))
  const conversationPartners = new Map<number, Set<number>>()
  for (const m of allMessages) {
    for (const [a, b] of [[m.fromUserId, m.toUserId], [m.toUserId, m.fromUserId]] as const) {
      if (!conversationPartners.has(a)) conversationPartners.set(a, new Set())
      conversationPartners.get(a)!.add(b)
    }
  }

  const receivedLikesByUser = new Map<number, number[]>()
  for (const l of allLikes) {
    if (!receivedLikesByUser.has(l.toUserId)) receivedLikesByUser.set(l.toUserId, [])
    receivedLikesByUser.get(l.toUserId)!.push(l.fromUserId)
  }

  const recentActionCount = new Map<number, number>()
  for (const l of recentLikes) recentActionCount.set(l.fromUserId, (recentActionCount.get(l.fromUserId) ?? 0) + 1)
  for (const m of recentMessages) recentActionCount.set(m.fromUserId, (recentActionCount.get(m.fromUserId) ?? 0) + 1)

  const gradeInputs = users.map(u => {
    const receivedFrom = receivedLikesByUser.get(u.id) ?? []
    const respondedCount = receivedFrom.filter(
      likerId => likePairs.has(`${u.id}>${likerId}`) || conversationPartners.get(u.id)?.has(likerId),
    ).length
    const responseRate = receivedFrom.length > 0 ? respondedCount / receivedFrom.length : 0
    const activityBonus = (recentActionCount.get(u.id) ?? 0) / 7

    return { id: u.id, createdAt: u.createdAt, gradeScore: computeGradeScore(responseRate, activityBonus) }
  })

  const results = classifyGrades(gradeInputs)

  for (const r of results) {
    await prisma.user.update({ where: { id: r.id }, data: { grade: r.grade, gradeScore: r.gradeScore } })
  }

  const counts = { gold: 0, silver: 0, newbie: 0 }
  results.forEach(r => counts[r.grade]++)

  return NextResponse.json({ ok: true, totalUsers: results.length, counts })
}
