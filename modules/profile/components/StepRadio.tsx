"use client"

import { useEffect } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import RadioOption from "@/components/ui/radio-option"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

interface Props extends Omit<StepProps, "data" | "onChange"> {
  title: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

export default function StepRadio({ title, options, value, onChange, onNext, onBack, step }: Props) {
  useEffect(() => {
    if (!value && options.length > 0) onChange(options[0])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">{title}</h1>
        <div className="flex flex-col gap-[10px]">
          {options.map(opt => (
            <RadioOption key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
          ))}
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!value} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
