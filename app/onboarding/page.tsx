"use client"

import { useEffect } from "react"
import { bridgeNavigate, navigateAndReplace } from "@/lib/bridge"

function clearSession() {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_phone")
}

export default function OnboardingLandingPage() {
  useEffect(() => {
    // 로그아웃 플래그 확인 — 로그인 성공 전까지 유지
    if (localStorage.getItem("did_logout")) {
      navigateAndReplace("Login")
      return
    }

    const token = localStorage.getItem("auth_token")

    // 토큰 없음 = 첫 설치 or 세션 만료 → 번호 인증부터
    if (!token) {
      navigateAndReplace("PhoneInput")
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      clearSession()
      navigateAndReplace("PhoneInput")
    }, 10000)

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(res => {
        clearTimeout(timeout)
        if (!res.ok) {
          // 토큰 만료 or 서버 오류 → 번호 인증부터
          clearSession()
          navigateAndReplace("PhoneInput")
          return null
        }
        return res.json()
      })
      .then(user => {
        if (!user) return

        if (user.signupComplete) {
          // 가입 완료된 유저 → 바로 홈
          if (user.filterComplete) {
            bridgeNavigate("Home")
          } else {
            bridgeNavigate("Filter")
          }
        } else {
          // 가입 미완료 → 세션 지우고 번호 인증부터 다시
          clearSession()
          navigateAndReplace("PhoneInput")
        }
      })
      .catch(() => {
        clearTimeout(timeout)
        clearSession()
        navigateAndReplace("PhoneInput")
      })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
