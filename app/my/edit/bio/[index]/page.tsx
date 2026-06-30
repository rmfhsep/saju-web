"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

const MIN = 50
const MAX = 500

export default function BioEditPage() {
  const router = useRouter()
  const params = useParams<{ index: string }>()
  const index = parseInt(params.index, 10)

  const [bioTags, setBioTags] = useState<string[]>([])
  const [bio, setBio] = useState<Record<string, string>>({})
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (!user) return
        const tags: string[] = user.bioTags ? JSON.parse(user.bioTags) : []
        const bioObj: Record<string, string> = user.bio ? JSON.parse(user.bio) : {}
        setBioTags(tags)
        setBio(bioObj)
        setText(bioObj[tags[index]] ?? "")
      })
      .finally(() => setLoading(false))
  }, [index])

  const tag = bioTags[index]
  const valid = text.trim().length >= MIN

  async function handleSave() {
    if (!valid || saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    const nextBio = { ...bio, [tag]: text }
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, bio: nextBio }),
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  if (loading || !tag) return <Screen><EditHeader title="자기소개 수정" onBack={() => router.back()} /></Screen>

  return (
    <Screen>
      <EditHeader title="자기소개 수정" onBack={() => router.back()} />
      <div className="flex-1 px-5 pt-2 flex flex-col gap-2 scroll-area overflow-y-auto pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">선택한 태그</span>
          <button
            onClick={() => router.push(`/my/edit/bio/${index}/change-tag`)}
            className="w-6 h-6 flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M12.5 2.5l3 3-9 9-3.5.5.5-3.5 9-9z" stroke="#777" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <span className="h-[36px] w-fit flex items-center px-4 bg-[#e9f1ff] border border-[#b6d0ff] rounded-[4px] text-[13px] font-medium text-[#1f1f1f] mb-2">{tag}</span>
        <div className="relative">
          <textarea
            placeholder={`${MIN}자 이상 작성해주세요.`}
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX))}
            className="w-full h-[124px] border border-[#dbdcdf] rounded-[4px] p-4 text-[15px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff] resize-none"
          />
          <span className="absolute bottom-3 right-3 text-[12px] text-[#9e9e9e]">{text.length}/{MAX}</span>
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!valid} loading={saving} onClick={handleSave}>완료</CtaButton>
      </PageFooter>
    </Screen>
  )
}
