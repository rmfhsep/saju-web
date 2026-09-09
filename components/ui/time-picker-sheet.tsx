"use client"

import { useState } from "react"
import { WheelPicker, WheelPickerWrapper, type WheelPickerOption } from "@ncdai/react-wheel-picker"
import "@ncdai/react-wheel-picker/style.css"

const AMPM: WheelPickerOption<string>[] = ["오전", "오후"].map(v => ({ value: v, label: v }))
const HOURS: WheelPickerOption<string>[] = Array.from({ length: 12 }, (_, i) => String(i + 1)).map(v => ({ value: v, label: v }))
const MINUTES: WheelPickerOption<string>[] = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(v => ({ value: v, label: v }))

const ITEM_HEIGHT = 52

const WHEEL_CLASS_NAMES = {
  optionItem: "text-[20px] font-medium text-[#c7c7c7]",
  highlightItem: "text-[20px] font-medium text-[#1f1f1f]",
  highlightWrapper: "bg-[#f7f7f8] rounded-[4px] mx-1",
}

type TimePickerSheetProps = {
  open: boolean
  initialAmpm?: string
  initialHour?: string
  initialMinute?: string
  onClose: () => void
  onConfirm: (ampm: string, hour: string, minute: string) => void
}

/** 태어난 시간 등 오전/오후·시·분을 고르는 바텀시트 — 온보딩/마이 수정 화면에서 공용으로 쓴다. */
export default function TimePickerSheet({
  open,
  initialAmpm = "오전",
  initialHour = "9",
  initialMinute = "00",
  onClose,
  onConfirm,
}: TimePickerSheetProps) {
  const [ampm, setAmpm] = useState(initialAmpm)
  const [hour, setHour] = useState(initialHour)
  const [minute, setMinute] = useState(initialMinute)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-[20px] px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+36px)] flex flex-col gap-5">
        <h2 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">시간을 선택해주세요.</h2>
        <div className="flex items-center gap-2">
          <WheelPickerWrapper className="flex-1">
            <WheelPicker
              options={AMPM}
              defaultValue={ampm}
              onValueChange={v => setAmpm(String(v))}
              optionItemHeight={ITEM_HEIGHT}
              classNames={WHEEL_CLASS_NAMES}
            />
          </WheelPickerWrapper>
          <WheelPickerWrapper className="flex-1">
            <WheelPicker
              options={HOURS}
              defaultValue={hour}
              onValueChange={v => setHour(String(v))}
              optionItemHeight={ITEM_HEIGHT}
              classNames={WHEEL_CLASS_NAMES}
            />
          </WheelPickerWrapper>
          <span className="text-[20px] font-medium text-[#1f1f1f] pb-1 shrink-0">:</span>
          <WheelPickerWrapper className="flex-1">
            <WheelPicker
              options={MINUTES}
              defaultValue={minute}
              onValueChange={v => setMinute(String(v))}
              optionItemHeight={ITEM_HEIGHT}
              classNames={WHEEL_CLASS_NAMES}
            />
          </WheelPickerWrapper>
        </div>
        <button
          onClick={() => onConfirm(ampm, hour, minute)}
          className="w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80"
        >
          확인
        </button>
      </div>
    </div>
  )
}
