"use client"

import { useEffect, useRef, useState } from "react"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"

type Gender = "MALE" | "FEMALE" | ""
type CalendarType = "SOLAR" | "LUNAR" | "LUNAR_LEAP" | ""

function formatBirthDate(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`
}

const AMPM = ["오전", "오후"]
const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const MINUTES = ["00", "10", "20", "30", "40", "50"]
const ITEM_H = 52

function ScrollColumn({
  items,
  selected,
  onChange,
}: {
  items: string[]
  selected: string
  onChange: (v: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const idx = items.indexOf(selected)
    if (ref.current && idx >= 0) {
      ref.current.scrollTop = idx * ITEM_H
    }
  }, [])

  function onScroll() {
    if (!ref.current) return
    const idx = Math.round(ref.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    onChange(items[clamped])
  }

  function onScrollEnd() {
    if (!ref.current) return
    const idx = Math.round(ref.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" })
    onChange(items[clamped])
  }

  return (
    <div className="relative flex-1 h-[156px] overflow-hidden select-none">
      {/* selection highlight */}
      <div
        className="absolute inset-x-0 pointer-events-none rounded-[4px] bg-[#f7f7f8]"
        style={{ top: ITEM_H, height: ITEM_H }}
      />
      {/* top/bottom fades */}
      <div className="absolute inset-x-0 top-0 h-[52px] bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-[52px] bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      <div
        ref={ref}
        className="h-full overflow-y-scroll"
        style={{
          paddingTop: ITEM_H,
          paddingBottom: ITEM_H,
          scrollSnapType: "y mandatory",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        onScroll={onScroll}
        onTouchEnd={onScrollEnd}
        onMouseUp={onScrollEnd}
      >
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-center text-[20px] font-medium text-[#1f1f1f]"
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BirthInfoPage() {
  const [name, setName] = useState("")
  const [gender, setGender] = useState<Gender>("")
  const [calendarType, setCalendarType] = useState<CalendarType>("")
  const [birthDate, setBirthDate] = useState("")
  const [unknownTime, setUnknownTime] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  // picker state
  const [pickerAmpm, setPickerAmpm] = useState("오전")
  const [pickerHour, setPickerHour] = useState("9")
  const [pickerMin, setPickerMin] = useState("00")
  // confirmed time (empty = not set)
  const [birthTime, setBirthTime] = useState("")

  const rawBirthDate = birthDate.replace(/\D/g, "")

  const canProceed =
    name.trim().length > 0 &&
    gender !== "" &&
    calendarType !== "" &&
    rawBirthDate.length === 8

  function handleConfirmTime() {
    setBirthTime(`${pickerAmpm} ${pickerHour}:${pickerMin}`)
    setShowTimePicker(false)
  }

  async function handleNext() {
    if (!canProceed) return
    const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""

    await fetch("/api/auth/birth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        name: name.trim(),
        gender,
        calendarType,
        birthDate: rawBirthDate,
        birthTime: unknownTime ? null : (birthTime || null),
        birthTimeUnknown: unknownTime,
      }),
    }).catch(() => {})

    bridgeNavigate("SajuResult", {
      name: name.trim(),
      gender,
      calendarType,
      bd: rawBirthDate,
      bt: unknownTime ? "" : birthTime,
    })
  }

  const toggleSel = "flex-1 h-[52px] rounded-[8px] text-[15px] font-medium border-0 transition-colors bg-[#e9f1ff] text-[#0f0f10]"
  const toggleUnsel = "flex-1 h-[52px] rounded-[8px] text-[15px] font-medium border-0 transition-colors bg-[#f7f7f8] text-[#777777]"

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="h-[54px] flex items-center px-5">
        <button
          onClick={() => bridgeBack()}
          className="w-8 h-8 flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
        >
          ‹
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4 flex flex-col gap-7 overflow-y-auto pb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.3]">
            정확한 연애운 분석을 위해<br />출생 정보를 알려주세요.
          </h1>
          <p className="text-[15px] text-[#777] leading-normal">
            태어난 시간을 제외한 정보는 수정할 수 없어요.<br />정확하게 입력해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* 이름 */}
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#1f1f1f]">이름</label>
              <span className="text-[12px] font-medium text-[#1a75ff]">필수</span>
            </div>
            <input
              type="text"
              placeholder="김마주"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[52px] border border-[#d8d8d8] rounded-[8px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#0f0f10] bg-white"
            />
          </div>

          {/* 성별 */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#1f1f1f]">성별</label>
              <span className="text-[12px] font-medium text-[#1a75ff]">필수</span>
            </div>
            <div className="flex gap-3">
              {(["MALE", "FEMALE"] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)} className={gender === g ? toggleSel : toggleUnsel}>
                  {g === "MALE" ? "남성" : "여성"}
                </button>
              ))}
            </div>
          </div>

          {/* 양력/음력 */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#1f1f1f]">양력/음력</label>
              <span className="text-[12px] font-medium text-[#1a75ff]">필수</span>
            </div>
            <div className="flex gap-2">
              {(["SOLAR", "LUNAR", "LUNAR_LEAP"] as const).map((c) => (
                <button key={c} onClick={() => setCalendarType(c)} className={calendarType === c ? toggleSel : toggleUnsel}>
                  {c === "SOLAR" ? "양력" : c === "LUNAR" ? "음력" : "음력(윤달)"}
                </button>
              ))}
            </div>
          </div>

          {/* 생년월일 */}
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#1f1f1f]">생년월일</label>
              <span className="text-[12px] font-medium text-[#1a75ff]">필수</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="숫자 8자리 입력 (예시 20000101)"
              value={birthDate}
              onChange={(e) => setBirthDate(formatBirthDate(e.target.value))}
              className="h-[52px] border border-[#d8d8d8] rounded-[8px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#0f0f10] bg-white tracking-wider"
            />
            {rawBirthDate.length > 0 && rawBirthDate.length < 8 && (
              <p className="text-[12px] text-[#ff3b30]">8자리 숫자를 입력해주세요.</p>
            )}
          </div>

          {/* 태어난 시간 */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-semibold text-[#1f1f1f]">태어난 시간</label>
              <button
                type="button"
                disabled={unknownTime}
                onClick={() => !unknownTime && setShowTimePicker(true)}
                className={`h-[52px] border border-[#d8d8d8] rounded-[8px] px-4 flex items-center text-[16px] text-left transition-colors ${
                  unknownTime
                    ? "bg-[#f7f7f8] text-[#b7b7b7]"
                    : birthTime
                    ? "bg-white text-[#1f1f1f]"
                    : "bg-white text-[#b7b7b7]"
                }`}
              >
                {unknownTime ? "모름" : birthTime || "오전 9:30"}
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <div
                onClick={() => {
                  setUnknownTime(!unknownTime)
                  if (!unknownTime) setBirthTime("")
                }}
                className={`w-[18px] h-[18px] border rounded-[4px] flex items-center justify-center shrink-0 cursor-pointer ${
                  unknownTime ? "bg-[#0f0f10] border-[#0f0f10]" : "border-[#d8d8d8]"
                }`}
              >
                {unknownTime && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-[15px] font-medium text-[#1f1f1f]">모름</span>
            </label>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-3">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full h-[52px] rounded-[8px] text-[16px] font-semibold transition-colors ${
            canProceed ? "bg-[#aecbff] text-[#1f1f1f] active:opacity-80" : "bg-[#e8e8e8] text-white"
          }`}
        >
          분석하기
        </button>
      </div>

      {/* 시간 선택 Bottom Sheet */}
      {showTimePicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* dim */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTimePicker(false)} />
          <div className="relative bg-white rounded-t-[20px] px-5 pt-6 pb-8 flex flex-col gap-5">
            <h2 className="text-[18px] font-semibold text-[#1f1f1f]">시간을 선택해주세요.</h2>

            {/* Picker rows */}
            <div className="flex items-center gap-2">
              <ScrollColumn items={AMPM} selected={pickerAmpm} onChange={setPickerAmpm} />
              <ScrollColumn items={HOURS} selected={pickerHour} onChange={setPickerHour} />
              <span className="text-[20px] font-medium text-[#1f1f1f] pb-1 shrink-0">:</span>
              <ScrollColumn items={MINUTES} selected={pickerMin} onChange={setPickerMin} />
            </div>

            <button
              onClick={handleConfirmTime}
              className="w-full h-[52px] rounded-[8px] text-[16px] font-semibold bg-[#aecbff] text-[#1f1f1f] active:opacity-80"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
