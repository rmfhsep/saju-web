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
        if (user.profileComplete) {
          if (user.filterComplete) navigateAndReplace("Home")
          else                     navigateAndReplace("Filter")
        } else if (user.birthDate) navigateAndReplace("Blocking")
        else                       navigateAndReplace("BirthInfo")
      })
      .catch(() => {
        clearTimeout(timeout)
        navigateAndReplace("Login")
      })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
