"use client"

import { useState } from "react"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"

const TOTAL_STEPS = 10

// Step 2 (직업) is from Figma (node 59:2369).
// Steps 1, 3–10 are placeholders — replace with actual Figma designs once available.
const STEPS: { question: string; placeholder: string }[] = [
  { question: "닉네임을 알려주세요.",           placeholder: "닉네임 입력" },
  { question: "직업을 알려주세요.",             placeholder: "직업 검색" },
  { question: "키를 알려주세요.",               placeholder: "예) 168" },
  { question: "사는 지역을 알려주세요.",         placeholder: "예) 서울 강남구" },
  { question: "음주 여부를 알려주세요.",         placeholder: "예) 가끔 마심" },
  { question: "흡연 여부를 알려주세요.",         placeholder: "예) 비흡연" },
  { question: "종교를 알려주세요.",             placeholder: "예) 무교" },
  { question: "관심사를 알려주세요.",           placeholder: "예) 독서, 영화, 요리" },
  { question: "연애 스타일을 알려주세요.",       placeholder: "예) 다정하고 배려하는" },
  { question: "프로필 사진을 업로드해 주세요.", placeholder: "" },
]

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1) // 1-indexed
  const [values, setValues] = useState<string[]>(Array(TOTAL_STEPS).fill(""))
  const [searchQuery, setSearchQuery] = useState("")

  const current = STEPS[step - 1]
  const isJobStep = step === 2
  const isPhotoStep = step === TOTAL_STEPS

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      setSearchQuery("")
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding_complete", "true")
      }
      bridgeNavigate("Home")
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1)
    } else {
      bridgeBack()
    }
  }

  function setStepValue(val: string) {
    setValues((prev) => { const n = [...prev]; n[step - 1] = val; return n })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="h-[54px] flex items-center px-4">
        <button
          onClick={handleBack}
          className="w-[30px] h-[30px] flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
        >
          ‹
        </button>
        <h2 className="flex-1 text-center text-[18px] font-semibold text-[#0f0f10]">프로필 설정</h2>
        <div className="w-[30px]" />
      </div>

      {/* Progress bar — only the current step is filled */}
      <div className="flex gap-1 px-4">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-[1px] transition-colors"
            style={{ backgroundColor: i + 1 === step ? "#0f0f10" : "#f1f1f1" }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-8 flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-[#0f0f10] leading-[1.3]">{current.question}</h1>

        {isJobStep ? (
          <div className="flex flex-col gap-3">
            {/* Search field with icon */}
            <div className="flex items-center gap-2 h-[48px] bg-[#f7f7f8] rounded-[8px] px-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder={current.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[15px] text-[#0f0f10] placeholder:text-[#0f0f10] outline-none"
              />
            </div>
            {/* Selected value row */}
            {values[step - 1] && (
              <div className="h-[48px] bg-[#f7f7f8] rounded-[8px] px-4 flex items-center">
                <span className="text-[15px] text-[#0f0f10]">{values[step - 1]}</span>
              </div>
            )}
            {/* Search result */}
            {searchQuery.length > 0 && (
              <button
                className="h-[48px] bg-[#f7f7f8] rounded-[8px] px-4 flex items-center text-left active:opacity-70"
                onClick={() => { setStepValue(searchQuery); setSearchQuery("") }}
              >
                <span className="text-[15px] text-[#0f0f10]">{searchQuery}</span>
              </button>
            )}
          </div>
        ) : isPhotoStep ? (
          <button className="w-full h-[200px] border-2 border-dashed border-[#d8d8d8] rounded-[8px] flex flex-col items-center justify-center gap-2 text-[#999] active:opacity-70">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="3" y="7" width="26" height="20" rx="3" stroke="#999" strokeWidth="1.5" />
              <circle cx="16" cy="17" r="5" stroke="#999" strokeWidth="1.5" />
              <path d="M11 7l2-4h6l2 4" stroke="#999" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="text-[14px]">사진 추가하기</span>
          </button>
        ) : (
          <input
            type="text"
            placeholder={current.placeholder}
            value={values[step - 1]}
            onChange={(e) => setStepValue(e.target.value)}
            className="h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#999] outline-none focus:border-[#0f0f10] bg-white"
          />
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white px-4 pb-8 pt-3">
        <button
          onClick={handleNext}
          className="w-full h-[48px] bg-[#aecbff] rounded-[4px] text-[16px] font-semibold text-[#0f0f10] active:opacity-80"
        >
          {step < TOTAL_STEPS ? "다음" : "완료"}
        </button>
      </div>
    </div>
  )
}
