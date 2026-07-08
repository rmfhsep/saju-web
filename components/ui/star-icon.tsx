interface StarIconProps {
  size?: number
  color?: string
  className?: string
}

/** 채워진 5각 별 아이콘 (보유 별 / 스토어 패키지용). */
export default function StarIcon({ size = 20, color = "#FFB020", className }: StarIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2.6c.38 0 .73.22.9.56l2.53 5.13 5.66.82c.38.06.69.32.81.68.12.36.02.76-.25 1.02l-4.1 3.99.97 5.64c.06.38-.09.76-.4.99-.31.22-.72.25-1.06.07L12 18.86l-5.06 2.66c-.34.18-.75.15-1.06-.07-.31-.23-.46-.61-.4-.99l.97-5.64-4.1-3.99a1 1 0 0 1-.25-1.02c.12-.36.43-.62.81-.68l5.66-.82L11.1 3.16c.17-.34.52-.56.9-.56z"
        fill={color}
      />
    </svg>
  )
}
