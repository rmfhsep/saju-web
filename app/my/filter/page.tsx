"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import RadioOption from "@/components/ui/radio-option"
import HeightRangeSlider from "@/modules/filter/components/HeightRangeSlider"
import { FILTER_CATEGORIES, HEIGHT_RANGES, defaultHeightRange } from "@/modules/filter/constants"
import {
  SMOKING_OPTIONS, DRINKING_OPTIONS, POLITICS_OPTIONS, RELIGION_OPTIONS,
} from "@/modules/profile/constants"
import type { FilterCategory } from "@/modules/filter/types"

const LABELS: Record<FilterCategory, string> = {
  height: "키",
  smoking: "흡연 여부",
  drinking: "음주 빈도",
  politics: "정치 성향",
  religion: "종교",
}

const DETAIL_TITLES: Record<FilterCategory, string> = {
  height: "선호하는 키 범위를 설정해주세요.",
  smoking: "선호하는 흡연 여부를 선택해주세요.",
  drinking: "선호하는 음주 빈도를 선택해주세요.",
  politics: "선호하는 정치 성향을 선택해주세요.",
  religion: "선호하는 종교를 선택해주세요.",
}

const OPTIONS: Record<Exclude<FilterCategory, "height">, string[]> = {
  smoking: SMOKING_OPTIONS,
  drinking: DRINKING_OPTIONS,
  politics: POLITICS_OPTIONS,
  religion: RELIGION_OPTIONS,
}

export default function MyFilterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"category" | "detail">("category")
  const [gender, setGender] = useState<string>("MALE")
  const [category, setCategory] = useState<FilterCategory>("height")
  const [value, setValue] = useState<string>("")
  const [heightMin, setHeightMin] = useState<number>(0)
  const [heightMax, setHeightMax] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)

  const range = HEIGHT_RANGES[gender === "FEMALE" ? "FEMALE" : "MALE"]

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(u => {
        if (!u) return
        const g = u.gender === "FEMALE" ? "FEMALE" : "MALE"
        setGender(g)
        const r = HEIGHT_RANGES[g]
        const def = defaultHeightRange(r.min, r.max)
        // 기존 선호 조건 프리셀렉트
        const preset = (u.preferredFilterType as FilterCategory | null) ?? null
        if (preset) setCategory(preset)
        setHeightMin(u.preferredHeightMin ?? def.min)
        setHeightMax(u.preferredHeightMax ?? def.max)
        if (preset && preset !== "height") {
          const v =
            preset === "smoking" ? u.preferredSmoking :
            preset === "drinking" ? u.preferredDrinking :
            preset === "politics" ? u.preferredPolitics :
            preset === "religion" ? u.preferredReligion : null
          if (v) setValue(v)
        }
      })
      .catch(() => {})
  }, [])

  function goDetail() {
    if (category !== "height" && !value) {
      setValue(OPTIONS[category][0])
    }
    setStep("detail")
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    try {
      await fetch("/api/profile/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          type: category,
          heightMin,
          heightMax,
          value: category !== "height" ? value : undefined,
        }),
      })
      router.back()
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "category") {
    return (
      <Screen>
        <div className="h-[54px] flex items-center gap-3 px-5">
          <BackButton onClick={() => router.back()} />
          <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">선호하는 조건 설정</span>
        </div>
        <div className="flex-1 px-5 pt-4 flex flex-col gap-6 scroll-area overflow-y-auto pb-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35] tracking-[-0.56px]">
              이성을 만날 때<br />가장 원하는 조건이 있나요?
            </h1>
            <p className="text-[14px] font-normal text-[#949494] tracking-[-0.14px]">가장 중요한 조건 1개만 선택할 수 있어요.</p>
          </div>
          <div className="flex flex-col gap-[10px]">
            {FILTER_CATEGORIES.map(c => (
              <RadioOption
                key={c.key}
                label={c.label}
                selected={category === c.key}
                onClick={() => setCategory(c.key)}
              />
            ))}
          </div>
        </div>
        <PageFooter>
          <CtaButton onClick={goDetail}>다음</CtaButton>
        </PageFooter>
      </Screen>
    )
  }

  return (
    <Screen>
      <div className="h-[54px] flex items-center gap-3 px-5">
        <BackButton onClick={() => setStep("category")} />
        <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">선호하는 {LABELS[category]}</span>
      </div>
      <div className="flex-1 px-5 pt-4 flex flex-col gap-8 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">{DETAIL_TITLES[category]}</h1>

        {category === "height" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#1f1f1f]">범위 설정</span>
              <span className="text-[14px] font-semibold text-[#1a75ff]">
                {heightMin}~{heightMax >= range.max ? `${range.max}+` : heightMax}cm
              </span>
            </div>
            <HeightRangeSlider
              min={range.min}
              max={range.max}
              valueMin={heightMin}
              valueMax={heightMax}
              onChange={(min, max) => { setHeightMin(min); setHeightMax(max) }}
            />
            <div className="flex items-center justify-between text-[13px] text-[#9e9e9e]">
              <span>{range.min}cm</span>
              <span>{range.max}+cm</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {OPTIONS[category].map(opt => (
              <RadioOption key={opt} label={opt} selected={value === opt} onClick={() => setValue(opt)} />
            ))}
          </div>
        )}
      </div>
      <PageFooter>
        <CtaButton loading={submitting} onClick={handleSubmit}>
          {submitting ? "적용 중..." : "필터 적용"}
        </CtaButton>
      </PageFooter>
    </Screen>
  )
}
