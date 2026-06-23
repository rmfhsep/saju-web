"use client"

import { useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import RadioOption from "@/components/ui/radio-option"
import StepHeader from "./StepHeader"
import { JOBS, PROFESSIONALS } from "../constants"
import type { StepProps } from "../types"

const PROFESSIONAL_JOB_ID = "전문직"

export default function StepJob({ data, onChange, onNext, onBack, step }: StepProps) {
  const [q, setQ] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const filtered = q ? JOBS.filter(j => j.id.toLowerCase().includes(q.toLowerCase())) : JOBS

  function selectJob(jobId: string) {
    onChange({ job: jobId, jobDetail: "" })
    setShowDetail(true)
  }

  if (showDetail) {
    const isProfessional = data.job === PROFESSIONAL_JOB_ID
    const filteredPros = isProfessional && data.jobDetail
      ? PROFESSIONALS.filter(p => p.includes(data.jobDetail))
      : PROFESSIONALS

    return (
      <Screen>
        <StepHeader onBack={() => setShowDetail(false)} step={step} title="프로필 설정" />
        <div className="px-5 pt-6 flex flex-col gap-4 shrink-0">
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
            {isProfessional ? "전문직 종류를 선택해주세요." : "직무명을 입력해주세요."}
          </h1>
          <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[8px] px-4">
            <input
              type="text"
              placeholder={isProfessional ? "전문직 검색 또는 직접 입력" : "직무명을 입력해주세요."}
              value={data.jobDetail}
              onChange={e => onChange({ jobDetail: e.target.value })}
              className="flex-1 text-[15px] text-[#0f0f10] placeholder:text-[#9e9e9e] outline-none bg-transparent"
            />
          </div>
        </div>
        {isProfessional && (
          <div className="flex-1 scroll-area overflow-y-auto px-5 mt-2 flex flex-col gap-2">
            {filteredPros.length === 0 ? (
              <p className="text-[14px] text-[#777] leading-relaxed pt-4">검색 결과가 없어요.</p>
            ) : (
              filteredPros.map(p => (
                <RadioOption key={p} label={p} selected={data.jobDetail === p} onClick={() => onChange({ jobDetail: p })} />
              ))
            )}
          </div>
        )}
        <PageFooter>
          <CtaButton disabled={!data.jobDetail.trim()} onClick={onNext}>다음</CtaButton>
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
        {filtered.length === 0 ? (
          <p className="text-[14px] text-[#777] leading-relaxed pt-4">
            검색 결과가 없어요.<br />업종을 다시 확인해주세요.
          </p>
        ) : (
          filtered.map(job => (
            <button
              key={job.id}
              onClick={() => selectJob(job.id)}
              className={`w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-[15px] transition-colors ${
                data.job === job.id ? "text-[#1a73e8] font-semibold" : "text-[#0f0f10] font-medium"
              }`}
            >
              {job.id}
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1l5 5-5 5" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))
        )}
      </div>
      <PageFooter>
        <CtaButton disabled={!data.job} onClick={() => setShowDetail(true)}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
