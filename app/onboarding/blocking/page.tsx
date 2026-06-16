"use client"

import { useEffect, useState } from "react"
import { bridgeBack, bridgeNavigate, bridgeRequestContacts, onContactsReceived } from "@/lib/bridge"

type Phase = "intro" | "loading" | "done"

export default function BlockingPage() {
  const [phase, setPhase] = useState<Phase>("intro")
  const [blockedCount, setBlockedCount] = useState(0)
  const [showPermModal, setShowPermModal] = useState(false)

  useEffect(() => {
    onContactsReceived(async (phones) => {
      const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""
      try {
        const res = await fetch("/api/blocking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, contactPhones: phones }),
        })
        const data = await res.json()
        setBlockedCount(data.blockedCount ?? phones.length)
      } catch {
        setBlockedCount(phones.length)
      }
      setTimeout(() => setPhase("done"), 500)
    })
  }, [])

  function handleBlock() {
    setPhase("loading")
    bridgeRequestContacts()
    // Fallback for browser (no native): finish after 2 s with 0 contacts
    setTimeout(() => {
      if (typeof window !== "undefined" && !(window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView) {
        setPhase("done")
      }
    }, 2000)
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
          <div className="w-[56px] h-[56px] rounded-full bg-[#aecbff] flex items-center justify-center">
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              <path d="M2 10L9 17L22 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[24px] font-bold text-[#0f0f10]">지인 {blockedCount}명을 차단했어요.</h1>
            <p className="text-[15px] text-[#6b6b6b] leading-relaxed">차단한 지인과는 서로 프로필이 노출되지 않아요.</p>
          </div>
        </div>

        <div className="px-5 pb-10 flex flex-col items-center gap-4">
          <p className="text-[13px] text-[#9e9e9e] text-center">
            언제든 지인을 추가로 차단하거나, 차단을 해제할 수 있어요.
          </p>
          <button
            onClick={() => bridgeNavigate("ProfileSetup")}
            className="w-full h-[52px] bg-[#aecbff] rounded-[8px] text-[16px] font-semibold text-[#0f0f10] active:opacity-80"
          >
            다음
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Header */}
      <div className="h-[54px] flex items-center px-4">
        <button
          onClick={() => bridgeBack()}
          className="w-8 h-8 flex items-center justify-center"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="#0f0f10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="flex-1 text-center text-[17px] font-semibold text-[#0f0f10]">지인 차단하기</span>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-6">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
          프로필을 만들기 전에,<br />연락처에 있는 지인을<br />먼저 차단할까요?
        </h1>
        <p className="mt-4 text-[15px] text-[#6b6b6b] leading-relaxed">
          연락처를 기반으로 지인을 차단할 수 있어요.<br />차단한 상대에게는 프로필이 노출되지 않아요.
        </p>
      </div>

      {/* CTA */}
      <div className="px-5 pb-10 flex gap-3">
        <button
          onClick={() => bridgeNavigate("ProfileSetup")}
          className="flex-1 h-[52px] border border-[#e0e0e0] rounded-[8px] text-[16px] font-semibold text-[#0f0f10] bg-white active:bg-[#f5f5f5]"
        >
          다음에
        </button>
        <button
          onClick={handleBlock}
          className="flex-1 h-[52px] bg-[#aecbff] rounded-[8px] text-[16px] font-semibold text-[#0f0f10] active:opacity-80"
        >
          지인 차단하기
        </button>
      </div>

      {/* Loading overlay */}
      {phase === "loading" && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="relative w-[120px] h-[120px]">
            <svg className="absolute inset-0 animate-spin" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="50" stroke="white" strokeWidth="6" strokeOpacity="0.3"/>
              <path d="M60 10 A50 50 0 0 1 110 60" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[72px] h-[72px] flex items-center justify-center">
                <span className="text-white text-[40px] font-black leading-none">m</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 px-8">
          <div className="bg-white rounded-[16px] p-6 w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-[17px] font-semibold text-[#0f0f10]">연락처 접근 권한이 필요해요.</p>
              <p className="text-[14px] text-[#6b6b6b]">설정에서 권한을 허용해 주세요.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowPermModal(false); bridgeNavigate("ProfileSetup") }}
                className="flex-1 h-[48px] border border-[#e0e0e0] rounded-[8px] text-[15px] font-medium text-[#0f0f10]"
              >
                다음에
              </button>
              <button
                onClick={() => {
                  setShowPermModal(false)
                  if (typeof window !== "undefined") {
                    window.open("app-settings:", "_blank")
                  }
                }}
                className="flex-1 h-[48px] bg-[#aecbff] rounded-[8px] text-[15px] font-semibold text-[#0f0f10]"
              >
                설정으로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
