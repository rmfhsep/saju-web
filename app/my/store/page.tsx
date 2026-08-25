"use client"

import { useState } from "react"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import StarIcon from "@/components/ui/star-icon"
import { STAR_PACKAGES, formatWon } from "@/lib/store"
import { useMe } from "@/lib/queries/useMe"

const TERMS_URL = "https://maju.app/terms"

export default function StorePage() {
  const router = useAppRouter()
  const [toast, setToast] = useState<string | null>(null)
  const meQuery = useMe()
  const stars = meQuery.data?.stars ?? 0
  const starsLoading = meQuery.isLoading
  const [purchasingCount, setPurchasingCount] = useState<number | null>(null)

  async function handlePurchase(count: number) {
    if (purchasingCount) return
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      setToast("로그인이 필요해요.")
      setTimeout(() => setToast(null), 1800)
      return
    }

    setPurchasingCount(count)
    try {
      const res = await fetch("/api/stars/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ starCount: count }),
      })
      const data = await res.json()
      if (!res.ok || !data.payurl) {
        setToast(data?.error || "결제 요청에 실패했어요.")
        setTimeout(() => setToast(null), 1800)
        return
      }
      window.location.href = data.payurl
    } catch {
      setToast("결제 요청에 실패했어요.")
      setTimeout(() => setToast(null), 1800)
    } finally {
      setPurchasingCount(null)
    }
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
            {starsLoading ? (
              <span className="h-[24px] w-[40px] rounded-[4px] bg-black/10 animate-pulse" />
            ) : (
              <span className="text-[24px] font-bold text-[#1f1f1f] tracking-[-0.48px]">{stars}</span>
            )}
          </button>

          {/* 패키지 목록 */}
          <div className="flex flex-col gap-3">
            {STAR_PACKAGES.map(pkg => (
              <button
                key={pkg.count}
                onClick={() => handlePurchase(pkg.count)}
                disabled={purchasingCount !== null}
                className="w-full bg-white rounded-[8px] px-4 py-5 flex items-center justify-between shadow-[0px_2px_6px_rgba(0,0,0,0.08)] active:opacity-90 disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  <StarIcon size={20} color="#FFA100" />
                  <span className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">{pkg.count}개</span>
                </div>
                <span className="text-[16px] font-bold text-[#ff9f00] tracking-[-0.32px]">
                  {purchasingCount === pkg.count ? "요청 중..." : formatWon(pkg.price)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 이용 안내 (풀 블리드 회색 영역) */}
        <div className="mt-10 bg-[#f4f4f5] px-5 pt-5 pb-9 flex flex-col gap-2">
          <p className="text-[12px] font-semibold text-[#1f1f1f] leading-[1.4]">이용 안내</p>
          <ul className="flex flex-col gap-2 text-[12px] font-normal text-[#777] leading-[1.4] list-disc pl-[18px]">
            <li>별은 좋아요, 쪽지 보내기, 인연 추천 등 마주의 기능을 이용할 때 사용할 수 있습니다.</li>
            <li>
              구매한 별은 결제 즉시 지급되며, 발행일로부터 5년간 유효합니다. (이벤트·미션으로 무료 지급된 별은 지급일로부터 7일간만
              사용할 수 있습니다.)
            </li>
            <li>보낸 쪽지를 상대가 3일간 확인하지 않으면 사용한 별을 100% 환급해 드립니다. 단, 상대가 쪽지를 확인한 이후에는 환급되지 않습니다.</li>
            <li>결제는 App Store를 통해 이루어지며, 환불은 Apple 환불 정책에 따라 처리됩니다.</li>
            <li>
              자세한 내용은{" "}
              <button type="button" onClick={() => { window.location.href = TERMS_URL }} className="underline">
                이용약관
              </button>
              을 확인해주세요.
            </li>
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
