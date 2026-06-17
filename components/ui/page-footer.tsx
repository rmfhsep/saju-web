interface PageFooterProps {
  children: React.ReactNode
  className?: string
}

export default function PageFooter({ children, className }: PageFooterProps) {
  return (
    <div className={`keyboard-footer ${className ?? ""}`}>
      {children}
    </div>
  )
}
