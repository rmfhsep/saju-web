"use client"

import { useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import RadioOption from "@/components/ui/radio-option"
import StepHeader from "./StepHeader"
import { JOBS, PROFESSIONALS } from "../constants"
import type { StepProps } from "../types"

export default function StepJob({ data, onChange, onNext, onBack, step }: StepProps) {
  const [q, setQ] = useState("")
  const [showPro, setShowPro] = useState(false)
  const filtered = q ? JOBS.filter(j => j.id.toLowerCase().includes(q.toLowerCase())) : JOBS

  function selectJob(jobId: string, hasDetail: boolean) {
    if (hasDetail) { setShowPro(true); onChange({ job: jobId, jobDetail: "" }) }
    else { onChange({ job: jobId, jobDetail: "" }) }
  }

  if (showPro) {
    return (
      <Screen>
        <StepHeader onBack={() => { setShowPro(false); onChange({ jobDetail: "" }) }} step={step} title="프로필 설정" />
        <div className="px-5 pt-6 shrink-0">
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">전문직 종류를 선택해주세요.</h1>
        </div>
        <div className="flex-1 scroll-area overflow-y-auto px-5 mt-4 flex flex-col gap-2">
          {PROFESSIONALS.map(p => (
            <RadioOption key={p} label={p} selected={data.jobDetail === p} onClick={() => onChange({ jobDetail: p })} />
          ))}
        </div>
        <PageFooter>
          <CtaButton disabled={!data.jobDetail} onClick={onNext}>다음</CtaButton>
        </PageFooter>
      </Screen>
    )
  }

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="px-5 pt-6 flex flex-col gap-4 shrink-0">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">직업을 알려주세요.</h1>
        <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[8px] px-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#9e9e9e" strokeWidth="1.4"/>
            <path d="M11 11L14 14" stroke="#9e9e9e" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="업종 검색"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 text-[15px] text-[#0f0f10] placeholder:text-[#9e9e9e] outline-none bg-transparent"
          />
        </div>
      </div>
      <div className="flex-1 scroll-area overflow-y-auto px-5">
        {filtered.map(job => (
          <button
            key={job.id}
            onClick={() => selectJob(job.id, job.hasDetail)}
            className={`w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-[15px] transition-colors ${
              data.job === job.id ? "text-[#1a73e8] font-semibold" : "text-[#0f0f10] font-medium"
            }`}
          >
            {job.id}
            {job.hasDetail ? (
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1l5 5-5 5" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : data.job === job.id ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10.5l4.5 4.5L16 6" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </button>
        ))}
      </div>
      <PageFooter>
        <CtaButton disabled={!data.job} onClick={onNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
