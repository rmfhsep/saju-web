interface ScreenProps {
  children: React.ReactNode
  className?: string
}

export default function Screen({ children, className }: ScreenProps) {
  return (
    <div
      className={`flex flex-col bg-white overflow-hidden ${className ?? ""}`}
      style={{ height: "var(--app-height, 100dvh)" }}
    >
      {children}
    </div>
  )
}
