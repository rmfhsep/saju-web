import StarIcon from "@/components/ui/star-icon"

interface StarChipProps {
  stars: number
  onClick?: () => void
  className?: string
}

/** 보유 별 개수를 보여주는 칩 — 클릭 핸들러가 있으면 버튼으로 렌더링됩니다. */
export default function StarChip({ stars, onClick, className = "" }: StarChipProps) {
  const chipClassName = `flex items-center gap-1 h-[34px] px-3 py-1 bg-[#fff5e5] rounded-full ${className}`.trim()
  const content = (
    <>
      <StarIcon size={20} color="#FFA100" />
      <span className="text-[16px] font-semibold text-[#FF7B2E] tracking-[-0.32px]">
        {stars}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className={chipClassName}>
        {content}
      </button>
    )
  }

  return <div className={chipClassName}>{content}</div>
}
