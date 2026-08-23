import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyFeedback, isCompleted } from "@/lib/payapp"
import { addStars } from "@/lib/stars"

/**
 * PayApp이 결제 상태 변경 시(요청/완료/취소) 서버 대 서버로 호출하는 콜백.
 * 반드시 HTTP 200 + 본문 "SUCCESS"로 응답해야 재시도가 멈춘다.
 * PAYAPP_FEEDBACK_URL 환경변수에 이 라우트의 절대 URL을 설정해 결제 요청 시 전달해야 한다.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const fields: Record<string, string> = {}
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") fields[key] = value
    }

    const feedback = verifyFeedback(fields)
    if (!feedback) {
      console.error("[api/payapp/feedback] linkkey/linkval mismatch — 위조된 콜백 의심:", fields)
      return new NextResponse("FAIL", { status: 403 })
    }

    const parsedDate = feedback.payDate ? new Date(feedback.payDate.replace(" ", "T")) : null
    const payDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined

    await prisma.$transaction(async tx => {
      const updated = await tx.payment
        .update({ where: { mulNo: feedback.mulNo }, data: { state: feedback.state, payDate } })
        .catch(() => null)
      if (!updated || !isCompleted(feedback.state)) return

      // starsGranted 플래그를 원자적으로 선점 — feedbackurl은 여러 번 재호출될 수 있으므로
      // 이 UPDATE에 걸리는 두 번째 이상의 중복 호출은 count 0이 되어 별을 다시 지급하지 않는다.
      const claimed = await tx.payment.updateMany({
        where: { mulNo: feedback.mulNo, starsGranted: false },
        data: { starsGranted: true },
      })
      if (claimed.count === 0) return

      const starCount = Number(updated.var1)
      if (Number.isFinite(starCount) && starCount > 0) {
        await addStars(tx, { userId: updated.userId, amount: starCount, reason: "스토어 충전", mulNo: feedback.mulNo })
      }
    })

    return new NextResponse("SUCCESS", { status: 200 })
  } catch (err) {
    console.error("[api/payapp/feedback POST] failed:", err)
    return new NextResponse("FAIL", { status: 500 })
  }
}
