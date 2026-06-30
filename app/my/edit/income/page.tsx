"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import { INCOME_OPTIONS } from "@/modules/profile/constants"

function IncomeCell({ opt, selected, onClick }: { opt: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 h-[48px] rounded-[4px] transition-colors text-left ${
        selected ? "bg-[#e9f1ff] border border-[#b6d0ff]" : "bg-[#f7f7f8] border border-transparent"
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#1a75ff]" : "border-[#ccc]"}`}>
        {selected && <div className="w-[9px] h-[9px] rounded-full bg-[#1a75ff]" />}
      </div>
      <span className={`text-[14px] ${selected ? "font-semibold text-[#1f1f1f]" : "text-[#4a4a4a]"}`}>{opt}</span>
    </button>
  )
}

export default function IncomeEditPage() {
  const router = useRouter()
  const [income, setIncome] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => { if (user?.income) setIncome(user.income) })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!income || saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, income }),
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Screen><EditHeader title="연봉 수정" onBack={() => router.back()} /></Screen>

  return (
    <Screen>
      <EditHeader title="연봉 수정" onBack={() => router.back()} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <p className="text-[13px] text-[#ff3b30]">연봉 정보는 프로필에 공개되지 않아요.</p>
        <div className="grid grid-cols-2 gap-2">
          {INCOME_OPTIONS.slice(0, 8).map(opt => (
            <IncomeCell key={opt} opt={opt} selected={income === opt} onClick={() => setIncome(opt)} />
          ))}
          <IncomeCell opt={INCOME_OPTIONS[8]} selected={income === INCOME_OPTIONS[8]} onClick={() => setIncome(INCOME_OPTIONS[8])} />
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!income} loading={saving} onClick={handleSave}>완료</CtaButton>
      </PageFooter>
    </Screen>
  )
}
