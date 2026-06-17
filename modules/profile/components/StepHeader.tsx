import BackButton from "@/components/ui/back-button"
import { TOTAL_STEPS } from "../constants"

export function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-[4px] px-5 py-3">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full transition-colors"
          style={{ backgroundColor: i < step ? "#1a73e8" : "#e0e0e0" }}
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
      <div className="h-[54px] flex items-center px-4">
        <BackButton onClick={onBack} />
        {title && <span className="flex-1 text-center text-[17px] font-semibold text-[#0f0f10]">{title}</span>}
        {title && <div className="w-8" />}
      </div>
      <ProgressBar step={step} />
    </>
  )
}
