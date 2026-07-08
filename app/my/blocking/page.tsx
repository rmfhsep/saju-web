"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import {
  bridgeRequestContacts,
  onContactsReceived,
  onContactsPermissionDenied,
} from "@/lib/bridge"

export default function BlockingPage() {
  const router = useRouter()
  const [blockedCount, setBlockedCount] = useState(0)
  const [phone, setPhone] = useState("")
  const [showUnblock, setShowUnblock] = useState(false)
  const [showPermission, setShowPermission] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    setPhone(localStorage.getItem("user_phone") ?? "")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(u => { if (u) setBlockedCount(u.blockedCount ?? 0) })
      .catch(() => {})
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  async function saveBlocking(contactPhones: string[]) {
    setBusy(true)
    try {
      const res = await fetch("/api/blocking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, contactPhones }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data) setBlockedCount(data.blockedCount ?? contactPhones.length)
    } finally {
      setBusy(false)
    }
  }

  function handleAdd() {
    if (busy) return
    onContactsReceived((phones) => {
      saveBlocking(phones).then(() => showToast("내 연락처에 있는 모든 목록을 차단했어요."))
    })
    onContactsPermissionDenied(() => setShowPermission(true))
    bridgeRequestContacts()
    // 브라우저(비 WebView) fallback — 네이티브가 없으면 콜백이 오지 않으므로 안내만
    const inNativeApp =
      typeof window !== "undefined" &&
      !!(window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView
    if (!inNativeApp) {
      showToast("앱에서만 연락처 차단을 사용할 수 있어요.")
    }
  }

  async function handleUnblockAll() {
    await saveBlocking([])
    setBlockedCount(0)
    setShowUnblock(false)
    showToast("차단을 모두 해제했어요.")
  }

  return (
    <Screen className="relative">
      <EditHeader title="지인 차단" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto px-5 pt-1">
        <div className="flex flex-col gap-3">
          <h1 className="text-[20px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.4px]">
            연락처에 있는 지인을 차단해요.
          </h1>
          <p className="text-[14px] font-normal text-[#949494] leading-[1.5] tracking-[-0.14px]">
            연락처를 기반으로 지인을 차단할 수 있어요.<br />
            차단한 상대에게는 프로필이 노출되지 않아요.
          </p>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="w-[60px] h-[60px] rounded-full bg-[#e9f1ff] flex items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M9.5 5.5c.5 0 .9.3 1.1.8l1.2 2.9c.2.5.1 1-.3 1.4l-1.3 1.2a11 11 0 0 0 4.8 4.8l1.2-1.3c.4-.4.9-.5 1.4-.3l2.9 1.2c.5.2.8.6.8 1.1v3c0 .8-.7 1.5-1.5 1.4C12.4 22.2 5.8 15.6 5.1 7.4 5 6.6 5.7 6 6.5 6h3z"
                fill="#1a75ff"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">연락처</p>
            <p className="text-[16px] font-normal text-[#949494] tracking-[-0.32px]">
              <span className="text-[#1a75ff] font-semibold">{blockedCount}</span>명 차단 중
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setShowUnblock(true)}
            disabled={busy || blockedCount === 0}
            className="flex-1 h-[36px] bg-[#f4f4f5] rounded-[4px] text-[14px] font-medium text-[#1f1f1f] active:opacity-80 disabled:opacity-40"
          >
            차단 해제
          </button>
          <button
            onClick={handleAdd}
            disabled={busy}
            className="flex-1 h-[36px] bg-[#e9f1ff] rounded-[4px] text-[14px] font-medium text-[#1a75ff] active:opacity-80 disabled:opacity-50"
          >
            차단 추가
          </button>
        </div>
      </div>

      {/* 차단 해제 모달 */}
      {showUnblock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/61" onClick={() => !busy && setShowUnblock(false)} />
          <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.32px]">
                모든 연락처를 차단 해제할까요?
              </p>
              <p className="text-[14px] text-[#777] leading-normal">차단 등록한 연락처를 모두 해제해요.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUnblock(false)}
                disabled={busy}
                className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80 disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleUnblockAll}
                disabled={busy}
                className="flex-1 h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80 disabled:opacity-60"
              >
                차단 해제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 연락처 권한 거부 모달 */}
      {showPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/61" onClick={() => setShowPermission(false)} />
          <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.32px]">
                연락처 권한이 필요해요.
              </p>
              <p className="text-[14px] text-[#777] leading-normal">
                설정 &gt; 앱 권한에서 연락처 접근을 허용해주세요.
              </p>
            </div>
            <button
              onClick={() => setShowPermission(false)}
              className="h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[60px] z-50 px-5 py-3 bg-[#333]/90 text-white text-[13px] rounded-[8px] text-center max-w-[300px]">
          {toast}
        </div>
      )}
    </Screen>
  )
}
