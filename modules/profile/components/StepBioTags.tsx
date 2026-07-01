"use client"

import { useEffect, useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import { DEFAULT_TAGS } from "../constants"
import type { StepProps } from "../types"

export default function StepBioTags({ data, onChange, onNext, onBack, step }: StepProps) {
  const [customInput, setCustomInput] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [toast, setToast] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState<string[]>(DEFAULT_TAGS)

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

  function toggleTag(tag: string) {
    const sel = data.bioTags.includes(tag)
    if (!sel && data.bioTags.length >= 3) {
      setToast(true); setTimeout(() => setToast(false), 2000); return
    }
    onChange({ bioTags: sel ? data.bioTags.filter(t => t !== tag) : [...data.bioTags, tag] })
  }

  function addCustom() {
    const t = customInput.trim()
    if (!t) return
    if (data.bioTags.length >= 3) { setToast(true); setTimeout(() => setToast(false), 2000); return }
    onChange({ bioTags: [...data.bioTags, t] })
    setCustomInput(""); setShowCustom(false)
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
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">자기소개를 작성을 위해<br />태그를 선택해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b] leading-relaxed">
            입력한 출생 정보를 분석해 나의 연애 성향을 기반으로 자동 생성된 태그예요. 원하는 태그를 3개 선택하고 나에 대한 소개를 더 상세하게 작성해주세요.
          </p>
          <p className="mt-2 text-[13px] font-semibold text-[#1a73e8]">3개 선택 필수</p>
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {allTags.map(tag => {
            const sel = data.bioTags.includes(tag)
            return (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`px-4 h-[36px] rounded-full border text-[14px] font-medium transition-colors flex items-center ${
                  sel ? "bg-[#0f0f10] border-[#0f0f10] text-white" : "bg-white border-[#d0d0d0] text-[#0f0f10]"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
        {showCustom ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="태그를 입력하세요"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustom()}
              autoFocus
              className="flex-1 h-[44px] border border-[#d8d8d8] rounded-[8px] px-3 text-[15px] outline-none focus:border-[#1a73e8]"
            />
            <button onClick={addCustom} className="px-4 h-[44px] bg-[#0f0f10] text-white rounded-[8px] text-[14px] font-semibold">추가</button>
          </div>
        ) : (
          <button onClick={() => setShowCustom(true)} className="px-4 h-[36px] rounded-full border border-[#d0d0d0] text-[14px] font-medium text-[#0f0f10] w-fit flex items-center">
            태그 직접 입력
          </button>
        )}
      </div>
      {toast && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-[#0f0f10]/90 text-white text-[13px] px-4 py-2 rounded-full whitespace-nowrap z-20">
          태그는 최대 3개까지 선택할 수 있어요.
        </div>
      )}
      <PageFooter>
        <CtaButton disabled={data.bioTags.length !== 3} onClick={handleNext}>자기 소개 작성하기</CtaButton>
      </PageFooter>
    </Screen>
  )
}
