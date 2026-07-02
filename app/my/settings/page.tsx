"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { bridgeNavigate } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"

export default function SettingsPage() {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleLogout() {
    localStorage.setItem("did_logout", "true")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_phone")
    bridgeNavigate("Landing")
  }

  async function handleDeleteAccount() {
    const token = localStorage.getItem("auth_token")
    if (!token || deleting) return
    setDeleting(true)
    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_phone")
        bridgeNavigate("Landing")
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Screen className="relative">
      <EditHeader title="설정" onBack={() => router.back()} />

      <div className="flex-1 px-5 pt-4 flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="w-full h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold tracking-tight text-[#6b6b6b]"
        >
          로그아웃
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full h-[48px] rounded-[4px] text-[14px] font-medium tracking-tight text-[#ff3b30]"
        >
          탈퇴하기
        </button>
      </div>

      {/* 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/61" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.32px]">
                정말 탈퇴할까요?
              </p>
              <p className="text-[14px] text-[#777] leading-normal">
                탈퇴하면 프로필, 매칭 정보 등 모든 데이터가 삭제되고 복구할 수 없어요.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80 disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 h-[48px] bg-[#ff3b30] rounded-[4px] text-[16px] font-semibold text-white active:opacity-80 disabled:opacity-60"
              >
                {deleting ? "탈퇴 중..." : "탈퇴"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}
