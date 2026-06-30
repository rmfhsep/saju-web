"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"
import RadioOption from "@/components/ui/radio-option"
import { JOBS, PROFESSIONALS } from "@/modules/profile/constants"

const PROFESSIONAL_JOB_ID = "전문직"

export default function JobEditPage() {
  const router = useRouter()
  const [job, setJob] = useState("")
  const [jobDetail, setJobDetail] = useState("")
  const [q, setQ] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (user?.job) setJob(user.job)
        if (user?.jobDetail) setJobDetail(user.jobDetail)
      })
  }, [])

  const filtered = q ? JOBS.filter(j => j.id.toLowerCase().includes(q.toLowerCase())) : JOBS

  function selectJob(jobId: string) {
    setJob(jobId)
    setJobDetail("")
    setShowDetail(true)
  }

  async function handleSave() {
    if (!jobDetail.trim() || saving) return
    setSaving(true)
    const phone = localStorage.getItem("user_phone") ?? ""
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, job, jobDetail: jobDetail.trim() }),
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  if (showDetail) {
    const isProfessional = job === PROFESSIONAL_JOB_ID
    const filteredPros = isProfessional && jobDetail
      ? PROFESSIONALS.filter(p => p.includes(jobDetail))
      : PROFESSIONALS

    return (
      <Screen>
        <EditHeader title="직업 수정" onBack={() => setShowDetail(false)} />
        <div className="px-5 pt-6 flex flex-col gap-4 shrink-0">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
            {isProfessional ? "전문직 종류를 선택해주세요." : "직무명을 입력해주세요."}
          </h1>
          <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[4px] px-4">
            <input
              type="text"
              placeholder={isProfessional ? "전문직 검색 또는 직접 입력" : "직무명을 입력해주세요."}
              value={jobDetail}
              onChange={e => setJobDetail(e.target.value)}
              className="flex-1 text-[15px] text-[#1f1f1f] placeholder:text-[#9e9e9e] outline-none bg-transparent"
            />
          </div>
        </div>
        {isProfessional && (
          <div className="flex-1 scroll-area overflow-y-auto px-5 mt-2 flex flex-col gap-2">
            {filteredPros.length === 0 ? (
              <p className="text-[14px] text-[#777] leading-relaxed pt-4">검색 결과가 없어요.</p>
            ) : (
              filteredPros.map(p => (
                <RadioOption key={p} label={p} selected={jobDetail === p} onClick={() => setJobDetail(p)} />
              ))
            )}
          </div>
        )}
        <PageFooter>
          <CtaButton disabled={!jobDetail.trim()} loading={saving} onClick={handleSave}>완료</CtaButton>
        </PageFooter>
      </Screen>
    )
  }

  return (
    <Screen>
      <EditHeader title="직업 수정" onBack={() => router.back()} />
      <div className="px-5 pt-6 flex flex-col gap-4 shrink-0">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">직업을 알려주세요.</h1>
        <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[4px] px-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#9e9e9e" strokeWidth="1.4" />
            <path d="M11 11L14 14" stroke="#9e9e9e" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="업종 검색"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 text-[15px] text-[#1f1f1f] placeholder:text-[#9e9e9e] outline-none bg-transparent"
          />
        </div>
      </div>
      <div className="flex-1 scroll-area overflow-y-auto px-5">
        {filtered.length === 0 ? (
          <p className="text-[14px] text-[#777] leading-relaxed pt-4">
            검색 결과가 없어요.<br />업종을 다시 확인해주세요.
          </p>
        ) : (
          filtered.map(j => (
            <button
              key={j.id}
              onClick={() => selectJob(j.id)}
              className={`w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-[15px] transition-colors ${
                job === j.id ? "text-[#1a75ff] font-semibold" : "text-[#1f1f1f] font-medium"
              }`}
            >
              {j.id}
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1l5 5-5 5" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))
        )}
      </div>
    </Screen>
  )
}
