import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { cancelPayment, PAY_STATE } from "@/lib/payapp"

/**
 * 결제 취소 — 본인 소유의 Payment만 취소 가능.
 * body: { mulNo: string, cancelMemo: string, cancelMode?: "ready", partCancel?: boolean, cancelPrice?: number }
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
    const body = await req.json().catch(() => ({}))
    const mulNo = String(body?.mulNo ?? "")
    const cancelMemo = String(body?.cancelMemo ?? "")
    if (!mulNo || !cancelMemo) {
      return NextResponse.json({ error: "mulNo/cancelMemo required" }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({ where: { mulNo } })
    if (!payment || payment.userId !== payload.userId) {
      return NextResponse.json({ error: "payment not found" }, { status: 404 })
    }

    const result = await cancelPayment({
      mulNo,
      cancelMemo,
      cancelMode: body?.cancelMode,
      partCancel: Boolean(body?.partCancel),
      cancelPrice: body?.cancelPrice,
    })

    if (!result.ok) {
      console.error("[api/payapp/cancel] payapp rejected cancel:", result.errorMessage, result.raw)
      return NextResponse.json({ error: result.errorMessage || "cancel failed" }, { status: 502 })
    }

    // 정확한 최종 상태(9/64 등)는 feedbackurl 콜백이 다시 갱신해줌 — 여기선 취소요청 표시만 즉시 반영.
    await prisma.payment.update({
      where: { mulNo },
      data: { cancelMemo, state: PAY_STATE.CANCEL_REQUESTED[0] },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/payapp/cancel POST] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
