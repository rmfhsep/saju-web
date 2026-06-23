"use client"

import { useRef, useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

const MAX_PHOTOS = 5

const GUIDE_RULES = [
  "본인의 얼굴이 선명하게 보이는 사진을 등록해주세요.",
  "타인의 사진, 캐릭터, 풍경 등 본인이 아닌 사진은 삭제될 수 있어요.",
  "노출이 심하거나 선정적인 사진은 등록할 수 없어요.",
  "과도한 보정, 필터가 적용된 사진은 매칭에 불리할 수 있어요.",
]

export default function StepPhotos({ data, onChange, onNext, onBack, step }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [uploading, setUploading] = useState(false)
  const slots = [...data.photos, ...Array(Math.max(0, MAX_PHOTOS - data.photos.length)).fill("")]

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0 || activeSlot === null) return

    setUploading(true)
    try {
      const phone = localStorage.getItem("user_phone") ?? ""
      const formData = new FormData()
      formData.append("phone", phone)
      files.slice(0, MAX_PHOTOS - activeSlot).forEach(file => formData.append("files", file))

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const result = await res.json()
      if (!res.ok || !Array.isArray(result.urls)) return

      const next = [...data.photos]
      let slot = activeSlot
      for (const url of result.urls as string[]) {
        if (slot >= MAX_PHOTOS) break
        if (slot < next.length) next[slot] = url
        else next.push(url)
        slot++
      }
      onChange({ photos: next.slice(0, MAX_PHOTOS) })
    } finally {
      setUploading(false)
    }
  }

  function openSlot(idx: number) {
    if (uploading) return
    setActiveSlot(idx)
    fileRef.current?.click()
  }
  function deletePhoto(idx: number) { onChange({ photos: data.photos.filter((_, i) => i !== idx) }) }

  return (
    <Screen className="relative">
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-4 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">프로필 사진을 2장 이상<br />등록해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b]">정면 사진 2장은 필수예요.</p>
          <p className="mt-[2px] text-[13px] text-[#e53935]">가이드에 위배되는 사진은 경고를 받을 수 있습니다.</p>
          <button onClick={() => setShowGuide(true)} className="mt-3 px-4 h-[28px] border border-[#d0d0d0] rounded-full text-[13px] text-[#6b6b6b] flex items-center">
            사진 등록 가이드
          </button>
        </div>
        <div className="flex flex-col gap-[8px]">
          <div className="flex gap-[8px]">
            {[0, 1].map(i => (
              <PhotoSlot key={i} url={slots[i]} required onClick={() => openSlot(i)} onDelete={() => deletePhoto(i)} />
            ))}
          </div>
          <div className="flex gap-[8px]">
            {[2, 3, 4].map(i => (
              <PhotoSlot key={i} url={slots[i]} onClick={() => openSlot(i)} onDelete={() => deletePhoto(i)} />
            ))}
          </div>
        </div>
        <p className="text-[13px] text-[#9e9e9e] text-center">
          {uploading ? "사진을 업로드하는 중이에요..." : "사진을 여러 장 한 번에 선택할 수 있어요."}
        </p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <PageFooter>
        <CtaButton disabled={data.photos.length < 2 || uploading} onClick={onNext}>다음</CtaButton>
      </PageFooter>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/61" onClick={() => setShowGuide(false)} />
          <div className="relative bg-white rounded-t-[28px] pt-8 pb-8 px-5 flex flex-col gap-6">
            <h2 className="text-[18px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.36px]">
              사진 등록 가이드
            </h2>
            <ul className="flex flex-col gap-3">
              {GUIDE_RULES.map(rule => (
                <li key={rule} className="text-[14px] text-[#4a4a4a] leading-relaxed flex gap-2">
                  <span className="text-[#1a73e8]">•</span>{rule}
                </li>
              ))}
            </ul>
            <CtaButton onClick={() => setShowGuide(false)}>확인</CtaButton>
          </div>
        </div>
      )}
    </Screen>
  )
}

function PhotoSlot({ url, required, onClick, onDelete }: {
  url: string
  required?: boolean
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div className="relative flex-1" style={{ aspectRatio: "1/1" }}>
      <button
        onClick={onClick}
        className="absolute inset-0 rounded-[10px] border-[1.5px] border-dashed border-[#d0d0d0] bg-[#f5f5f7] flex items-center justify-center overflow-hidden"
      >
        {url ? (
          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            {required && (
              <span className="absolute top-2 left-2 bg-[#1a73e8] text-white text-[11px] font-semibold px-2 py-[2px] rounded-full leading-none">필수</span>
            )}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#d0d0d0" strokeWidth="1.5"/>
              <path d="M16 10v12M10 16h12" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </>
        )}
      </button>
      {url && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute top-1 right-1 w-[20px] h-[20px] rounded-full bg-black/60 flex items-center justify-center"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}
