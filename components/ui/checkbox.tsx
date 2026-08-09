interface CheckboxProps {
  checked: boolean
  onChange: () => void
}

// 디자인 시스템 Control/Checkbox(28:5111) 기준
// 히트 영역 20x20, 실제 박스 18x18 (rounded 4px, 중앙 정렬)
// checked: bg Light Blue Strong(#B6D0FF) / unchecked: border Navy200(#E1E2E4)
export default function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange() }}
      className="w-[20px] h-[20px] shrink-0 flex items-center justify-center"
    >
      <span
        className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors ${
          checked ? "bg-[#b6d0ff]" : "border border-[#e1e2e4]"
        }`}
      >
        {checked && (
          <svg width="9" height="6.5" viewBox="0 0 9 6.5" fill="none">
            <path d="M0.75 3.25L3.25 5.75L8.25 0.75" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  )
}
