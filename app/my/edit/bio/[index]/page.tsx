"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import TextareaField from "@/components/ui/textarea-field"
import { PencilIcon } from "@/components/ui/icons"

const MIN = 50
const MAX = 500

export default function BioEditPage() {
  const router = useAppRouter()
  const params = useParams<{ index: string }>()
  const index = parseInt(params.index, 10)

  const [bioTags, setBioTags] = useState<string[]>([])
  const [bio, setBio] = useState<Record<string, string>>({})
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showTagConfirm, setShowTagConfirm] = useState(false)

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

  function handleChangeTagClick() {
    // 자기소개가 채워져 있으면 태그 변경 시 작성 내용이 사라질 수 있어 확인 모달 노출
    if (text.trim().length > 0) {
      setShowTagConfirm(true)
      return
    }
    router.push(`/my/edit/bio/${index}/change-tag`)
  }

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
    <Screen className="relative">
      <EditHeader
        title="자기소개 수정"
        onBack={() => router.back()}
        action={{ label: "저장", onClick: handleSave, disabled: !valid || saving }}
      />
      <div className="flex-1 px-5 pt-2 flex flex-col gap-2 scroll-area overflow-y-auto pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">선택한 태그</span>
          <button
            onClick={handleChangeTagClick}
            className="w-6 h-6 flex items-center justify-center"
          >
            <PencilIcon size={18} />
          </button>
        </div>
        <span className="h-[36px] w-fit flex items-center px-4 bg-[#e9f1ff] border border-[#b6d0ff] rounded-[4px] text-[13px] font-medium text-[#1f1f1f] mb-2">{tag}</span>
        <TextareaField
          placeholder={`${MIN}자 이상 작성해주세요.`}
          value={text}
          onChange={setText}
          maxLength={MAX}
          rows={4}
        />
      </div>

      {showTagConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-10">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTagConfirm(false)} />
          <div className="relative w-full max-w-[320px] bg-white rounded-[16px] p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-2 ">
              <h2 className="text-[17px] font-semibold text-[#1f1f1f] tracking-[-0.34px]">태그를 변경할까요?</h2>
              <p className="text-[14px] text-[#777] leading-relaxed tracking-[-0.14px]">
                태그를 변경하면 작성한 자기소개 내용이<br />사라져요.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTagConfirm(false)}
                className="flex-1 h-[48px] rounded-[4px] bg-[#f4f4f5] text-[16px] font-semibold text-[#1f1f1f]"
              >
                취소
              </button>
              <button
                onClick={() => { setShowTagConfirm(false); router.push(`/my/edit/bio/${index}/change-tag`) }}
                className="flex-1 h-[48px] rounded-[4px] bg-[#b6d0ff] text-[16px] font-semibold text-[#1f1f1f]"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}
