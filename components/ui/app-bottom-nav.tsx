"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export const APP_BOTTOM_NAV_HEIGHT = 85

type Tab = { key: string; label: string; href?: string; icon: (active: boolean) => React.ReactNode }

const TABS: Tab[] = [
  {
    key: "recommend", label: "추천", href: "/",
    icon: active => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5l2.2 4.46 4.92.72-3.56 3.47.84 4.9L10 13.6l-4.4 2.45.84-4.9L2.88 7.68l4.92-.72L10 2.5z" stroke={active ? "#1a75ff" : "#9e9e9e"} strokeWidth="1.5" strokeLinejoin="round" fill={active ? "#1a75ff" : "none"} />
      </svg>
    ),
  },
  {
    key: "like", label: "호감",
    icon: active => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 17s-6.5-4-6.5-8.7C3.5 5.5 5.4 4 7.4 4c1 0 2 .5 2.6 1.4C10.6 4.5 11.6 4 12.6 4c2 0 3.9 1.5 3.9 4.3C16.5 13 10 17 10 17z" stroke={active ? "#1a75ff" : "#9e9e9e"} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "message", label: "메시지",
    icon: active => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H7l-4 3v-3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke={active ? "#1a75ff" : "#9e9e9e"} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "my", label: "내 정보", href: "/my",
    icon: active => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6.5" r="3.5" stroke={active ? "#1a75ff" : "#9e9e9e"} strokeWidth="1.5" />
        <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={active ? "#1a75ff" : "#9e9e9e"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function AppBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [toast, setToast] = useState<string | null>(null)

  // 앱(React Native WebView) 안에서는 네이티브 Liquid Glass 탭바가 대신 표시되므로
  // 웹 쪽 CSS 탭바는 렌더링하지 않는다 (상위 페이지의 하단 여백 reservation은 유지됨).
  const inNativeApp = typeof window !== "undefined" && !!(window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView
  if (inNativeApp) return null

  function handleTap(tab: Tab) {
    if (!tab.href) {
      setToast(`${tab.label} 기능은 준비 중이에요.`)
      setTimeout(() => setToast(null), 1500)
      return
    }
    router.push(tab.href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {toast && (
        <div className="mb-2 px-4 py-2 bg-[#1f1f1f]/90 text-white text-[13px] rounded-full whitespace-nowrap">
          {toast}
        </div>
      )}
      <div className="w-full max-w-[430px] px-[25px] pt-4 pb-5">
        <div className="flex items-stretch justify-center bg-white/65 backdrop-blur-xl rounded-[296px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          {TABS.map(tab => {
            const active = tab.href ? pathname === tab.href : false
            return (
              <button
                key={tab.key}
                onClick={() => handleTap(tab)}
                className="flex-1 flex flex-col items-center justify-center gap-[2px] py-[10px] relative"
              >
                {active && <span className="absolute inset-x-0 -inset-y-[2px] rounded-full bg-[#efefef] -z-10" />}
                {tab.icon(active)}
                <span className={`text-[9px] font-medium leading-[1.3] ${active ? "text-[#1a75ff]" : "text-[#9e9e9e]"}`}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
