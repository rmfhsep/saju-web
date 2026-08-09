"use client"

import { useState } from "react"

interface TextareaFieldProps {
  /** 필드 상단 라벨 (예: "메시지 작성") — 생략 시 라벨 행을 렌더링하지 않는다. */
  label?: string
  /** 라벨 옆 "필수" 뱃지 */
  required?: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 지정 시 값이 이 길이로 잘리고, 박스 안에 "n/max" 카운터가 표시된다. */
  maxLength?: number
  rows?: number
  disabled?: boolean
  /** 존재하면 Negative(에러) 상태로 전환되고, 캡션에 빨간색으로 표시된다. */
  error?: string
  /** error가 없을 때 캡션에 표시되는 보조 설명. */
  helperText?: string
  className?: string
}

// 디자인 시스템 Inputfield/Textarea(112:2043) 기준 — Normal/Negative × focus × disabled 상태 대응
export default function TextareaField({
  label,
  required,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
  disabled = false,
  error,
  helperText,
  className,
}: TextareaFieldProps) {
  const [focused, setFocused] = useState(false)
  const negative = !!error
  const caption = error ?? helperText

  const boxClass = disabled
    ? "bg-[#f5f5f5] border border-[#dbdcdf]"
    : negative
      ? focused ? "bg-white border-[1.5px] border-[#ffb5b5]" : "bg-white border border-[#ffb5b5]"
      : focused ? "bg-white border-[1.5px] border-[#90b7ff]" : "bg-white border border-[#dbdcdf]"

  return (
    <div className={className ?? "w-full flex flex-col gap-2"}>
      {label && (
        <div className="flex items-center gap-1">
          <span className="text-body3Semibold text-[#1f1f1f]">{label}</span>
          {required && <span className="text-[12px] font-medium text-[#1a75ff]">필수</span>}
        </div>
      )}
      <div className={`flex flex-col gap-[14px] rounded-[4px] px-4 py-3 transition-colors ${boxClass}`}>
        <textarea
          value={value}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => onChange(maxLength != null ? e.target.value.slice(0, maxLength) : e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full resize-none outline-none bg-transparent text-[15px] leading-[1.5] tracking-[-0.3px] placeholder:text-[#b7b7b7] ${disabled ? "text-[#777]" : "text-[#1f1f1f]"}`}
        />
        {maxLength != null && (
          <div className={`text-right text-[12px] font-medium ${disabled ? "text-[#b7b7b7]" : "text-[#777]"}`}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      {caption && (
        <p className={`text-[12px] leading-[1.4] ${negative && !disabled ? "text-[#ff334b]" : "text-[#777]"}`}>{caption}</p>
      )}
    </div>
  )
}
