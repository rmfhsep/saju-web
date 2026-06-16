"use client"

import { useEffect } from "react"
import { bridgeNavigate } from "@/lib/bridge"

export default function OnboardingLandingPage() {
  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        bridgeNavigate("Verify")
        return
      }

      // 10초 타임아웃 — 네트워크 행 방지
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (!res.ok) {
          // 토큰이 있었으나 만료/무효 → 기존 유저이므로 재로그인 화면으로
          bridgeNavigate("Login")
          return
        }

        const user = await res.json()

        if (user.profileComplete) {
          bridgeNavigate("Home")
        } else if (user.birthDate) {
          bridgeNavigate("Blocking")
        } else {
          bridgeNavigate("BirthInfo")
        }
      } catch {
        clearTimeout(timeout)
        // 네트워크 오류 또는 타임아웃 → 재로그인 화면으로
        bridgeNavigate("Login")
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
