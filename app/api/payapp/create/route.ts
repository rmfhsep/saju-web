import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { requestPayment, PAY_STATE } from "@/lib/payapp"

const MIN_PRICE = 1000

/**
 * 결제 요청 생성 — PayApp 결제창 URL(payurl)을 발급받아 Payment 행을 만든다.
 * body: { goodname: string, price: number, memo?: string, var1?: string, var2?: string, openpaytype?: string, returnurl?: string }
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
    const goodname = String(body?.goodname ?? "").trim()
    const price = Number(body?.price)
    if (!goodname || !Number.isFinite(price) || price < MIN_PRICE) {
      return NextResponse.json({ error: `invalid goodname/price (최소 ${MIN_PRICE}원)` }, { status: 400 })
    }

    const result = await requestPayment({
      goodname,
      price,
      recvphone: payload.phone,
      smsuse: "n",
      memo: body?.memo,
      openpaytype: body?.openpaytype,
      returnurl: body?.returnurl,
      var1: body?.var1,
      var2: body?.var2,
    })

    if (!result.ok) {
      console.error("[api/payapp/create] payapp rejected request:", result.errorMessage, result.raw)
      return NextResponse.json({ error: result.errorMessage || "payapp request failed" }, { status: 502 })
    }

    await prisma.payment.create({
      data: {
        userId: payload.userId,
        mulNo: result.mulNo,
        goodname,
        price,
        state: PAY_STATE.REQUESTED,
        payurl: result.payurl,
        qrurl: result.qrurl,
        var1: body?.var1,
        var2: body?.var2,
      },
    })

    return NextResponse.json({ ok: true, mulNo: result.mulNo, payurl: result.payurl, qrurl: result.qrurl })
  } catch (err) {
    console.error("[api/payapp/create POST] failed:", err)
    return NextResponse.json({ error: "internal error", detail: String(err) }, { status: 500 })
  }
}
