import { prisma } from "@/lib/db"

/** 두 유저 사이에 어느 한쪽이라도 차단했는지 양방향으로 확인한다. */
export async function isBlockedEitherWay(userId: number, otherUserId: number): Promise<boolean> {
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId },
      ],
    },
    select: { id: true },
  })
  return !!block
}

/** 특정 유저를 차단한 적이 있거나(내가 차단) 나를 차단한(상대가 차단) 유저 id 전체 — 추천 풀 제외용. */
export async function getBlockedUserIds(userId: number): Promise<number[]> {
  const blocks = await prisma.userBlock.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  })
  const ids = new Set<number>()
  for (const b of blocks) {
    ids.add(b.blockerId === userId ? b.blockedId : b.blockerId)
  }
  return [...ids]
}

export async function createBlock(blockerId: number, blockedId: number) {
  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    create: { blockerId, blockedId },
    update: {},
  })
}

export async function createReport(reporterId: number, reportedId: number, reason: string, detail?: string) {
  await prisma.report.create({ data: { reporterId, reportedId, reason, detail } })
}
