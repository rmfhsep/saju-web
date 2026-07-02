"use client"

import { useEffect } from "react"
import { navigateAndReplace } from "@/lib/bridge"

export default function OnboardingLandingPage() {
  useEffect(() => {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      navigateAndReplace("PhoneInput")
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      navigateAndReplace("Login")
    }, 10000)

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(res => {
        clearTimeout(timeout)
        if (!res.ok) { navigateAndReplace("Login"); return null }
        return res.json()
      })
      .then(user => {
        if (!user) return

        // 회원가입 완료 사용자 → 토큰 지우고 번호 인증부터 재시작
        if (user.signupComplete) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_phone")
          navigateAndReplace("PhoneInput")
          return
        }

        // 회원가입 미완료 → 중단된 단계부터 이어서 진행
        if (user.profileComplete) {
          if (user.filterComplete) {
            // filterComplete까지 됐는데 signupComplete가 false면 강제 complete 처리
            navigateAndReplace("Home")
          } else {
            navigateAndReplace("Filter")
          }
        } else if (user.birthDate) {
          navigateAndReplace("Blocking")
        } else {
          navigateAndReplace("BirthInfo")
        }
      })
      .catch(() => {
        clearTimeout(timeout)
        // 네트워크/인증 오류 → 번호 인증부터 다시
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_phone")
        navigateAndReplace("PhoneInput")
      })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
