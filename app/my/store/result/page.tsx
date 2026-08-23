"use client"

import { useEffect, useRef, useState } from "react"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import CtaButton from "@/components/ui/cta-button"
import StarIcon from "@/components/ui/star-icon"

const PAY_STATE_COMPLETED = 4
const PAY_STATE_CANCEL = [8, 9, 32, 64]

const POLL_INTERVAL_MS = 1500
const MAX_POLLS = 8 // 약 12초까지 feedbackurl 콜백 도착을 기다린다

type PurchaseStatus = {
  state: number
  goodname: string
  price: number
  starCount: number | null
}

type ViewState = "checking" | "success" | "cancelled" | "timeout" | "not_found"

export default function ResultPage() {
  const router = useAppRouter()
  const [status, setStatus] = useState<PurchaseStatus | null>(null)
  const [view, setView] = useState<ViewState>("checking")
  const pollCountRef = useRef(0)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      setView("not_found")
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    // PayApp returnurl에는 별도 식별자가 안 실려오므로, 로그인한 유저의 가장 최근 결제
    // 요청을 확인한다 — 한 번에 하나씩만 결제 요청이 진행되는 흐름이라 이걸로 충분하다.
    async function check() {
      try {
        const res = await fetch("/api/stars/purchase/latest", { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          if (!cancelled) setView("not_found")
          return
        }
        const data: PurchaseStatus = await res.json()
        if (cancelled) return
        setStatus(data)

        if (data.state === PAY_STATE_COMPLETED) {
          setView("success")
          return
        }
        if (PAY_STATE_CANCEL.includes(data.state)) {
          setView("cancelled")
          return
        }

        // 아직 요청(1) 상태 — feedbackurl 콜백이 아직 안 왔을 수 있으니 잠시 재시도
        pollCountRef.current += 1
        if (pollCountRef.current >= MAX_POLLS) {
          setView("timeout")
          return
        }
        timer = setTimeout(check, POLL_INTERVAL_MS)
      } catch {
        if (!cancelled) setView("timeout")
      }
    }

    check()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  function goToStore() {
    router.replace("/my/store")
  }

  return (
    <Screen>
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6 text-center">
        {view === "checking" && (
          <>
            <div className="w-10 h-10 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-[16px] font-medium text-[#1f1f1f]">결제 확인 중이에요...</p>
          </>
        )}

        {view === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#fff5e5] flex items-center justify-center">
              <StarIcon size={32} color="#FFA100" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[18px] font-bold text-[#1f1f1f]">
                별 {status?.starCount ?? ""}개가 충전됐어요.
              </p>
              <p className="text-[14px] text-[#777]">{status?.goodname} 결제가 완료됐습니다.</p>
            </div>
            <CtaButton onClick={goToStore} className="w-full max-w-[280px]">확인</CtaButton>
          </>
        )}

        {view === "cancelled" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <span className="text-[28px]">✕</span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[18px] font-bold text-[#1f1f1f]">결제가 완료되지 않았어요.</p>
              <p className="text-[14px] text-[#777]">결제가 취소됐거나 중단됐어요. 다시 시도해주세요.</p>
            </div>
            <CtaButton onClick={goToStore} className="w-full max-w-[280px]">스토어로 돌아가기</CtaButton>
          </>
        )}

        {view === "timeout" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <span className="text-[28px]">⏳</span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[18px] font-bold text-[#1f1f1f]">결제 확인이 지연되고 있어요.</p>
              <p className="text-[14px] text-[#777]">결제가 정상 처리됐다면 잠시 후 이용내역에서 확인하실 수 있어요.</p>
            </div>
            <CtaButton onClick={goToStore} className="w-full max-w-[280px]">스토어로 돌아가기</CtaButton>
          </>
        )}

        {view === "not_found" && (
          <>
            <p className="text-[16px] font-medium text-[#1f1f1f]">결제 정보를 찾을 수 없어요.</p>
            <CtaButton onClick={goToStore} className="w-full max-w-[280px]">스토어로 돌아가기</CtaButton>
          </>
        )}
      </div>
    </Screen>
  )
}
