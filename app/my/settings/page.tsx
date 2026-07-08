"use client"

import { useRouter } from "next/navigation"
import { bridgeNavigate } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import DeleteAccountAction from "@/components/ui/delete-account-action"

const TERMS_URL = "https://maju.app/terms"
const PRIVACY_URL = "https://maju.app/privacy"

function Row({ label, chevron, onClick }: { label: string; chevron?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex flex-col active:bg-[#fafafa]">
      <div className="w-full flex items-center justify-between px-5 py-4">
        <span className="text-[15px] font-medium text-[#1f1f1f] tracking-[-0.15px]">{label}</span>
        {chevron && (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M6.5 4L11 9L6.5 14" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="mx-5 h-px bg-[#eaebec]" />
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()

  function handleLogout() {
    localStorage.setItem("did_logout", "true")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_phone")
    bridgeNavigate("Landing")
  }

  return (
    <Screen className="relative">
      <EditHeader title="설정" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto flex flex-col">
        <div className="pt-2">
          <Row label="알림" chevron onClick={() => router.push("/my/settings/notifications")} />
          <Row label="이용약관" onClick={() => { window.location.href = TERMS_URL }} />
          <Row label="개인정보 처리방침" onClick={() => { window.location.href = PRIVACY_URL }} />
          <Row label="로그아웃" onClick={handleLogout} />
        </div>

        <div className="mt-auto">
          <DeleteAccountAction />
        </div>
      </div>
    </Screen>
  )
}
