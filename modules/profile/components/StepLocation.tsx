"use client"

import { useRef, useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import StepHeader from "./StepHeader"
import { ALL_LOCATIONS } from "../constants"
import type { StepProps } from "../types"

export default function StepLocation({ data, onChange, onNext, onBack, step }: StepProps) {
  const [q, setQ] = useState(data.location)
  const inputRef = useRef<HTMLInputElement>(null)

  const trimmed = q.trim()
  const results = trimmed
    ? ALL_LOCATIONS.filter(l => l.replace(/\s/g, "").includes(trimmed.replace(/\s/g, "")))
    : []

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="px-5 pt-6 pb-4 shrink-0">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35] mb-6">거주지를 알려주세요.</h1>
        <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[8px] px-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#1f1f1f" strokeWidth="1.6"/>
            <path d="M16.5 16.5L20 20" stroke="#1f1f1f" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="시·군·구 검색"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 text-[16px] text-[#1f1f1f] placeholder:text-[#9e9e9e] outline-none bg-transparent tracking-[-0.32px]"
          />
          {q && (
            <button onClick={() => { setQ(""); inputRef.current?.focus() }}
              className="w-[20px] h-[20px] flex items-center justify-center rounded-full bg-[#9e9e9e]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 scroll-area overflow-y-auto px-5">
        {!trimmed ? (
          <p className="text-[14px] text-[#777] leading-relaxed pt-4">
            시·군·구를 검색해주세요.
          </p>
        ) : results.length === 0 ? (
          <p className="text-[14px] text-[#777] leading-relaxed pt-4">
            검색 결과가 없어요.<br />주소를 다시 확인해주세요.
          </p>
        ) : (
          results.map(loc => {
            const selected = data.location === loc
            return (
              <button
                key={loc}
                onClick={() => { onChange({ location: loc }); setQ(loc) }}
                className="w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-left"
              >
                <span className={`text-[15px] tracking-[-0.15px] font-medium ${selected ? "text-[#1a73e8]" : "text-[#1f1f1f]"}`}>
                  {loc}
                </span>
                {selected && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10.5l4.5 4.5L16 6" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )
          })
        )}
      </div>
      <PageFooter>
        <CtaButton disabled={!data.location} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
