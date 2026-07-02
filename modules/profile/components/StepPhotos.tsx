"use client"

import { useRef, useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

const MAX_PHOTOS = 5
const LONG_PRESS_MS = 350
const MOVE_CANCEL_PX = 8

function PlusIcon() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#f4f4f5] flex items-center justify-center">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 11V1M1 6H11" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function DeleteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1f1f1f" opacity="0.61" />
      <path d="M15.5 8.5l-7 7M8.5 8.5l7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GuideRow({ good, children }: { good?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-center">
      {good ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <circle cx="10" cy="10" r="10" fill="#1a75ff" />
          <path d="M5.5 10.2l3 3 6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <circle cx="10" cy="10" r="10" fill="#ff334b" />
          <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      <p className="flex-1 text-[14px] text-[#1f1f1f] leading-relaxed tracking-[-0.14px]">{children}</p>
    </div>
  )
}

function PhotoSlot({ url, required, loading, dragging, onOpen, onDelete, onPointerDown, slotRef }: {
  url: string
  required?: boolean
  loading?: boolean
  dragging?: boolean
  onOpen: () => void
  onDelete: () => void
  onPointerDown: (e: React.PointerEvent) => void
  slotRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={slotRef}
      onPointerDown={url ? onPointerDown : undefined}
      style={{ touchAction: url ? "none" : "auto" }}
      className={`relative flex-1 aspect-square transition-transform ${dragging ? "scale-105 opacity-80 z-10" : ""}`}
    >
      <button
        type="button"
        onClick={url || loading ? undefined : onOpen}
        className="absolute inset-0 rounded-[8px] border border-dashed border-[#dfdfdf] bg-white flex items-center justify-center overflow-hidden"
      >
        {loading ? (
          /* 업로드 중 슬롯별 스피너 */
          <div className="absolute inset-0 bg-[#f4f4f5] flex items-center justify-center rounded-[8px]">
            <div className="w-6 h-6 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : url ? (
          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" />
        ) : (
          <PlusIcon />
        )}
      </button>
      {required && !loading && (
        <span className="absolute top-2 left-2 bg-[#1a75ff] text-white text-[12px] font-medium px-[6px] py-px rounded-[20px] leading-[1.4]">
          필수
        </span>
      )}
      {url && !loading && (
        <button type="button" onClick={e => { e.stopPropagation(); onDelete() }} className="absolute -top-2 -right-2 w-6 h-6">
          <DeleteIcon />
        </button>
      )}
    </div>
  )
}

