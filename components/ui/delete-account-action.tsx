"use client"

import { useAppRouter } from "@/lib/useAppRouter"

/** 하단 중앙 "계정 탈퇴" 텍스트 버튼 — 탭하면 탈퇴 사유 선택 플로우(app/my/settings/withdraw)로 이동. */
export default function DeleteAccountAction() {
  const router = useAppRouter()

  return (
    <div className="flex justify-center pb-8 pt-4">
      <button
        onClick={() => router.push("/my/settings/withdraw")}
        className="text-[13px] font-normal text-[#949494] active:opacity-70"
      >
        계정 탈퇴
      </button>
    </div>
  )
}
