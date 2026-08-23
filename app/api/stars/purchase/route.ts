import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { requestPayment, PAY_STATE } from "@/lib/payapp"
import { STAR_PACKAGES } from "@/lib/store"

/**
 * 별 충전 결제 요청 — 클라이언트가 보낸 가격은 신뢰하지 않고 STAR_PACKAGES로 서버에서 다시 검증한다.
 * body: { starCount: number }
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
    const starCount = Number(body?.starCount)
    const pkg = STAR_PACKAGES.find(p => p.count === starCount)
    if (!pkg) return NextResponse.json({ error: "invalid package" }, { status: 400 })

    const goodname = `별 ${pkg.count}개`
    const result = await requestPayment({
      goodname,
      price: pkg.price,
      recvphone: payload.phone,
      smsuse: "n",
      returnurl: `${req.nextUrl.origin}/my/store/result`,
      var1: String(pkg.count),
    })

    if (!result.ok) {
      console.error("[api/stars/purchase] payapp rejected request:", result.errorMessage, result.raw)
      return NextResponse.json({ error: result.errorMessage || "payapp request failed" }, { status: 502 })
    }

    await prisma.payment.create({
      data: {
        userId: payload.userId,
        mulNo: result.mulNo,
        goodname,
        price: pkg.price,
        state: PAY_STATE.REQUESTED,
        payurl: result.payurl,
        qrurl: result.qrurl,
        var1: String(pkg.count),
      },
    })

    return NextResponse.json({ ok: true, mulNo: result.mulNo, payurl: result.payurl, qrurl: result.qrurl })
  } catch (err) {
    console.error("[api/stars/purchase POST] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
