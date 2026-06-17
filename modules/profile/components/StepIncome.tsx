import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import { INCOME_OPTIONS } from "../constants"
import type { StepProps } from "../types"

function IncomeCell({ opt, selected, onClick }: { opt: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 h-[48px] rounded-[10px] transition-colors text-left ${
        selected ? "bg-[#eef2ff] border border-[#aecbff]" : "bg-[#f5f5f7] border border-transparent"
      }`}
    >
      <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#1a73e8]" : "border-[#ccc]"}`}>
        {selected && <div className="w-[9px] h-[9px] rounded-full bg-[#1a73e8]" />}
      </div>
      <span className={`text-[14px] ${selected ? "font-semibold text-[#0f0f10]" : "text-[#4a4a4a]"}`}>{opt}</span>
    </button>
  )
}

export default function StepIncome({ data, onChange, onNext, onBack, step }: StepProps) {
  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">연봉을 알려주세요.</h1>
          <p className="mt-1 text-[13px] text-[#e53935]">연봉 정보는 프로필에 공개되지 않아요.</p>
        </div>
        <div className="grid grid-cols-2 gap-[8px]">
          {INCOME_OPTIONS.slice(0, 8).map(opt => (
            <IncomeCell key={opt} opt={opt} selected={data.income === opt} onClick={() => onChange({ income: opt })} />
          ))}
          <IncomeCell opt={INCOME_OPTIONS[8]} selected={data.income === INCOME_OPTIONS[8]} onClick={() => onChange({ income: INCOME_OPTIONS[8] })} />
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!data.income} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
