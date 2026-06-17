interface CtaButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export default function CtaButton({ onClick, disabled, loading, children, className }: CtaButtonProps) {
  const active = !disabled && !loading
  return (
    <button
      type="button"
      onClick={active ? onClick : undefined}
      className={`w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-tight transition-colors ${
        active
          ? "bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80"
          : "bg-[#f4f4f5] text-[#a0a0a0]"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  )
}
