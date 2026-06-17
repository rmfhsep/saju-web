interface RadioOptionProps {
  label: string
  selected: boolean
  onClick: () => void
}

export default function RadioOption({ label, selected, onClick }: RadioOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 h-[48px] rounded-[10px] transition-colors ${
        selected ? "bg-[#eef2ff] border border-[#aecbff]" : "bg-[#f5f5f7] border border-transparent"
      }`}
    >
      <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-[#1a73e8]" : "border-[#ccc]"
      }`}>
        {selected && <div className="w-[9px] h-[9px] rounded-full bg-[#1a73e8]" />}
      </div>
      <span className={`text-[15px] ${selected ? "font-semibold text-[#0f0f10]" : "font-normal text-[#4a4a4a]"}`}>
        {label}
      </span>
    </button>
  )
}
