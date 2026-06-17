interface BackButtonProps {
  onClick: () => void
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center"
    >
      <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
        <path d="M9 1L1 9L9 17" stroke="#0f0f10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
