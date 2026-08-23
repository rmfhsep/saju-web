import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/** 내 별 충전/사용 내역 — 최신순. */
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
    const transactions = await prisma.starTransaction.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      select: { type: true, amount: true, reason: true, balanceAfter: true, createdAt: true },
    })
    return NextResponse.json({ transactions })
  } catch (err) {
    console.error("[api/stars/history GET] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
