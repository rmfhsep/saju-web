import BackButton from "@/components/ui/back-button"

interface EditHeaderProps {
  title: string
  onBack: () => void
}

export default function EditHeader({ title, onBack }: EditHeaderProps) {
  return (
    <div className="h-[54px] flex items-center gap-3 px-5 shrink-0">
      <BackButton onClick={onBack} />
      <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">{title}</span>
    </div>
  )
}
