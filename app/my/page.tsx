"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { bridgeNavigate } from "@/lib/bridge"
import AppBottomNav, { APP_BOTTOM_NAV_HEIGHT } from "@/components/ui/app-bottom-nav"

type MeUser = {
  nickname: string | null
  name: string | null
  photos: string | null
}

function ListCell({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex flex-col gap-4 pt-4 px-5 items-start">
      <div className="w-full flex items-center gap-3">
        <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>
        <span className="flex-1 text-left text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px]">{label}</span>
      </div>
      <div className="w-full h-px bg-[#eaebec]" />
    </button>
  )
}

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<MeUser | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) { bridgeNavigate("Landing"); return }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setUser(data) })
      .catch(() => {})
  }, [])

  const photos: string[] = user?.photos ? JSON.parse(user.photos) : []
  const displayName = user?.nickname || user?.name || ""

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT }}>
      <div className="h-[52px] flex items-center px-5">
        <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">{displayName}</span>
      </div>

      <div className="flex flex-col gap-8 items-center pt-7">
        <div className="flex flex-col gap-4 items-center w-[120px]">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-[#f4f4f5] flex items-center justify-center">
            {photos[0] ? (
              <img src={photos[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[36px] font-semibold text-[#b7b7b7]">{displayName.slice(0, 1)}</span>
            )}
          </div>
          <button
            onClick={() => router.push("/my/edit")}
            className="h-[36px] px-4 bg-[#e9f1ff] rounded-[4px] text-[13px] font-medium text-[#1a75ff]"
          >
            프로필 수정
          </button>
        </div>

        <div className="w-full flex flex-col">
          <ListCell
            label="선호하는 조건 설정"
            onClick={() => bridgeNavigate("Filter")}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 6h14M6 10h8M8.5 14h3" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
          <ListCell
            label="지인 차단하기"
            onClick={() => bridgeNavigate("Blocking")}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="#1f1f1f" strokeWidth="1.5" />
                <path d="M5 15L15 5" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
          <ListCell
            label="문의하기"
            onClick={() => { window.location.href = "mailto:support@maju.app" }}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="#1f1f1f" strokeWidth="1.5" />
                <path d="M3.5 5.5l6.5 5 6.5-5" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <ListCell
            label="설정"
            onClick={() => router.push("/my/settings")}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="2.5" stroke="#1f1f1f" strokeWidth="1.5" />
                <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </div>

      <AppBottomNav />
    </div>
  )
}
