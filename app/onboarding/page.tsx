"use client"

import { useEffect } from "react"
import { bridgeNavigate } from "@/lib/bridge"

export default function OnboardingLandingPage() {
  useEffect(() => {
    async function checkSession() {
      try {
        const token = localStorage.getItem("auth_token")

        if (!token) {
          bridgeNavigate("Verify")
          return
        }

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_phone")
          bridgeNavigate("Verify")
          return
        }

        const user = await res.json()

        if (user.profileComplete) {
          bridgeNavigate("Home")
        } else if (user.birthDate) {
          // 출생 정보는 있지만 프로필 미완성 → 차단 화면부터
          bridgeNavigate("Blocking")
        } else {
          // 등록만 완료, 출생 정보 미입력
          bridgeNavigate("BirthInfo")
        }
      } catch {
        bridgeNavigate("Verify")
      }
    }

    checkSession()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
