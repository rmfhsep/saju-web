"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import Checkbox from "@/components/ui/checkbox"
import TimePickerSheet from "@/components/ui/time-picker-sheet"
import { useMe } from "@/lib/queries/useMe"
import { queryKeys } from "@/lib/queries/keys"

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

/** 선택된 값만 보여주는 비활성 Button/Selected — 수정 불가 필드(성별, 양력/음력)에 사용 */
function SelectedButton({ label, selected }: { label: string; selected: boolean }) {
  return (
    <div
      className={`flex-1 h-[48px] rounded-[4px] flex items-center justify-center text-[16px] font-medium tracking-[-0.32px] ${
        selected ? "bg-[#e9f1ff] border border-[#b6d0ff] text-[#0f0f10]" : "bg-[#f7f7f8] text-[#dfdfdf]"
      }`}
    >
      {label}
    </div>
  )
}

function SelectedField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-semibold text-[#1f1f1f]">{label}</label>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export default function BirthEditPage() {
  const router = useAppRouter()
  const queryClient = useQueryClient()
  const meQuery = useMe()
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [calendarType, setCalendarType] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [unknownTime, setUnknownTime] = useState(false)
  const [birthTime, setBirthTime] = useState("")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    const user = meQuery.data
    if (!user || seeded) return
    setName(user.name ?? "")
    setGender(user.gender ?? "")
    setCalendarType(user.calendarType ?? "")
    setBirthDate(user.birthDate ?? "")
    setUnknownTime(!!user.birthTimeUnknown)
    if (!user.birthTimeUnknown && user.birthTime) setBirthTime(user.birthTime)
    setSeeded(true)
  }, [meQuery.data, seeded])

  useEffect(() => {
    if (!showTimePicker) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prevOverflow }
  }, [showTimePicker])

  const birthDateDisplay = birthDate.length === 8
    ? `${birthDate.slice(0, 4)}.${birthDate.slice(4, 6)}.${birthDate.slice(6, 8)}`
    : ""

  function handleConfirmTime(ampm: string, hour: string, minute: string) {
    setBirthTime(`${ampm} ${hour}:${minute}`)
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
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <EditHeader
        title="출생 정보 수정"
        onBack={() => router.back()}
        action={{ label: "저장", onClick: handleSave, disabled: saving }}
      />
      <div className={`flex-1 px-5 pt-4 flex flex-col gap-5 scroll-area pb-4 ${showTimePicker ? "overflow-hidden" : "overflow-y-auto"}`}>
        <p className="text-[14px] text-[#777] leading-normal">태어난 시간을 제외한 정보는 수정할 수 없어요.</p>

        <ReadOnlyField label="이름" value={name} />

        <SelectedField label="성별">
          <SelectedButton label="남성" selected={gender === "MALE"} />
          <SelectedButton label="여성" selected={gender === "FEMALE"} />
        </SelectedField>

        <SelectedField label="양력/음력">
          <SelectedButton label="양력" selected={calendarType === "SOLAR"} />
          <SelectedButton label="음력" selected={calendarType === "LUNAR"} />
          <SelectedButton label="음력(윤달)" selected={calendarType === "LUNAR_LEAP"} />
        </SelectedField>

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
            <Checkbox
              checked={unknownTime}
              onChange={() => { setUnknownTime(!unknownTime); if (!unknownTime) setBirthTime("") }}
            />
            <span className="text-[15px] font-medium text-[#1f1f1f]">모름</span>
          </label>
        </div>
      </div>

      <TimePickerSheet
        open={showTimePicker}
        initialAmpm={birthTime ? birthTime.split(" ")[0] : undefined}
        initialHour={birthTime ? birthTime.split(" ")[1]?.split(":")[0] : undefined}
        initialMinute={birthTime ? birthTime.split(" ")[1]?.split(":")[1] : undefined}
        onClose={() => setShowTimePicker(false)}
        onConfirm={handleConfirmTime}
      />
    </Screen>
  )
}
