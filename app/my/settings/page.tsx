"use client"

import { useRouter } from "next/navigation"
import { bridgeNavigate } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"

export default function SettingsPage() {
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_phone")
    bridgeNavigate("Landing")
  }

  return (
    <Screen>
      <EditHeader title="설정" onBack={() => router.back()} />
      <div className="flex-1 px-5 pt-4">
        <button
          onClick={handleLogout}
          className="w-full h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold tracking-tight text-[#6b6b6b]"
        >
          로그아웃
        </button>
      </div>
    </Screen>
  )
}
