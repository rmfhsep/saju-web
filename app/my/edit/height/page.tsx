"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

export default function HeightEditPage() {
  const router = useRouter()
  const [height, setHeight] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => { if (user?.height) setHeight(String(user.height)) })
      .finally(() => setLoading(false))
  }, [])

  const valid = /^\d{3}$/.test(height) && +height >= 100 && +height <= 250

  async function handleSave() {
    if (!valid || saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, height }),
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Screen><EditHeader title="키 수정" onBack={() => router.back()} /></Screen>

  return (
    <Screen>
      <EditHeader title="키 수정" onBack={() => router.back()} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-8 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">키를 알려주세요.</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="숫자만 입력해주세요."
            value={height}
            onChange={e => setHeight(e.target.value.replace(/\D/g, "").slice(0, 3))}
            className="flex-1 h-[48px] border border-[#dbdcdf] rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff] bg-white"
          />
          <span className="text-[15px] font-medium text-[#1f1f1f]">cm</span>
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!valid} loading={saving} onClick={handleSave}>완료</CtaButton>
      </PageFooter>
    </Screen>
  )
}
