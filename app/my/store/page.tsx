"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import StarIcon from "@/components/ui/star-icon"
import { STAR_PACKAGES, formatWon } from "@/lib/store"

export default function StorePage() {
  const router = useRouter()
  const [toast, setToast] = useState<string | null>(null)
  const [stars, setStars] = useState(0)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(u => { if (u) setStars(u.stars ?? 0) })
      .catch(() => {})
  }, [])

  function handlePurchase(count: number) {
    // 실제 결제 연동 전까지는 안내 토스트만 표시
    setToast(`별 ${count}개 구매는 준비 중이에요.`)
    setTimeout(() => setToast(null), 1800)
  }

  return (
    <Screen className="relative">
      <EditHeader title="스토어" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto">
        <div className="px-5 pt-2 flex flex-col gap-10">
          {/* 보유 별 → 이용 내역 */}
          <button
            onClick={() => router.push("/my/store/history")}
            className="w-full bg-[#fff5e5] rounded-[8px] h-[66px] px-5 flex items-center justify-between active:opacity-90"
          >
            <div className="flex items-center gap-2">
              <StarIcon size={24} color="#FFA100" />
              <span className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">보유 별</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3.5L10.5 8L6 12.5" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[24px] font-bold text-[#1f1f1f] tracking-[-0.48px]">{stars}</span>
          </button>

          {/* 패키지 목록 */}
          <div className="flex flex-col gap-3">
            {STAR_PACKAGES.map(pkg => (
              <button
                key={pkg.count}
                onClick={() => handlePurchase(pkg.count)}
                className="w-full bg-white rounded-[8px] px-4 py-5 flex items-center justify-between shadow-[0px_2px_6px_rgba(0,0,0,0.08)] active:opacity-90"
              >
                <div className="flex items-center gap-2">
                  <StarIcon size={20} color="#FFA100" />
                  <span className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">{pkg.count}개</span>
                </div>
                <span className="text-[16px] font-bold text-[#ff9f00] tracking-[-0.32px]">{formatWon(pkg.price)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 이용 안내 (풀 블리드 회색 영역) */}
        <div className="mt-10 bg-[#f4f4f5] px-5 py-5 flex flex-col gap-2">
          <p className="text-[12px] font-semibold text-[#1f1f1f] leading-[1.4]">이용 안내</p>
          <ul className="flex flex-col gap-2 text-[12px] font-normal text-[#777] leading-[1.4] list-disc pl-[18px]">
            <li>별은 좋아요, 쪽지 보내기, 인연 추천 등 마주의 기능을 이용할 때 사용할 수 있습니다.</li>
            <li>별은 구매 즉시 지급되며 유효기간은 없습니다.</li>
            <li>결제는 App Store를 통해 이루어지며, 환불은 Apple 환불 정책에 따라 처리됩니다.</li>
          </ul>
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[52px] z-50 px-5 py-3 bg-[#333]/90 text-white text-[13px] rounded-[8px] whitespace-nowrap">
          {toast}
        </div>
      )}
    </Screen>
  )
}
