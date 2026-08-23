import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/** 내가 가장 최근에 시도한 결제 상태 조회 — PayApp returnurl로 돌아온 결과 페이지의 폴링용. */
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

  const payment = await prisma.payment.findFirst({
    where: { userId: payload.userId },
    orderBy: { createdAt: "desc" },
  })
  if (!payment) return NextResponse.json({ error: "no payment" }, { status: 404 })

  return NextResponse.json({
    mulNo: payment.mulNo,
    state: payment.state,
    goodname: payment.goodname,
    price: payment.price,
    starCount: payment.var1 ? Number(payment.var1) : null,
  })
}
