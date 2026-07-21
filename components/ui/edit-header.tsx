import BackButton from "@/components/ui/back-button"

interface EditHeaderAction {
  label: string
  onClick: () => void
  disabled?: boolean
}

interface EditHeaderProps {
  title: string
  onBack: () => void
  /** 우측 상단 text button (예: 저장). 지정 시 하단 CTA 대신 사용. */
  action?: EditHeaderAction
}

export default function EditHeader({ title, onBack, action }: EditHeaderProps) {
  return (
    <div className="h-[54px] flex items-center gap-3 px-5 shrink-0">
      <BackButton onClick={onBack} />
      <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">{title}</span>
      {action && (
        <button
          type="button"
          onClick={action.disabled ? undefined : action.onClick}
          className={`ml-auto text-[16px] font-semibold tracking-[-0.32px] transition-colors ${
            action.disabled ? "text-[#c4c4c4]" : "text-[#1a75ff] active:opacity-70"
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
