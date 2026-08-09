"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import { CloseIcon, CloseCircleIcon } from "@/components/ui/icons"
import { DEFAULT_TAGS } from "@/modules/profile/constants"

function Toast({ message }: { message: string }) {
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-[296px] w-max text-center bg-black/74 text-white text-[14px] font-medium px-6 py-3 rounded-[6px] z-20 tracking-[-0.14px]">
      {message}
    </div>
  )
}

export default function ChangeBioTagPage() {
  const router = useRouter()
  const params = useParams<{ index: string }>()
  const index = parseInt(params.index, 10)

  const [bioTags, setBioTags] = useState<string[]>([])
  const [bio, setBio] = useState<Record<string, string>>({})
  // 나의 성향 태그는 8개까지만 노출(온보딩과 동일한 규칙) — 직접 입력한 태그는 별도로 붙는다.
  const [suggested, setSuggested] = useState<string[]>(DEFAULT_TAGS)
  const [customTags, setCustomTags] = useState<string[]>([])
  const [selected, setSelected] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [customInput, setCustomInput] = useState("")
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

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

        let sugg = DEFAULT_TAGS
        if (user.recommendedTags) {
          try {
            const rec = JSON.parse(user.recommendedTags)
            sugg = [...(rec.love ?? []), ...(rec.life ?? [])].slice(0, 8)
            setSuggested(sugg)
          } catch { /* keep default pool */ }
        }
        // 추천 목록에 없는 기존 태그는 예전에 직접 입력했던 태그이므로 풀에 유지한다
        setCustomTags(tags.filter(t => !sugg.includes(t)))
      })
  }, [index])

  const currentTag = bioTags[index]
  const otherTags = bioTags.filter((_, i) => i !== index)
  // 추천 8개 + 사용자가 직접 입력한 커스텀 태그만 추가로 노출
  const pool = [...suggested, ...customTags]

  function flashToast(message: string) {
    setToastMsg(message)
    setTimeout(() => setToastMsg(null), 2000)
  }

  function addCustom() {
    const t = customInput.trim()
    if (!t) return
    if (customTags.length >= 3) {
      flashToast("직접 입력한 태그는 최대 3개까지 추가할 수 있어요.")
      return
    }
    setCustomTags(prev => [...prev, t])
    setSelected(t)
    setCustomInput("")
  }

  function removeCustomTag(tag: string) {
    setCustomTags(prev => prev.filter(t => t !== tag))
    if (selected === tag) setSelected("")
  }

  function closeCustomModal() {
    setShowCustomModal(false)
    setCustomInput("")
  }

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
      <EditHeader title="태그 선택" onBack={() => router.back()} />
      <div className="flex-1 px-5 pt-4 flex flex-col gap-9 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-wrap gap-2">
          {pool.map(tag => {
            const disabled = otherTags.includes(tag) && tag !== selected
            const isSelected = selected === tag
            return (
              <button
                key={tag}
                disabled={disabled}
                onClick={() => setSelected(tag)}
                className={`h-9 px-4 rounded-[4px] text-[13px] font-medium transition-colors flex items-center ${
                  disabled ? "bg-[#f7f7f8] text-[#dfdfdf]"
                  : isSelected ? "bg-[#e9f1ff] border border-[#b6d0ff] text-[#1f1f1f]"
                  : "bg-[#f7f7f8] text-[#777]"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="h-9 px-4 rounded-[4px] bg-[#f4f4f5] text-[13px] font-medium text-[#1f1f1f] w-fit flex items-center"
        >
          태그 직접 입력
        </button>
      </div>
      <PageFooter>
        <CtaButton disabled={!selected || selected === currentTag} onClick={() => setShowConfirm(true)}>완료</CtaButton>
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

      {/* 태그 직접 입력 — 온보딩(StepBioTags)과 동일한 칩 추가 UI (Figma 161:3568/3602/3640) */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ height: "var(--app-height, 100dvh)" }}>
          <div className="h-[52px] flex items-center gap-3 px-5 shrink-0">
            <button onClick={closeCustomModal} className="w-6 h-6 flex items-center justify-center">
              <CloseIcon size={20} />
            </button>
            <h2 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">태그 직접 입력</h2>
          </div>

          <div className="flex-1 px-5 pt-5 flex flex-col gap-9 scroll-area overflow-y-auto">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.nativeEvent.isComposing && addCustom()}
                placeholder="입력 후 엔터를 누르세요."
                autoFocus
                className="h-[48px] border border-[#dbdcdf] rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff] tracking-[-0.32px]"
              />
              <p className="text-[12px] text-[#777]">최대 3개</p>
            </div>

            {customTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customTags.map(tag => (
                  <span key={tag} className="h-9 pl-4 pr-3 rounded-[4px] bg-[#f7f7f8] text-[13px] font-medium text-[#777] flex items-center gap-1.5">
                    {tag}
                    <button onClick={() => removeCustomTag(tag)} className="w-4 h-4 flex items-center justify-center">
                      <CloseCircleIcon size={16} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {toastMsg && <Toast message={toastMsg} />}

          <PageFooter>
            <CtaButton disabled={customTags.length === 0} onClick={closeCustomModal}>추가</CtaButton>
          </PageFooter>
        </div>
      )}
    </Screen>
  )
}
