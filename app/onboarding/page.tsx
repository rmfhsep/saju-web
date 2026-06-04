"use client"

import { bridgeNavigate } from "@/lib/bridge"

const LOGO_URL = "/logo.svg"

export default function OnboardingLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center gap-7 px-4">
        <img src={LOGO_URL} alt="logo" width={140} height={140} className="rounded-full" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[24px] font-bold text-[#0f0f10] leading-normal">나만의 천생연분</h1>
          <p className="text-[15px] text-[#0f0f10] leading-normal">
            명리학 빅데이터를 기반으로<br />
            가장 조화로운 인연을 연결해 드립니다.
          </p>
        </div>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => bridgeNavigate("BirthInfo")}
          className="w-full h-[48px] bg-[#aecbff] rounded-[4px] text-[16px] font-semibold text-[#0f0f10] active:opacity-80"
        >
          내 인연 찾기
        </button>
      </div>
    </div>
  )
}
