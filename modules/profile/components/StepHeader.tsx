import BackButton from "@/components/ui/back-button"
import { TOTAL_STEPS } from "../constants"

export function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-[4px] px-5 pt-5 pb-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full transition-colors"
          style={{ backgroundColor: i < step ? "#90b7ff" : "#eaebec" }}
        />
      ))}
    </div>
  )
}

interface StepHeaderProps {
  onBack: () => void
  step: number
  title?: string
}

export default function StepHeader({ onBack, step, title }: StepHeaderProps) {
  return (
    <>
      <div className="h-[52px] flex items-center gap-3 px-5">
        <BackButton onClick={onBack} />
        {title && <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">{title}</span>}
      </div>
      <ProgressBar step={step} />
    </>
  )
}
