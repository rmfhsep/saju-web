import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

export default function StepHeight({ data, onChange, onNext, onBack, step }: StepProps) {
  const valid = /^\d{3}$/.test(data.height) && +data.height >= 100 && +data.height <= 250

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-8 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">키를 알려주세요.</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="숫자만 입력해주세요."
            value={data.height}
            onChange={e => onChange({ height: e.target.value.replace(/\D/g, "").slice(0, 3) })}
            className="w-[295px] h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#b7b7b7] outline-none focus:border-[#1a73e8] bg-white"
          />
          <span className="text-[15px] font-medium text-[#0f0f10]">cm</span>
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!valid} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
