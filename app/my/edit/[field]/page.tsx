"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import RadioOption from "@/components/ui/radio-option"
import {
  SMOKING_OPTIONS, DRINKING_OPTIONS, DATING_OPTIONS, POLITICS_OPTIONS, RELIGION_OPTIONS,
} from "@/modules/profile/constants"

const FIELD_CONFIG: Record<string, { title: string; options: string[] }> = {
  smoking: { title: "흡연 여부 수정", options: SMOKING_OPTIONS },
  drinking: { title: "음주 빈도 수정", options: DRINKING_OPTIONS },
  datingPurpose: { title: "연애 목적 수정", options: DATING_OPTIONS },
  politics: { title: "정치 성향 수정", options: POLITICS_OPTIONS },
  religion: { title: "종교 수정", options: RELIGION_OPTIONS },
}

export default function FieldEditPage() {
  const router = useAppRouter()
  const params = useParams<{ field: string }>()
  const config = FIELD_CONFIG[params.field]

  const [value, setValue] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!config) return
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => { if (user?.[params.field]) setValue(user[params.field]) })
  }, [config, params.field])

  if (!config) return null

  async function handleSave() {
    if (!value || saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, [params.field]: value }),
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <EditHeader
        title={config.title}
        onBack={() => router.back()}
        action={{ label: "저장", onClick: handleSave, disabled: !value || saving }}
      />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-[10px]">
          {config.options.map(opt => (
            <RadioOption key={opt} label={opt} selected={value === opt} onClick={() => setValue(opt)} />
          ))}
        </div>
      </div>
    </Screen>
  )
}
