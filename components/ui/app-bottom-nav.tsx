"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export const APP_BOTTOM_NAV_HEIGHT = 85

type Tab = { key: string; label: string; href: string; icon: (active: boolean, avatar: string | null, dot: boolean) => React.ReactNode }

/** 우측 상단에 얹는 안읽음 표시 점 (Figma: Atomic/Red/Red 550 #FF4242, 6px) */
function Dot() {
  return <span className="absolute -top-px right-0 w-[6px] h-[6px] rounded-full bg-[#ff4242]" />
}

function HomeIcon({ active }: { active: boolean }) {
  return <img src={`/icons/tab-recommend-${active ? "on" : "off"}.svg`} alt="" width={22} height={22} />
}

function HeartIcon({ active }: { active: boolean }) {
  return <img src={`/icons/tab-like-${active ? "on" : "off"}.svg`} alt="" width={22} height={22} />
}

function MessageIcon({ active }: { active: boolean }) {
  return <img src={`/icons/tab-message-${active ? "on" : "off"}.svg`} alt="" width={22} height={22} />
}

const TABS: Tab[] = [
  {
    key: "recommend", label: "추천", href: "/",
    icon: active => <HomeIcon active={active} />,
  },
  {
    key: "like", label: "호감", href: "/likes",
    icon: (active, _avatar, dot) => (
      <span className="relative inline-flex">
        <HeartIcon active={active} />
        {dot && <Dot />}
      </span>
    ),
  },
  {
    key: "message", label: "메시지", href: "/messages",
    icon: (active, _avatar, dot) => (
      <span className="relative inline-flex">
        <MessageIcon active={active} />
        {dot && <Dot />}
      </span>
    ),
  },
  {
    key: "my", label: "내 정보", href: "/my",
    icon: (_active, avatar) =>
      avatar ? (
        <img src={avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="6.5" r="3.5" stroke="#1f1f1f" strokeWidth="1.5" />
          <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
  },
]

type Props = {
  /** 새 호감/메시지 여부 — 각 탭 아이콘에 빨간 점을 표시한다. 안읽음 데이터 연동은 추후 진행. */
  hasNewLike?: boolean
  hasNewMessage?: boolean
}

export default function AppBottomNav({ hasNewLike = false, hasNewMessage = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const photos: string[] = d?.photos ? JSON.parse(d.photos) : []
        if (photos[0]) setAvatar(photos[0])
      })
      .catch(() => {})
  }, [])

  // 앱(React Native WebView) 안에서는 네이티브 Liquid Glass 탭바가 대신 표시되므로
  // 웹 쪽 CSS 탭바는 렌더링하지 않는다 (상위 페이지의 하단 여백 reservation은 유지됨).
  const inNativeApp = typeof window !== "undefined" && !!(window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView
  if (inNativeApp) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="w-full max-w-[430px] px-[25px] pt-4 pb-5">
        <div
          className="flex items-stretch justify-center rounded-[296px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          style={
            {
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              // RecoCard(app/page.tsx)와 동일한 이슈: fixed 탭바 아래로 콘텐츠가 계속
              // 스크롤되면 WebKit이 backdrop-filter를 프레임마다 재계산하며 블러가
              // 꺼진 것처럼 보이는 버그가 있다 — 별도 GPU 레이어로 승격시켜 방지.
              transform: "translateZ(0)",
              willChange: "transform",
            } as React.CSSProperties
          }
        >
          {TABS.map(tab => {
            const active = pathname === tab.href
            return (
              <button
                key={tab.key}
                onClick={() => router.push(tab.href)}
                className="flex-1 flex flex-col items-center justify-center gap-[2px] py-[10px] relative"
              >
                {active && <span className="absolute inset-x-0 -inset-y-[2px] rounded-full bg-[#efefef] -z-10" />}
                {tab.icon(active, avatar, tab.key === "like" ? hasNewLike : tab.key === "message" ? hasNewMessage : false)}
                <span className="text-[9px] font-medium leading-[1.3] text-[#1f1f1f]">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
