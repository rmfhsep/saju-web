"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import { DEFAULT_TAGS } from "@/modules/profile/constants"

export default function ChangeBioTagPage() {
  const router = useRouter()
  const params = useParams<{ index: string }>()
  const index = parseInt(params.index, 10)

  const [bioTags, setBioTags] = useState<string[]>([])
  const [bio, setBio] = useState<Record<string, string>>({})
  const [pool, setPool] = useState<string[]>(DEFAULT_TAGS)
  const [selected, setSelected] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (!user) return
        const tags: string[] = user.bioTags ? JSON.parse(user.bioTags) : []
        setBioTags(tags)
        setBio(user.bio ? JSON.parse(user.bio) : {})
        setSelected(tags[index] ?? "")
        if (user.recommendedTags) {
          try {
            const rec = JSON.parse(user.recommendedTags)
            const merged = Array.from(new Set([...DEFAULT_TAGS, ...(rec.love ?? []), ...(rec.life ?? [])]))
            setPool(merged)
          } catch { /* keep default pool */ }
        }
      })
  }, [index])

  const currentTag = bioTags[index]
  const otherTags = bioTags.filter((_, i) => i !== index)

  async function handleConfirm() {
    if (!selected || selected === currentTag || saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    const nextTags = [...bioTags]
    nextTags[index] = selected
    const nextBio = { ...bio }
    delete nextBio[currentTag]
    nextBio[selected] = ""
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, bioTags: nextTags, bio: nextBio }),
      })
      router.replace(`/my/edit/bio/${index}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen className="relative">
      <EditHeader title="자기소개 수정" onBack={() => router.back()} />
      <div className="flex-1 px-5 pt-4 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-wrap gap-2">
          {pool.map(tag => {
            const disabled = otherTags.includes(tag) && tag !== selected
            const isSelected = selected === tag
            return (
              <button
                key={tag}
                disabled={disabled}
                onClick={() => setSelected(tag)}
                className={`h-9 px-4 rounded-[4px] border text-[13px] font-medium transition-colors ${
                  disabled ? "bg-[#f4f4f5] border-[#f4f4f5] text-[#b7b7b7]"
                  : isSelected ? "bg-[#e9f1ff] border-[#b6d0ff] text-[#1f1f1f]"
                  : "bg-white border-[#dbdcdf] text-[#1f1f1f]"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!selected || selected === currentTag} onClick={() => setShowConfirm(true)}>변경</CtaButton>
      </PageFooter>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/61" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.32px]">태그를 변경할까요?</p>
              <p className="text-[14px] text-[#777] leading-normal">태그를 변경하면 작성한 소개글이 초기화돼요.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80"
              >
                취소
              </button>
              <CtaButton loading={saving} onClick={handleConfirm} className="flex-1">변경</CtaButton>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}
