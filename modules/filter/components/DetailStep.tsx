"use client"

import { useEffect } from "react"
import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import RadioOption from "@/components/ui/radio-option"
import {
  SMOKING_OPTIONS, DRINKING_OPTIONS, POLITICS_OPTIONS, RELIGION_OPTIONS,
} from "@/modules/profile/constants"
import HeightRangeSlider from "./HeightRangeSlider"
import type { FilterCategory, FilterData } from "../types"

const TITLES: Record<FilterCategory, string> = {
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

interface Props {
  category: FilterCategory
  data: FilterData
  heightMin: number
  heightMax: number
  onChange: (d: Partial<FilterData>) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

export default function DetailStep({ category, data, heightMin, heightMax, onChange, onSubmit, onBack, submitting }: Props) {
  useEffect(() => {
    if (category !== "height" && !data[category]) {
      onChange({ [category]: OPTIONS[category][0] } as Partial<FilterData>)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  return (
    <Screen>
      <div className="h-[54px] flex items-center px-5">
        <BackButton onClick={onBack} />
      </div>
      <div className="flex-1 px-5 pt-6 flex flex-col gap-8 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">{TITLES[category]}</h1>

        {category === "height" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#1f1f1f]">범위 설정</span>
              <span className="text-[14px] text-[#1a73e8] font-semibold">
                {data.heightMin}~{data.heightMax >= heightMax ? `${heightMax}+` : data.heightMax}cm
              </span>
            </div>
            <HeightRangeSlider
              min={heightMin}
              max={heightMax}
              valueMin={data.heightMin}
              valueMax={data.heightMax}
              onChange={(min, max) => onChange({ heightMin: min, heightMax: max })}
            />
            <div className="flex items-center justify-between text-[13px] text-[#9e9e9e]">
              <span>{heightMin}cm</span>
              <span>{heightMax}+cm</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {OPTIONS[category].map(opt => (
              <RadioOption
                key={opt}
                label={opt}
                selected={data[category] === opt}
                onClick={() => onChange({ [category]: opt } as Partial<FilterData>)}
              />
            ))}
          </div>
        )}
      </div>
      <PageFooter>
        <CtaButton loading={submitting} onClick={onSubmit}>
          {submitting ? "적용 중..." : "필터 적용"}
        </CtaButton>
      </PageFooter>
    </Screen>
  )
}
