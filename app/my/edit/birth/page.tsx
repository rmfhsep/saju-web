"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

const AMPM = ["오전", "오후"]
const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const MINUTES = ["00", "10", "20", "30", "40", "50"]
const ITEM_H = 52

function ScrollColumn({ items, selected, onChange }: {
  items: string[]
  selected: string
  onChange: (v: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const idx = items.indexOf(selected)
    if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onScrollEnd() {
    if (!ref.current) return
    const idx = Math.round(ref.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" })
    onChange(items[clamped])
  }

  return (
    <div className="relative flex-1 h-[156px] overflow-hidden select-none">
      <div className="absolute inset-x-0 -z-10 pointer-events-none rounded-[4px] bg-[#f7f7f8]" style={{ top: ITEM_H, height: ITEM_H }} />
      <div className="absolute inset-x-0 top-0 h-[52px] bg-linear-to-b from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-[52px] bg-linear-to-t from-white to-transparent pointer-events-none z-10" />
      <div
        ref={ref}
        className="h-full overflow-y-scroll no-scrollbar"
        style={{ paddingTop: ITEM_H, paddingBottom: ITEM_H, scrollSnapType: "y mandatory" }}
        onTouchEnd={onScrollEnd}
        onMouseUp={onScrollEnd}
      >
        {items.map(item => (
          <div key={item} className="flex items-center justify-center text-[20px] font-medium text-[#1f1f1f]" style={{ height: ITEM_H, scrollSnapAlign: "center" }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-semibold text-[#1f1f1f]">{label}</label>
      <div className="h-[48px] bg-[#f5f5f5] border border-[#dbdcdf] rounded-[4px] px-4 flex items-center">
        <span className="text-[16px] text-[#777]">{value}</span>
      </div>
    </div>
  )
}

export default function BirthEditPage() {
  const router = useRouter()
  const [calendarType, setCalendarType] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [unknownTime, setUnknownTime] = useState(false)
  const [birthTime, setBirthTime] = useState("")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [pickerAmpm, setPickerAmpm] = useState("오전")
  const [pickerHour, setPickerHour] = useState("9")
  const [pickerMin, setPickerMin] = useState("00")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (!user) return
        setCalendarType(user.calendarType ?? "")
        setBirthDate(user.birthDate ?? "")
        setUnknownTime(!!user.birthTimeUnknown)
        if (!user.birthTimeUnknown && user.birthTime) setBirthTime(user.birthTime)
      })
  }, [])

  useEffect(() => {
    if (!showTimePicker) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prevOverflow }
  }, [showTimePicker])

  const calLabel = calendarType === "LUNAR" ? "음력" : calendarType === "LUNAR_LEAP" ? "음력(윤달)" : "양력"
  const birthDateDisplay = birthDate.length === 8
    ? `${birthDate.slice(0, 4)}.${birthDate.slice(4, 6)}.${birthDate.slice(6, 8)}`
    : ""

  function handleConfirmTime() {
    setBirthTime(`${pickerAmpm} ${pickerHour}:${pickerMin}`)
    setShowTimePicker(false)
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, birthTime: unknownTime ? null : birthTime, birthTimeUnknown: unknownTime }),
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <EditHeader title="출생 정보 수정" onBack={() => router.back()} />
      <div className={`flex-1 px-5 pt-4 flex flex-col gap-5 scroll-area pb-4 ${showTimePicker ? "overflow-hidden" : "overflow-y-auto"}`}>
        <p className="text-[14px] text-[#777] leading-normal">태어난 시간을 제외한 정보는 수정할 수 없어요.</p>

        <ReadOnlyField label="양력/음력" value={calLabel} />
        <ReadOnlyField label="생년월일" value={birthDateDisplay} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#1f1f1f]">태어난 시간</label>
            <button
              type="button"
              disabled={unknownTime}
              onClick={() => !unknownTime && setShowTimePicker(true)}
              className={`h-[48px] border border-[#dbdcdf] rounded-[4px] px-4 flex items-center text-[16px] text-left transition-colors ${
                unknownTime ? "bg-[#f7f7f8] text-[#b7b7b7]" : birthTime ? "bg-white text-[#1f1f1f]" : "bg-white text-[#b7b7b7]"
              }`}
            >
              {unknownTime ? "모름" : birthTime || "오전 9:30"}
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <div
              onClick={() => { setUnknownTime(!unknownTime); if (!unknownTime) setBirthTime("") }}
              className={`w-[18px] h-[18px] border rounded-[4px] flex items-center justify-center shrink-0 cursor-pointer ${
                unknownTime ? "bg-[#0f0f10] border-[#0f0f10]" : "border-[#e1e2e4]"
              }`}
            >
              {unknownTime && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[15px] font-medium text-[#1f1f1f]">모름</span>
          </label>
        </div>
      </div>

      <PageFooter>
        <CtaButton loading={saving} onClick={handleSave}>완료</CtaButton>
      </PageFooter>

      {showTimePicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTimePicker(false)} />
          <div className="relative bg-white rounded-t-[20px] px-5 pt-6 pb-8 flex flex-col gap-5">
            <h2 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">시간을 선택해주세요.</h2>
            <div className="flex items-center gap-2">
              <ScrollColumn items={AMPM} selected={pickerAmpm} onChange={setPickerAmpm} />
              <ScrollColumn items={HOURS} selected={pickerHour} onChange={setPickerHour} />
              <span className="text-[20px] font-medium text-[#1f1f1f] pb-1 shrink-0">:</span>
              <ScrollColumn items={MINUTES} selected={pickerMin} onChange={setPickerMin} />
            </div>
            <button
              onClick={handleConfirmTime}
              className="w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </Screen>
  )
}
