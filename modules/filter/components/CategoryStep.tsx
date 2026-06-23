import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import RadioOption from "@/components/ui/radio-option"
import { FILTER_CATEGORIES } from "../constants"
import type { FilterCategory } from "../types"

interface Props {
  value: FilterCategory | null
  onSelect: (key: FilterCategory) => void
  onNext: () => void
  onBack: () => void
}

export default function CategoryStep({ value, onSelect, onNext, onBack }: Props) {
  return (
    <Screen>
      <div className="h-[54px] flex items-center px-4">
        <BackButton onClick={onBack} />
      </div>
      <div className="flex-1 px-5 pt-6 flex flex-col gap-6 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
            이성을 만날 때<br />가장 원하는 조건이 있나요?
          </h1>
          <p className="mt-2 text-[14px] text-[#777] leading-normal tracking-[-0.3px]">
            가장 중요한 조건 1개만 선택할 수 있어요.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {FILTER_CATEGORIES.map(c => (
            <RadioOption key={c.key} label={c.label} selected={value === c.key} onClick={() => onSelect(c.key)} />
          ))}
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!value} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
