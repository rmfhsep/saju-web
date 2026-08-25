"use client"

import { useState } from "react"
import { navigateAndReplace } from "@/lib/bridge"

/** 하단 중앙 "계정 탈퇴" 텍스트 버튼 + 확인 모달 (설정/알림 화면 공통). */
export default function DeleteAccountAction() {
  const [show, setShow] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
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
        navigateAndReplace("Landing")
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex justify-center pb-8 pt-4">
        <button
          onClick={() => setShow(true)}
          className="text-[13px] font-normal text-[#949494] active:opacity-70"
        >
          계정 탈퇴
        </button>
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/61" onClick={() => !deleting && setShow(false)} />
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
                onClick={() => setShow(false)}
                disabled={deleting}
                className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80 disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-[48px] bg-[#ff3b30] rounded-[4px] text-[16px] font-semibold text-white active:opacity-80 disabled:opacity-60"
              >
                {deleting ? "탈퇴 중..." : "탈퇴"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
