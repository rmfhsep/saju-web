interface ScreenProps {
  children: React.ReactNode
  className?: string
}

export default function Screen({ children, className }: ScreenProps) {
  return (
    <div className={`flex flex-col h-screen bg-white overflow-hidden ${className ?? ""}`}>
      {children}
    </div>
  )
}