export default function StepPhotos({ data, onChange, onNext, onBack, step }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState<Set<number>>(new Set())
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressStart = useRef<{ x: number; y: number } | null>(null)

  const isUploading = loadingSlots.size > 0
  const slots = [...data.photos, ...Array(Math.max(0, MAX_PHOTOS - data.photos.length)).fill("")]

  async function uploadSingleFile(file: File): Promise<string | null> {
    const phone = localStorage.getItem("user_phone") ?? ""
    const fd = new FormData()
    fd.append("phone", phone)
    fd.append("files", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const result = await res.json()
      if (res.ok && Array.isArray(result.urls) && result.urls[0]) {
        return result.urls[0] as string
      }
    } catch { /* 개별 실패 무시 */ }
    return null
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    const currentCount = data.photos.length
    const remaining = MAX_PHOTOS - currentCount
    if (files.length === 0 || remaining <= 0) return

    const toUpload = files.slice(0, remaining)
    // 업로드될 슬롯 인덱스를 미리 계산해 스피너 표시
    const pendingSlots = new Set(toUpload.map((_, i) => currentCount + i))
    setLoadingSlots(pendingSlots)

    try {
      // 파일별 개별 업로드 — 하나 실패해도 나머지는 성공
      const results = await Promise.allSettled(toUpload.map(uploadSingleFile))
      const uploaded: string[] = []
      results.forEach(r => {
        if (r.status === "fulfilled" && r.value) uploaded.push(r.value)
      })
      if (uploaded.length > 0) {
        onChange({ photos: [...data.photos, ...uploaded].slice(0, MAX_PHOTOS) })
      }
    } finally {
      setLoadingSlots(new Set())
    }
  }

  function openPicker() {
    if (isUploading || data.photos.length >= MAX_PHOTOS) return
    fileRef.current?.click()
  }

  function deletePhoto(idx: number) {
    onChange({ photos: data.photos.filter((_, i) => i !== idx) })
  }

  function clearPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = null
    pressStart.current = null
  }

  function handleSlotPointerDown(idx: number, e: React.PointerEvent) {
    if (idx >= data.photos.length) return
    pressStart.current = { x: e.clientX, y: e.clientY }
    pressTimer.current = setTimeout(() => setDragIndex(idx), LONG_PRESS_MS)
  }

  function handleGridPointerMove(e: React.PointerEvent) {
    if (dragIndex === null) {
      if (pressStart.current) {
        const dx = Math.abs(e.clientX - pressStart.current.x)
        const dy = Math.abs(e.clientY - pressStart.current.y)
        if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) clearPress()
      }
      return
    }
    const overIdx = slotRefs.current.findIndex(el => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    })
    if (overIdx === -1 || overIdx === dragIndex || overIdx >= data.photos.length) return
    const next = [...data.photos]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(overIdx, 0, moved)
    onChange({ photos: next })
    setDragIndex(overIdx)
  }

  function handleGridPointerUp() {
    clearPress()
    setDragIndex(null)
  }

  return (
    <Screen className="relative">
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-9 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
            프로필 사진을 2장 이상<br />등록해주세요.
          </h1>
          <p className="text-[15px] text-[#777] leading-relaxed tracking-[-0.3px]">
            정면 사진 2장은 필수예요.<br />
            <span className="text-[#ff334b]">가이드에 위배되는 사진은 경고를 받을 수 있습니다.</span>
          </p>
          <button
            onClick={() => setShowGuide(true)}
            className="h-[28px] px-3 rounded-[4px] bg-[#e9f1ff] text-[12px] font-medium text-[#1a75ff] flex items-center w-fit"
          >
            사진 등록 가이드
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="flex flex-col gap-2"
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
            onPointerCancel={handleGridPointerUp}
          >
            <div className="flex gap-2">
              {[0, 1].map(i => (
                <PhotoSlot
                  key={i}
                  url={slots[i]}
                  required
                  loading={loadingSlots.has(i)}
                  dragging={dragIndex === i}
                  onOpen={openPicker}
                  onDelete={() => deletePhoto(i)}
                  onPointerDown={e => handleSlotPointerDown(i, e)}
                  slotRef={el => { slotRefs.current[i] = el }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {[2, 3, 4].map(i => (
                <PhotoSlot
                  key={i}
                  url={slots[i]}
                  loading={loadingSlots.has(i)}
                  dragging={dragIndex === i}
                  onOpen={openPicker}
                  onDelete={() => deletePhoto(i)}
                  onPointerDown={e => handleSlotPointerDown(i, e)}
                  slotRef={el => { slotRefs.current[i] = el }}
                />
              ))}
            </div>
          </div>
          <p className="text-[12px] text-[#777] text-center">길게 눌러 순서를 변경할 수 있어요.</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <PageFooter>
        <CtaButton disabled={data.photos.length < 2 || isUploading} onClick={onNext}>다음</CtaButton>
      </PageFooter>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/61" onClick={() => setShowGuide(false)} />
          <div className="relative bg-white rounded-t-[28px] pt-3 pb-8 flex flex-col items-center gap-6">
            <div className="w-11 h-1 rounded-full bg-[#dfdfdf]" />
            <div className="w-full px-5 flex flex-col gap-7">
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">사진 등록 가이드</h2>
                <p className="text-[14px] text-[#777] leading-relaxed tracking-[-0.14px]">
                  마주 이용을 위해 프로필 사진 2장이 필요해요.<br />
                  가이드에 위배되는 사진은 경고를 받을 수 있습니다.
                </p>
              </div>
              <div className="bg-[#f7f7f8] rounded-[8px] p-4 flex flex-col gap-4">
                <GuideRow good>필수 사진 2장은 얼굴이 잘 보이는 정면 사진을<br />등록해주세요.</GuideRow>
                <GuideRow good>추가 사진은 나의 스타일을 잘 보여줄 수 있는<br />상반신, 전신 사진을 추천해요.</GuideRow>
                <GuideRow>얼굴을 부분적으로 가리거나 잘 보이지 않는 사진</GuideRow>
                <GuideRow>과한 보정이나 효과, AI를 사용한 사진</GuideRow>
                <GuideRow>본인이 누군지 알 수 없는 단체 사진</GuideRow>
                <GuideRow>중복이거나 비슷한 사진</GuideRow>
                <GuideRow>상대방에게 불쾌감을 주는 사진 (욕설, 표정, 제스처 등)</GuideRow>
              </div>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}
