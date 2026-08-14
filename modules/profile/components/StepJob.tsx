"use client";

import { useState } from "react";
import Screen from "@/components/ui/screen";
import PageFooter from "@/components/ui/page-footer";
import CtaButton from "@/components/ui/cta-button";
import { SearchIcon } from "@/components/ui/icons";
import StepHeader from "./StepHeader";
import { JOBS, PROFESSIONALS } from "../constants";
import type { StepProps } from "../types";

const PROFESSIONAL_JOB_ID = "전문직";

export default function StepJob({
  data,
  onChange,
  onNext,
  onBack,
  step,
}: StepProps) {
  const [q, setQ] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const filtered = q
    ? JOBS.filter((j) => j.id.toLowerCase().includes(q.toLowerCase()))
    : JOBS;

  function selectJob(jobId: string) {
    onChange({ job: jobId, jobDetail: "" });
    setShowDetail(true);
  }

  if (showDetail) {
    const isProfessional = data.job === PROFESSIONAL_JOB_ID;
    const filteredPros =
      isProfessional && data.jobDetail
        ? PROFESSIONALS.filter((p) => p.includes(data.jobDetail))
        : PROFESSIONALS;

    return (
      <Screen>
        <StepHeader
          onBack={() => setShowDetail(false)}
          step={step}
          title="프로필 설정"
        />
        <div className="px-5 pt-5 flex flex-col gap-12 shrink-0">
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
            {isProfessional
              ? "전문직 종류를 선택해주세요."
              : "직무명을 입력해주세요."}
          </h1>
          <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[4px] px-4">
            <input
              type="text"
              placeholder={
                isProfessional
                  ? "전문직 검색 또는 직접 입력"
                  : "직무명을 입력해주세요."
              }
              value={data.jobDetail}
              onChange={(e) => onChange({ jobDetail: e.target.value })}
              className="flex-1 text-[15px] text-[#0f0f10] placeholder:text-[#9e9e9e] outline-none bg-transparent"
            />
          </div>
        </div>
        {isProfessional && (
          <div className="flex-1 scroll-area overflow-y-auto px-5 mt-5">
            {filteredPros.length === 0 ? (
              <p className="text-[14px] text-[#777] leading-relaxed pt-4">
                검색 결과가 없어요.
              </p>
            ) : (
              filteredPros.map((p) => {
                const selected = data.jobDetail === p;
                return (
                  <button
                    key={p}
                    onClick={() => onChange({ jobDetail: p })}
                    className="w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-left"
                  >
                    <span
                      className={`text-[15px] tracking-[-0.15px] font-medium ${
                        selected ? "text-[#1f1f1f]" : "text-[#1f1f1f]"
                      }`}
                    >
                      {p}
                    </span>
                    {selected && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M4 10.5l4.5 4.5L16 6"
                          stroke="#1a73e8"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
        <PageFooter>
          <CtaButton disabled={!data.jobDetail.trim()} onClick={onNext}>
            다음
          </CtaButton>
        </PageFooter>
      </Screen>
    );
  }

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="px-5 pt-5 flex flex-col gap-12 shrink-0">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
          직업을 알려주세요.
        </h1>
        <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[4px] px-4">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="업종 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 text-[15px] text-[#0f0f10] placeholder:text-[#9e9e9e] outline-none bg-transparent"
          />
        </div>
      </div>
      <div className="flex-1 scroll-area overflow-y-auto px-5 mt-5">
        {filtered.length === 0 ? (
          <p className="text-[14px] text-[#777] leading-relaxed pt-4">
            검색 결과가 없어요.
            <br />
            업종을 다시 확인해주세요.
          </p>
        ) : (
          filtered.map((job) => (
            <button
              key={job.id}
              onClick={() => selectJob(job.id)}
              className={`w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-[15px] transition-colors ${
                data.job === job.id
                  ? "text-[#1f1f1f] font-semibold"
                  : "text-[#0f0f10] font-medium"
              }`}
            >
              {job.id}
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path
                  d="M1 1l5 5-5 5"
                  stroke="#b0b0b0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))
        )}
      </div>
      <PageFooter>
        <CtaButton disabled={!data.job} onClick={() => setShowDetail(true)}>
          다음
        </CtaButton>
      </PageFooter>
    </Screen>
  );
}
