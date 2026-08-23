"use client";

import { useEffect, useState } from "react";
import { useAppRouter } from "@/lib/useAppRouter";
import Screen from "@/components/ui/screen";
import EditHeader from "@/components/ui/edit-header";
import { SearchIcon } from "@/components/ui/icons";
import { JOBS, PROFESSIONALS } from "@/modules/profile/constants";

const PROFESSIONAL_JOB_ID = "전문직";

function ListSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <EditHeader title="직업 수정" onBack={onBack} />
      <div className="px-5 pt-6 flex flex-col gap-4 shrink-0">
        <div className="h-[33px] w-[220px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
        <div className="h-[48px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
      </div>
      <div className="flex-1 px-5 pt-2 flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[16px] rounded-[4px] bg-[#f4f4f5] animate-pulse"
            style={{ width: `${60 + (i % 3) * 10}%` }}
          />
        ))}
      </div>
    </Screen>
  );
}

export default function JobEditPage() {
  const router = useAppRouter();
  const [job, setJob] = useState("");
  const [jobDetail, setJobDetail] = useState("");
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.job) setJob(user.job);
        if (user?.jobDetail) setJobDetail(user.jobDetail);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ListSkeleton onBack={() => router.back()} />;

  const isProfessional = job === PROFESSIONAL_JOB_ID;
  const filtered = q
    ? JOBS.filter((j) => j.id.toLowerCase().includes(q.toLowerCase()))
    : JOBS;
  const filteredPros =
    isProfessional && jobDetail
      ? PROFESSIONALS.filter((p) => p.includes(jobDetail))
      : PROFESSIONALS;
  const valid = !!job && !!jobDetail.trim();

  function selectJob(jobId: string) {
    setJob(jobId);
    setJobDetail("");
  }

  // 검색창 스타일로 표시된 선택된 직업을 다시 탭하면 목록으로 되돌아간다
  function resetJob() {
    setJob("");
    setJobDetail("");
    setQ("");
  }

  async function handleSave() {
    if (!valid || saving) return;
    setSaving(true);
    const phone = localStorage.getItem("user_phone") ?? "";
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, job, jobDetail: jobDetail.trim() }),
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <EditHeader
        title="직업 수정"
        onBack={() => router.back()}
        action={{
          label: "저장",
          onClick: handleSave,
          disabled: !valid || saving,
        }}
      />
      <div className="px-5 pt-6 flex flex-col gap-4 shrink-0">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
          직업을 알려주세요.
        </h1>

        {job ? (
          <button
            type="button"
            onClick={resetJob}
            className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[4px] px-4 text-left"
          >
            <SearchIcon size={24} />
            <span className="flex-1 text-[16px] tracking-[-0.32px] text-[#1f1f1f]">
              {job}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[4px] px-4">
            <SearchIcon size={24} />
            <input
              type="text"
              placeholder="업종 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] tracking-[-0.32px] outline-none bg-transparent"
            />
          </div>
        )}
      </div>

      {!job && (
        <div className="flex-1 scroll-area overflow-y-auto px-5">
          {filtered.length === 0 ? (
            <p className="text-[14px] text-[#777] leading-relaxed pt-4">
              검색 결과가 없어요.
              <br />
              업종을 다시 확인해주세요.
            </p>
          ) : (
            filtered.map((j) => (
              <button
                key={j.id}
                onClick={() => selectJob(j.id)}
                className="w-full flex items-center justify-between h-[53px] border-b border-[#eaebec] text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px] text-left"
              >
                {j.id}
                {j.hasDetail && (
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                    <path
                      d="M1 1l5 5-5 5"
                      stroke="#b0b0b0"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {job && isProfessional && (
        <div className="flex-1 min-h-0 flex flex-col gap-3 px-5 mt-3">
          <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[4px] px-4 shrink-0">
            <input
              type="text"
              placeholder="전문직 검색 또는 직접 입력"
              value={jobDetail}
              onChange={(e) => setJobDetail(e.target.value)}
              className="flex-1 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] tracking-[-0.32px] outline-none bg-transparent"
            />
          </div>
          <div className="flex-1 scroll-area overflow-y-auto">
            {filteredPros.length === 0 ? (
              <p className="text-[14px] text-[#777] leading-relaxed pt-4">
                검색 결과가 없어요.
              </p>
            ) : (
              filteredPros.map((p) => {
                const selected = jobDetail === p;
                return (
                  <button
                    key={p}
                    onClick={() => setJobDetail(p)}
                    className="w-full flex items-center justify-between h-[53px] border-b border-[#eaebec] text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px] text-left"
                  >
                    {p}
                    {selected && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M4 10.5l4.5 4.5L16 6"
                          stroke="#1a75ff"
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
        </div>
      )}

      {job && !isProfessional && (
        <div className="mt-3 px-5">
          <input
            type="text"
            placeholder="직무명을 입력해주세요."
            value={jobDetail}
            onChange={(e) => setJobDetail(e.target.value)}
            className="w-full h-[48px] bg-white border border-[#dbdcdf] rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] tracking-[-0.32px] outline-none focus:border-[#90b7ff]"
          />
        </div>
      )}
    </Screen>
  );
}
