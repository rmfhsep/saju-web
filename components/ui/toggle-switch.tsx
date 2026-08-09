interface ToggleSwitchProps {
  on: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

// 디자인 시스템 Control/Toggle(177-194) 기준 — on: Light Blue Heavy(#90B7FF) / off: Gray300(#DFDFDF)
export default function ToggleSwitch({ on, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`w-[48px] h-[28px] rounded-full p-[2px] flex items-center transition-colors disabled:opacity-60 ${
        on ? "bg-[#90b7ff] justify-end" : "bg-[#dfdfdf] justify-start"
      }`}
    >
      <span className="w-[24px] h-[24px] rounded-full bg-white shadow-sm" />
    </button>
  )
}
