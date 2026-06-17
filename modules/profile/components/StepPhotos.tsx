"use client"

import { useRef, useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

export default function StepPhotos({ data, onChange, onNext, onBack, step }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const slots = [...data.photos, ...Array(Math.max(0, 5 - data.photos.length)).fill("")]

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || activeSlot === null) return
    const url = URL.createObjectURL(file)
    const next = [...data.photos]
    if (activeSlot < next.length) next[activeSlot] = url
    else next.push(url)
    onChange({ photos: next })
    e.target.value = ""
  }

  function openSlot(idx: number) { setActiveSlot(idx); fileRef.current?.click() }

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-4 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">프로필 사진을 2장 이상<br />등록해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b]">정면 사진 2장은 필수예요.</p>
          <p className="mt-[2px] text-[13px] text-[#e53935]">가이드에 위배되는 사진은 경고를 받을 수 있습니다.</p>
          <button className="mt-3 px-4 h-[28px] border border-[#d0d0d0] rounded-full text-[13px] text-[#6b6b6b] flex items-center">
            사진 등록 가이드
          </button>
        </div>
        <div className="flex flex-col gap-[8px]">
          <div className="flex gap-[8px]">
            {[0, 1].map(i => (
              <PhotoSlot key={i} url={slots[i]} required onClick={() => openSlot(i)} />
            ))}
          </div>
          <div className="flex gap-[8px]">
            {[2, 3, 4].map(i => (
              <PhotoSlot key={i} url={slots[i]} onClick={() => openSlot(i)} />
            ))}
          </div>
        </div>
        <p className="text-[13px] text-[#9e9e9e] text-center">길게 눌러 순서를 변경할 수 있어요.</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <PageFooter>
        <CtaButton disabled={data.photos.length < 2} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}

function PhotoSlot({ url, required, onClick }: { url: string; required?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-1 rounded-[10px] border-[1.5px] border-dashed border-[#d0d0d0] bg-[#f5f5f7] flex items-center justify-center overflow-hidden"
      style={{ aspectRatio: "1/1" }}
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
  )
}
