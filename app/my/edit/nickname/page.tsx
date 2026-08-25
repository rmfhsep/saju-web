"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import { useMe } from "@/lib/queries/useMe"
import { queryKeys } from "@/lib/queries/keys"

const DISALLOWED_RE = /[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ]/g
const MAX = 12

export default function NicknameEditPage() {
  const router = useAppRouter()
  const queryClient = useQueryClient()
  const meQuery = useMe()
  const [nickname, setNickname] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (meQuery.data?.nickname && !nickname) setNickname(meQuery.data.nickname)
  }, [meQuery.data, nickname])

  const valid = nickname.trim().length > 0 && nickname.trim().length <= MAX

  async function handleSave() {
    if (!valid || saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, nickname: nickname.trim() }),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <EditHeader
        title="닉네임 수정"
        onBack={() => router.back()}
        action={{ label: "저장", onClick: handleSave, disabled: !valid || saving }}
      />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-12 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">닉네임을 입력해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#777] leading-normal">
            내 프로필에 보일 이름이에요.<br />한글 및 영문으로 작성해주세요.
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder={`${MAX}자 이하 한글 및 영문으로 입력해주세요.`}
            value={nickname}
            onChange={e => setNickname(e.target.value.replace(DISALLOWED_RE, "").slice(0, MAX))}
            className="w-full h-[48px] border border-[#dbdcdf] rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff] bg-white"
          />
        </div>
      </div>
    </Screen>
  )
}
