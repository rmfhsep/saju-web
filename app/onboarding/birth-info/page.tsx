"use client"

import { useState } from "react"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"

export default function BirthInfoPage() {
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [unknownTime, setUnknownTime] = useState(false)

  const canProceed = name.trim().length > 0

  function handleNext() {
    if (!canProceed) return
    bridgeNavigate("SajuResult", { name: name.trim(), bd: birthDate })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="h-[54px] flex items-center px-4">
        <button
          onClick={() => bridgeBack()}
          className="w-[30px] h-[30px] flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
        >
          ‹
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-6 flex flex-col gap-12 overflow-y-auto">
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-bold text-[#0f0f10] leading-[1.3]">
            정확한 사주 분석을 위해<br />출생 정보를 알려주세요.
          </h1>
          <p className="text-[15px] text-[#0f0f10] leading-normal">
            입력하신 정보는 매칭 알고리즘에만 사용됩니다.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* 이름 */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-semibold text-[#0f0f10]">이름</label>
            <input
              type="text"
              placeholder="한혜민"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#999] outline-none focus:border-[#0f0f10] bg-white"
            />
          </div>

          {/* 생년월일 */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-semibold text-[#0f0f10]">생년월일</label>
            <input
              type="text"
              placeholder="1998.02.21"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#999] outline-none focus:border-[#0f0f10] bg-white"
            />
          </div>

          {/* 태어난 시간 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-semibold text-[#0f0f10]">태어난 시간</label>
              <input
                type="text"
                placeholder="오전 9:30"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                disabled={unknownTime}
                className="h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#999] outline-none focus:border-[#0f0f10] bg-white disabled:bg-[#f7f7f8]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setUnknownTime(!unknownTime)}
                className={`w-4 h-4 border rounded-[2px] flex items-center justify-center shrink-0 cursor-pointer ${
                  unknownTime ? "bg-[#0f0f10] border-[#0f0f10]" : "border-[#d8d8d8]"
                }`}
              >
                {unknownTime && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[15px] text-[#999]">모름</span>
            </label>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-8 pt-4">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full h-[48px] bg-[#aecbff] rounded-[4px] text-[16px] font-semibold text-[#0f0f10] transition-opacity ${
            !canProceed ? "opacity-50" : "active:opacity-80"
          }`}
        >
          내 사주 분석하기
        </button>
      </div>
    </div>
  )
}
