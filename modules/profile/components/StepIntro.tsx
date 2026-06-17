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
        <div className="w-[72px] h-[72px] rounded-[18px] bg-[#b6d0ff] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 8C14 8 9 13 9 19.5C9 23.5 11 27 14.5 29.5L13 33L17.5 30.5C18.3 30.7 19.1 30.8 20 30.8C26 30.8 31 25.8 31 19.5C31 13.2 26 8 20 8Z" fill="#1a73e8"/>
            <path d="M15 20C15 20 17 22.5 20 22.5C23 22.5 25 20 25 20" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="16" cy="18" r="1.5" fill="white"/>
            <circle cx="24" cy="18" r="1.5" fill="white"/>
          </svg>
        </div>
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
            인연을 추천받기 위한<br />프로필을 완성해주세요.
          </h1>
          <p className="text-[15px] text-[#6b6b6b] leading-relaxed">
            내가 어떤 사람인지 솔직하게 작성할수록<br />더 잘 맞는 관계를 발견할 수 있어요.<br />좋은 인연을 만나기 위해 진솔하게 채워주세요.
          </p>
        </div>
      </div>
      <PageFooter>
        <CtaButton onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
