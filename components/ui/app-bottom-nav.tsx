"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export const APP_BOTTOM_NAV_HEIGHT = 85

type Tab = { key: string; label: string; href: string; icon: (active: boolean, avatar: string | null, dot: boolean) => React.ReactNode }

/** 우측 상단에 얹는 안읽음 표시 점 (Figma: Atomic/Red/Red 550 #FF4242, 6px) */
function Dot() {
  return <span className="absolute -top-px right-0 w-[6px] h-[6px] rounded-full bg-[#ff4242]" />
}

/** 채워진 집 모양 — 활성 배경(#efefef) 위에 얹히는 문 틈은 배경과 같은 색으로 지운다. */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20.5" height="20.5" viewBox="0 0 20.5 20.5" fill="none">
      <path
        d="M0.75 7.5225C0.75 7.13258 0.948461 6.76678 1.2826 6.54081L9.51594 0.972904C9.95542 0.675698 10.5446 0.675699 10.9841 0.972904L19.2174 6.54081C19.5515 6.76678 19.75 7.13258 19.75 7.5225V17.9431C19.75 18.941 18.8993 19.75 17.85 19.75H2.65C1.60066 19.75 0.75 18.941 0.75 17.9431V7.5225Z"
        fill={active ? "#1f1f1f" : "none"}
        stroke="#1f1f1f"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 15.5938H15" stroke={active ? "#efefef" : "#1f1f1f"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="20.5" height="18" viewBox="0 0 22.5 19.5986" fill="none">
      <path
        d="M16.0227 0.75C14.5254 0.75 13.1612 1.34357 12.149 2.34069C11.6782 2.80443 10.8218 2.80443 10.351 2.34069C9.33879 1.34357 7.97461 0.75 6.47727 0.75C3.32727 0.75 0.75 3.48553 0.75 6.82895C0.75 12.1202 8.83954 17.4896 10.8175 18.7234C11.0844 18.8898 11.4161 18.8903 11.6834 18.7248C13.6631 17.4987 21.75 12.1638 21.75 6.82895C21.75 3.48553 19.1727 0.75 16.0227 0.75Z"
        fill={active ? "#1f1f1f" : "none"}
        stroke="#1f1f1f"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <svg width="19.5" height="20" viewBox="0 0 21.4981 21.5" fill="none">
      <path
        d="M19.9926 14.57C20.4795 13.3931 20.7481 12.1029 20.7481 10.75C20.7481 5.22715 16.2714 0.75 10.7491 0.75C5.22673 0.75 0.75 5.22715 0.75 10.75C0.75 16.2728 5.22673 20.75 10.7491 20.75C12.4087 20.75 13.974 20.3456 15.3516 19.63C15.5406 19.5318 15.7584 19.501 15.9649 19.5527L19.5477 20.4484C20.1218 20.592 20.6584 20.108 20.5747 19.5222L19.9325 15.0259C19.9104 14.8714 19.933 14.7142 19.9926 14.57Z"
        fill={active ? "#1f1f1f" : "none"}
        stroke="#1f1f1f"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
        <div className="flex items-stretch justify-center bg-white/65 backdrop-blur-xl rounded-[296px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
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
