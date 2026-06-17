import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

const MIN = 50
const MAX = 500

export default function StepBio({ data, onChange, onNext, onBack, step }: StepProps) {
  const valid = data.bioTags.every(tag => (data.bio[tag]?.length ?? 0) >= MIN)

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">선택한 태그를 바탕으로<br />나를 더 자세히 소개해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b] leading-relaxed">
            자세히 쓸수록 나와 잘 맞는 사람을 만날 확률이 높아져요.
          </p>
        </div>
        {data.bioTags.map(tag => (
          <div key={tag} className="flex flex-col gap-2">
            <span className="px-4 py-[6px] bg-[#f0f0f0] rounded-full text-[14px] font-semibold text-[#0f0f10] w-fit">{tag}</span>
            <div className="relative">
              <textarea
                placeholder="50자 이상 작성해주세요."
                value={data.bio[tag] ?? ""}
                onChange={e => onChange({ bio: { ...data.bio, [tag]: e.target.value.slice(0, MAX) } })}
                className="w-full h-[120px] border border-[#d8d8d8] rounded-[8px] p-4 text-[15px] text-[#0f0f10] placeholder:text-[#b7b7b7] outline-none focus:border-[#1a73e8] resize-none"
              />
              <span className="absolute bottom-3 right-3 text-[12px] text-[#9e9e9e]">{(data.bio[tag] ?? "").length}/{MAX}</span>
            </div>
          </div>
        ))}
      </div>
      <PageFooter>
        <CtaButton disabled={!valid} onClick={onNext}>완료</CtaButton>
      </PageFooter>
    </Screen>
  )
}
