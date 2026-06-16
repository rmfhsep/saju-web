"use client"

import { useEffect } from "react"
import { SCREEN_PATHS, bridgeNavigate } from "@/lib/bridge"

function go(screen: string) {
  bridgeNavigate(screen)
  // bridgeNavigate sends postMessage to RN but doesn't change the web URL.
  // Force the WebView to navigate so the spinner doesn't stay stuck.
  const path = SCREEN_PATHS[screen] ?? "/"
  window.location.replace(path)
}

export default function OnboardingLandingPage() {
  useEffect(() => {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      go("Verify")
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      go("Login")
    }, 10000)

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(res => {
        clearTimeout(timeout)
        if (!res.ok) { go("Login"); return null }
        return res.json()
      })
      .then(user => {
        if (!user) return
        if (user.profileComplete)   go("Home")
        else if (user.birthDate)    go("Blocking")
        else                        go("BirthInfo")
      })
      .catch(() => {
        clearTimeout(timeout)
        go("Login")
      })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
