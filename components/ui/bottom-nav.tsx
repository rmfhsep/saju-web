"use client"

import { cn } from "@/lib/utils"

type NavTab = "home" | "history" | "profile"

interface BottomNavProps {
  active: NavTab
  onChange: (tab: NavTab) => void
}

const tabs = [
  { id: "home" as NavTab, label: "사주보기", icon: "🔮" },
  { id: "history" as NavTab, label: "내 기록", icon: "📜" },
  { id: "profile" as NavTab, label: "설정", icon: "⚙️" },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50 px-4 pb-6 pt-2">
      <div
        className={cn(
          "flex items-center justify-around rounded-2xl px-2 py-2",
          "bg-white/10 backdrop-blur-2xl border border-white/20",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          "before:absolute before:inset-0 before:rounded-2xl",
          "before:bg-linear-to-b before:from-white/15 before:to-transparent before:pointer-events-none",
          "relative",
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 active:scale-90",
              active === tab.id
                ? "bg-white/20 border border-white/30 shadow-[0_2px_12px_rgba(255,255,255,0.1)]"
                : "opacity-50 hover:opacity-80",
            )}
          >
            <span className="text-2xl leading-none">{tab.icon}</span>
            <span
              className={cn(
                "text-[10px] font-semibold",
                active === tab.id ? "text-white" : "text-white/60",
              )}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
