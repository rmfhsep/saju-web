import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

export default function StepNickname({ data, onChange, onNext, onBack, step }: StepProps) {
  const max = 12
  const valid = data.nickname.trim().length > 0 && data.nickname.trim().length <= max

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-8 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35] mb-1">닉네임을 입력해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b] leading-relaxed">
            내 프로필에 보일 이름이에요.<br />한글 및 영문으로 작성해주세요.
          </p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] font-semibold text-[#0f0f10]">닉네임</label>
          <div className="relative">
            <input
              type="text"
              placeholder={`${max}자 이하 한글 및 영문으로 입력해주세요.`}
              value={data.nickname}
              onChange={e => onChange({ nickname: e.target.value.slice(0, max) })}
              className="w-full h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[16px] text-[#0f0f10] placeholder:text-[#b7b7b7] outline-none focus:border-[#1a73e8] bg-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#9e9e9e]">
              {data.nickname.length}/{max}
            </span>
          </div>
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!valid} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
