import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function StepIntro({ onNext, onBack }: Props) {
  return (
    <Screen>
      <div className="h-[54px] flex items-center px-4">
        <BackButton onClick={onBack} />
      </div>
      <div className="flex-1 px-5 flex flex-col items-center justify-center gap-6 scroll-area overflow-y-auto pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="w-[72px] h-[72px]" />
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
            인연을 추천받기 위한<br />프로필을 완성해주세요.
          </h1>
          <p className="text-[15px] text-[#777] leading-relaxed tracking-[-0.3px]">
            당신의 연애운을 분석하는 것도 중요하지만,<br />내가 어떤 사람인지 솔직하게 작성할수록<br />더 잘 맞는 관계를 발견할 수 있어요.<br />좋은 인연을 만나기 위해 진솔하게 채워주세요.
          </p>
        </div>
      </div>
      <PageFooter>
        <CtaButton onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
