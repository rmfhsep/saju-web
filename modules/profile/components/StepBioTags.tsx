"use client"

import { useEffect, useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 1L13 13M13 1L1 13" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#d9d9d9" />
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/[0.74] text-white text-[14px] font-medium px-6 py-3 rounded-[6px] whitespace-nowrap z-20 tracking-[-0.14px]">
      {message}
    </div>
  )
}

export default function StepBioTags({ data, onChange, onNext, onBack, step }: StepProps) {
  const [customInput, setCustomInput] = useState("")
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])

  useEffect(() => {
    const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""
    if (!phone) return
    fetch("/api/profile/suggest-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        datingPurpose: data.datingPurpose,
        politics: data.politics,
        drinking: data.drinking,
        smoking: data.smoking,
      }),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((suggestion: { love: string[]; life: string[] } | null) => {
        if (suggestion) setSuggestedTags([...suggestion.love, ...suggestion.life])
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const userTags = data.bioTags.filter(t => !suggestedTags.includes(t))
  const allTags = [...suggestedTags, ...userTags]

  function flashToast(message: string) {
    setToastMsg(message)
    setTimeout(() => setToastMsg(null), 2000)
  }

  function toggleTag(tag: string) {
    const sel = data.bioTags.includes(tag)
    if (!sel && data.bioTags.length >= 3) {
      flashToast("태그는 최대 3개까지 선택할 수 있어요.")
      return
    }
    onChange({ bioTags: sel ? data.bioTags.filter(t => t !== tag) : [...data.bioTags, tag] })
  }

  function addCustom() {
    const t = customInput.trim()
    if (!t) return
    if (data.bioTags.length >= 3) {
      flashToast("직접 입력한 태그는 최대 3개까지 추가할 수 있어요.")
      return
    }
    onChange({ bioTags: [...data.bioTags, t] })
    setCustomInput("")
  }

  function removeCustomTag(tag: string) {
    onChange({ bioTags: data.bioTags.filter(t => t !== tag) })
  }

  function closeCustomModal() {
    setShowCustomModal(false)
    setCustomInput("")
  }

  async function handleNext() {
    const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""
    if (phone) {
      await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      }).catch(() => {})
    }
    onNext()
  }

  return (
    <Screen className="relative">
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-9 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
            자기소개를 작성을 위해<br />태그를 선택해주세요.
          </h1>
          <p className="text-[15px] text-[#777] leading-relaxed tracking-[-0.3px]">
            입력한 출생 정보를 분석해 나의 연애 성향을 기반으로<br />
            자동 생성된 태그예요. 원하는 태그를 3개 선택하고 <br />
            나에 대한 소개를 더 상세하게 작성해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-medium text-[#1a75ff]">3개 선택 필수</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => {
                const sel = data.bioTags.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`h-9 px-4 rounded-[4px] text-[13px] font-medium transition-colors flex items-center ${
                      sel ? "bg-[#e9f1ff] border border-[#b6d0ff] text-[#1f1f1f]" : "bg-[#f7f7f8] text-[#777]"
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="h-9 px-4 rounded-[4px] bg-[#f4f4f5] text-[13px] font-medium text-[#1f1f1f] w-fit flex items-center"
          >
            태그 직접 입력
          </button>
        </div>
      </div>

      {toastMsg && !showCustomModal && <Toast message={toastMsg} />}

      <PageFooter>
        <CtaButton disabled={data.bioTags.length !== 3} onClick={handleNext}>자기 소개 작성하기</CtaButton>
      </PageFooter>

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ height: "var(--app-height, 100dvh)" }}>
          <div className="h-[52px] flex items-center gap-3 px-5 shrink-0">
            <button onClick={closeCustomModal} className="w-6 h-6 flex items-center justify-center">
              <CloseIcon />
            </button>
            <h2 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">태그 직접 입력</h2>
          </div>

          <div className="flex-1 px-5 pt-5 flex flex-col gap-9 scroll-area overflow-y-auto">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
                placeholder="입력 후 엔터를 누르세요."
                autoFocus
                className="h-[48px] border border-[#dbdcdf] rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#1a75ff] tracking-[-0.32px]"
              />
              <p className="text-[12px] text-[#777]">최대 3개</p>
            </div>

            {userTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {userTags.map(tag => (
                  <span key={tag} className="h-9 pl-4 pr-3 rounded-[4px] bg-[#f7f7f8] text-[13px] font-medium text-[#777] flex items-center gap-1.5">
                    {tag}
                    <button onClick={() => removeCustomTag(tag)} className="w-4 h-4 flex items-center justify-center">
                      <DeleteIcon />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {toastMsg && <Toast message={toastMsg} />}

          <PageFooter>
            <CtaButton disabled={userTags.length === 0} onClick={closeCustomModal}>추가</CtaButton>
          </PageFooter>
        </div>
      )}
    </Screen>
  )
}
