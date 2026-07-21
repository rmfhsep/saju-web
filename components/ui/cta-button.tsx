interface CtaButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  /** primary(기본, 파랑 solid) / secondary(파랑 outline) — 디자인 시스템 Button */
  variant?: "primary" | "secondary"
  children: React.ReactNode
  className?: string
}

export default function CtaButton({ onClick, disabled, loading, variant = "primary", children, className }: CtaButtonProps) {
  const active = !disabled && !loading

  // 디자인 시스템(15-453) 토큰 기준
  // primary   활성: bg Light Blue Strong(#B6D0FF) / text Gray850(#1F1F1F)
  //           비활성: bg Gray250(#E8E8E8) / text White
  // secondary 활성: bg Light Blue Light(#E9F1FF) / text Blue600(#1A75FF)  (톤온톤 채움)
  //           비활성: bg Navy100(#F4F4F5) / text Gray400(#B7B7B7)
  const styles = variant === "secondary"
    ? active
      ? "bg-[#e9f1ff] text-[#1a75ff] active:opacity-80"
      : "bg-[#f4f4f5] text-[#b7b7b7]"
    : active
      ? "bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80"
      : "bg-[#e8e8e8] text-white"

  return (
    <button
      type="button"
      onClick={active ? onClick : undefined}
      className={`w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-tight transition-colors ${styles} ${className ?? ""}`}
    >
      {children}
    </button>
  )
}
