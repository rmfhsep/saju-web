"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import { useMe } from "@/lib/queries/useMe"
import { queryKeys } from "@/lib/queries/keys"

export default function HeightEditPage() {
  const router = useAppRouter()
  const queryClient = useQueryClient()
  const meQuery = useMe()
  const [height, setHeight] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (meQuery.data?.height && !height) setHeight(String(meQuery.data.height))
  }, [meQuery.data, height])

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
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <EditHeader
        title="키 수정"
        onBack={() => router.back()}
        action={{ label: "저장", onClick: handleSave, disabled: !valid || saving }}
      />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-12 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">키를 알려주세요.</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="숫자만 입력해주세요."
            value={height}
            onChange={e => setHeight(e.target.value.replace(/\D/g, "").slice(0, 3))}
            className="flex-1 min-w-0 h-[48px] border border-[#dbdcdf] rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff] bg-white"
          />
          <span className="text-[20px] font-semibold text-[#1f1f1f] shrink-0">cm</span>
        </div>
      </div>
    </Screen>
  )
}
