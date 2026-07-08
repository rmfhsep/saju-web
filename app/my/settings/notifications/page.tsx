"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import DeleteAccountAction from "@/components/ui/delete-account-action"
import { bridgeOpenAppSettings } from "@/lib/bridge"

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`w-[44px] h-[26px] rounded-full p-[3px] flex items-center transition-colors disabled:opacity-60 ${
        on ? "bg-[#1a75ff] justify-end" : "bg-[#e5e5e5] justify-start"
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
    </button>
  )
}

function authFetch(path: string, init?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return fetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
}

export default function NotificationsPage() {
  const router = useRouter()
  const [deviceOn, setDeviceOn] = useState(false) // OS 푸시 권한 (추후 네이티브 연동 시 갱신)
  const [serviceOn, setServiceOn] = useState(true) // 서비스 알림 (DB)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  useEffect(() => {
    // DB에 저장된 알림 설정 로드
    authFetch("/api/auth/me")
      .then(res => (res.ok ? res.json() : null))
      .then(u => {
        if (!u) return
        setServiceOn(u.serviceNotify ?? true)
        setDeviceOn(u.pushEnabled ?? false)
      })
      .catch(() => {})
  }, [])

  async function handleServiceToggle(next: boolean) {
    setServiceOn(next) // 낙관적 업데이트
    setSaving(true)
    try {
      const res = await authFetch("/api/profile/notifications", {
        method: "POST",
        body: JSON.stringify({ serviceNotify: next }),
      })
      if (!res.ok) {
        setServiceOn(!next) // 롤백
        showToast("저장에 실패했어요.")
      }
    } catch {
      setServiceOn(!next)
      showToast("저장에 실패했어요.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen className="relative">
      <EditHeader title="알림" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto flex flex-col">
        <div className="pt-2">
          {/* 기기 알림 */}
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">
                기기 알림 {deviceOn ? "켜짐" : "꺼짐"}
              </p>
              <p className="text-[13px] font-normal text-[#949494] leading-[1.4]">
                이성이 보낸 호감, 메시지 알림을 받을 수 있어요.
              </p>
            </div>
            <button
              onClick={() => bridgeOpenAppSettings()}
              className="shrink-0 h-[30px] px-3 bg-[#e9f1ff] rounded-[4px] text-[13px] font-medium text-[#1a75ff] active:opacity-80"
            >
              설정
            </button>
          </div>
          <div className="mx-5 h-px bg-[#eaebec]" />

          {/* 서비스 알림 */}
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">서비스 알림</p>
              <p className="text-[13px] font-normal text-[#949494] leading-[1.4]">
                혜택, 할인, 이벤트 마케팅 정보 수신 동의
              </p>
            </div>
            <Toggle on={serviceOn} onChange={handleServiceToggle} disabled={saving} />
          </div>
        </div>

        <div className="mt-auto">
          <DeleteAccountAction />
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[60px] z-50 px-5 py-3 bg-[#333]/90 text-white text-[13px] rounded-[8px] text-center">
          {toast}
        </div>
      )}
    </Screen>
  )
}
