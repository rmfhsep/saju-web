"use client"

import { cn } from "@/lib/utils"

interface GlassHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  className?: string
}

export function GlassHeader({ title, subtitle, onBack, className }: GlassHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-50 backdrop-blur-2xl border-b border-white/10", "bg-white/5 shadow-[0_4px_32px_rgba(0,0,0,0.3)]", className)}>
      <div className="px-5 pb-4 flex items-center gap-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 48px)" }}>
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white transition-all active:scale-90 hover:bg-white/20"
          >
            ←
          </button>
        )}
        <div>
          <h1 className="text-white text-[18px] font-bold tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
