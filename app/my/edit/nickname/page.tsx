"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

const DISALLOWED_RE = /[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ]/g
const MAX = 12

export default function NicknameEditPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => { if (user?.nickname) setNickname(user.nickname) })
      .finally(() => setLoading(false))
  }, [])

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
      router.back()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Screen><EditHeader title="닉네임 수정" onBack={() => router.back()} /></Screen>

  return (
    <Screen>
      <EditHeader title="닉네임 수정" onBack={() => router.back()} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-8 scroll-area overflow-y-auto pb-4">
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
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#9e9e9e]">{nickname.length}/{MAX}</span>
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!valid} loading={saving} onClick={handleSave}>완료</CtaButton>
      </PageFooter>
    </Screen>
  )
}
