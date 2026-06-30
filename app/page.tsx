"use client"

import { useEffect, useState } from "react"
import { bridgeNavigate } from "@/lib/bridge"
import AppBottomNav, { APP_BOTTOM_NAV_HEIGHT } from "@/components/ui/app-bottom-nav"

type User = {
  id: number
  phone: string
  name: string | null
  gender: string | null
  profileComplete: boolean
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          bridgeNavigate("Landing")
          return
        }

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          localStorage.removeItem("auth_token")
          bridgeNavigate("Landing")
          return
        }

        const data: User = await res.json()
        if (!data.profileComplete) {
          bridgeNavigate("Landing")
          return
        }

        setUser(data)
      } catch {
        bridgeNavigate("Landing")
      } finally {
        setLoading(false)
      }
    }

    check()
  }, [])

  function handleLogout() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_phone")
    bridgeNavigate("Landing")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT }}>
      <div className="px-5 pt-14 pb-6">
        <p className="text-[14px] text-[#6b6b6b]">안녕하세요</p>
        <h1 className="text-[28px] font-bold text-[#0f0f10] mt-1">
          {user.name ?? user.phone}님 👋
        </h1>
      </div>

      <div className="flex-1 px-5 flex flex-col gap-4">
        <div className="bg-[#f4f4f5] rounded-[12px] p-5 flex flex-col gap-2">
          <p className="text-[13px] text-[#6b6b6b]">프로필 완성</p>
          <p className="text-[16px] font-semibold text-[#0f0f10]">
            {user.gender === "MALE" ? "남성" : user.gender === "FEMALE" ? "여성" : ""} 회원
          </p>
        </div>

        <div className="bg-[#e9f1ff] rounded-[12px] p-5">
          <p className="text-[14px] text-[#1a75ff] font-semibold mb-1">매칭 준비 중</p>
          <p className="text-[13px] text-[#4a7fe5]">
            곧 나와 잘 맞는 인연을 소개해드릴게요.
          </p>
        </div>
      </div>

      <div className="px-5 pb-10">
        <button
          onClick={handleLogout}
          className="w-full h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold tracking-tight text-[#6b6b6b]"
        >
          로그아웃
        </button>
      </div>

      <AppBottomNav />
    </div>
  )
}
