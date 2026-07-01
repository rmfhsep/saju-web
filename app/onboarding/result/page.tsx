"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"
import type { SajuReport } from "@/lib/prompts/sajuReport"

const MALE_PROFILES = [
  {
    name: "미미미", age: "31살",
    tags: ["천천히 가까워지는", "감정표현 풍부", "깔끔한 스타일 선호"],
    grad: "linear-gradient(160deg, #b5b0d6 0%, #8b7aa8 100%)",
  },
  {
    name: "통레조", age: "27살",
    tags: ["천천히 가까워지는", "감정표현 풍부", "깔끔한 스타일 선호"],
    grad: "linear-gradient(160deg, #a8c4b0 0%, #6b9e7a 100%)",
  },
]

function formatBirthDisplay(bd: string, bt: string, calendarType: string): string {
  const calLabel =
    calendarType === "SOLAR" ? "양력" :
    calendarType === "LUNAR" ? "음력" :
    calendarType === "LUNAR_LEAP" ? "음력(윤달)" : "양력"

  let dateStr = bd
  if (bd && bd.length === 8) {
    const y = bd.slice(0, 4)
    const m = parseInt(bd.slice(4, 6))
    const d = parseInt(bd.slice(6, 8))
    dateStr = `${y}년 ${m}월 ${d}일`
  }

  if (!bt) return `${calLabel} ${dateStr} (출생시 모름)`
  return `${calLabel} ${dateStr} ${bt} 출생`
}

const LEVEL_LABEL: Record<string, string> = { HIGH: "활발", MID: "보통", LOW: "잔잔" }

// 4축 점수 막대 (표현/감정깊이/주도성/집착도)
function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-[12px] font-semibold text-[#1a75ff]">{score}</span>
      <div className="w-4 h-[120px] flex items-end">
        <div
          className="w-full bg-gradient-to-b from-[#b6d0ff] to-[#e4eeff] rounded-[30px] transition-all"
          style={{ height: `${Math.max(4, score)}%` }}
        />
      </div>
      <span className="text-[12px] text-[#777] text-center leading-tight">{label}</span>
    </div>
  )
}

// 섹션1: 나의 연애 기질
function TemperamentCard({ section }: { section: SajuReport["섹션1_연애기질"] }) {
  const axes = [
    { key: "표현", ...section.표현방식 },
    { key: "감정 깊이", ...section.감정깊이 },
    { key: "주도성", ...section.주도성 },
    { key: "집착도", ...section.집착도 },
  ]
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] px-5 py-4 flex flex-col gap-4">
      <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">나의 연애 기질</p>
      <div className="flex justify-between gap-1">
        {axes.map(a => <ScoreBar key={a.key} label={a.key} score={a.최종점수} />)}
      </div>
      <div className="bg-[#f7fbff] rounded-[4px] px-4 py-3 flex flex-col gap-1.5">
        {axes.map(a => (
          <p key={a.key} className="text-[13px] text-[#3f3f3f] leading-normal">
            <span className="font-semibold text-[#1f1f1f]">{a.태그}</span> — {a.설명}
          </p>
        ))}
      </div>
    </div>
  )
}

// 섹션2: 끌리는 유형 / 피하면 좋은 유형
function TypeMatchCards({ section }: { section: SajuReport["섹션2_이상형유형"] }) {
  const cards = [
    { title: "끌리는 유형", cardBg: "#f0ecfe", chipBg: "#dbd3fe", data: section.끌리는유형 },
    { title: "피하면 좋은 유형", cardBg: "#feecec", chipBg: "#fed5d5", data: section.피하면좋은유형 },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ title, cardBg, chipBg, data }) => (
        <div
          key={title}
          className="rounded-[4px] p-4 flex flex-col items-center gap-[15px] text-center"
          style={{ background: cardBg }}
        >
          <p className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">{title}</p>
          <span
            className="text-[14px] font-semibold text-[#1f1f1f] tracking-[-0.14px] rounded-[20px] px-4 py-[2px]"
            style={{ background: chipBg }}
          >
            {data.유형명}
          </span>
          <p className="text-[14px] text-[#3f3f3f] leading-normal tracking-[-0.14px]">{data.설명}</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.태그.map(tag => (
              <span key={tag} className="text-[12px] font-medium text-white bg-[#1f1f1f] rounded-[4px] px-2 py-[3px] h-6 flex items-center">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 섹션3: 올해 연애운
function LoveFlowCard({ section }: { section: SajuReport["섹션3_올해연애운"] }) {
  const periods = [
    { label: "상반기", ...section.상반기 },
    { label: "하반기", ...section.하반기 },
    { label: "연말", ...section.연말 },
  ]
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] px-5 py-4 flex flex-col gap-4">
      <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">올해 연애운</p>
      <div className="relative flex flex-col gap-4">
        <span className="absolute left-2 top-2 bottom-2 w-px bg-[#cbdeff]" />
        {periods.map(p => (
          <div key={p.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="relative z-10 w-4 h-4 rounded-full bg-[#cbdeff] flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#90b7ff]" />
              </span>
              <span className="text-[14px] font-semibold text-[#1f1f1f]">{p.label} ({p.기간})</span>
              <span className="text-[11px] font-medium text-[#1a75ff] bg-[#e9f1ff] rounded-[4px] px-1.5 py-[2px]">{LEVEL_LABEL[p.레벨] ?? p.레벨}</span>
            </div>
            <p className="text-[13px] text-[#3f3f3f] leading-normal pl-6">{p.텍스트}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 섹션4: 주의 포인트
function CautionCard({ items }: { items: SajuReport["섹션4_주의포인트"] }) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] px-5 py-4 flex flex-col gap-4">
      <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">주의 포인트</p>
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="flex gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
              <circle cx="10" cy="10" r="9" stroke="#ff3b30" strokeWidth="1.4" />
              <path d="M10 5.5V11" stroke="#ff3b30" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="10" cy="14" r="1" fill="#ff3b30" />
            </svg>
            <div className="flex flex-col gap-0.5">
              <p className="text-[14px] font-semibold text-[#1f1f1f]">{item.제목}</p>
              <p className="text-[13px] text-[#6b6b6b] leading-normal">{item.설명}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadingState({ name }: { name: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-col px-5 pt-[52px] gap-3">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">{name}님의 연애운 분석 중 ...</h1>
        <p className="text-[15px] text-[#777] leading-normal tracking-[-0.3px]">잠시만 기다려주세요.</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[148px] h-[148px] flex items-center justify-center">
          <svg className="absolute inset-0 animate-spin w-full h-full" viewBox="0 0 148 148" fill="none">
            <circle cx="74" cy="74" r="68" stroke="#efefef" strokeWidth="8" />
            <path d="M74 6 A68 68 0 0 1 142 74" stroke="#90b7ff" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <div className="relative z-10 w-[56px] h-[56px] rounded-[12px] bg-[#b6d0ff] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3L5 7v7c0 6.1 4.1 11.8 9.3 13.4C19.9 25.8 24 20.1 24 14V7L14 3z" fill="white" />
              <path d="M10 14l3 3 5-5" stroke="#b6d0ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultContent() {
  const params = useSearchParams()
  const name = params.get("name") ?? "혜민"
  const gender = params.get("gender") ?? ""
  const calendarType = params.get("calendarType") ?? "SOLAR"
  const bd = params.get("bd") ?? ""
  const bt = params.get("bt") ?? ""
  const [report, setReport] = useState<SajuReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  async function generateReport(token: string) {
    setRetrying(true)
    setRetryError(null)
    try {
      const res = await fetch("/api/saju/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.sajuResult) {
        try { setReport(JSON.parse(data.sajuResult)) } catch { /* ignore */ }
      } else {
        setRetryError(data.detail ?? data.error ?? "알 수 없는 오류")
      }
    } catch (e) {
      setRetryError(String(e))
    } finally {
      setRetrying(false)
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) { setLoading(false); return }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (user?.sajuResult) {
          try { setReport(JSON.parse(user.sajuResult)) } catch { /* ignore */ }
        } else if (user) {
          // sajuResult가 없으면 자동으로 생성 시도
          generateReport(token)
        }
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const genderLabel = gender === "MALE" ? " (남성)" : gender === "FEMALE" ? " (여성)" : ""
  const isMale = gender === "MALE"
  const birthDisplay = formatBirthDisplay(bd, bt, calendarType)

  if (loading || retrying) return <LoadingState name={name} />

  const infoCard = (
    <div className="bg-[#f7f7f8] rounded-[4px] px-5 py-4 flex flex-col gap-1">
      <p className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">{name}{genderLabel}</p>
      <p className="text-[14px] font-normal text-[#1f1f1f] leading-normal tracking-[-0.14px]">{birthDisplay}</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header — left-aligned title, matches Figma */}
      <div className="sticky top-0 z-10 bg-white h-[52px] flex items-center px-5">
        <button
          onClick={() => bridgeBack()}
          className="w-8 h-8 flex items-center justify-center mr-2 shrink-0"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="#0f0f10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="text-[18px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.36px]">연애운 리포트</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-5 pt-5 pb-4 flex flex-col gap-7 overflow-y-auto">

        {/* 분석 완료 badge + 제목 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {/* Blue check circle */}
            <div className="w-6 h-6 rounded-full bg-[#1a75ff] flex items-center justify-center shrink-0">
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1.5 4.5L4.5 7.5L9.5 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[16px] font-semibold text-[#1a75ff] leading-normal tracking-[-0.32px]">분석 완료</span>
          </div>
          <h1 className="text-[22px] font-bold text-[#0f0f10] leading-[1.4] tracking-[-0.44px]">
            {isMale ? (
              <>{name}님의 연애 성향을 분석해<br />프로필을 준비했어요.</>
            ) : (
              <>{name}님의 연애 성향과 올해 연애운</>
            )}
          </h1>
        </div>

        {!report ? (
          <>
            {infoCard}
            <div className="flex flex-col gap-4 items-start">
              <p className="text-[14px] text-[#777] leading-relaxed">
                {retryError
                  ? `분석 중 오류가 발생했어요.\n${retryError}`
                  : "연애운 분석에 실패했어요. 다시 시도해주세요."}
              </p>
              <button
                onClick={() => {
                  const token = localStorage.getItem("auth_token")
                  if (token) generateReport(token)
                }}
                className="h-[44px] px-6 bg-[#b6d0ff] rounded-[4px] text-[15px] font-semibold text-[#1f1f1f]"
              >
                다시 분석하기
              </button>
            </div>
          </>
        ) : isMale ? (
          <>
            {/* 유저 정보 + 나의 연애 기질 */}
            <div className="flex flex-col gap-3">
              {infoCard}
              <TemperamentCard section={report.섹션1_연애기질} />
            </div>

            {/* 추천 프로필 캐러셀 + CTA */}
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto flex gap-3 pb-1 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
                {MALE_PROFILES.map((p) => (
                  <div
                    key={p.name}
                    className="shrink-0 w-[300px] h-[400px] rounded-[8px] relative overflow-hidden"
                    style={{ background: p.grad }}
                  >
                    <div
                      className="absolute inset-0 rounded-[8px]"
                      style={{ background: "rgba(31,31,31,0.52)", backdropFilter: "blur(10px)" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[20px] font-semibold text-white leading-[1.4] tracking-[-0.4px]">{p.name}</span>
                        <span className="text-[20px] font-semibold text-white leading-[1.4] tracking-[-0.4px]">/</span>
                        <span className="text-[20px] font-semibold text-white leading-[1.4] tracking-[-0.4px]">{p.age}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[12px] font-medium text-[#1f1f1f] bg-[#cbdeff] rounded-[4px] px-2 py-[3px] leading-[1.4]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => bridgeNavigate("Blocking")}
                className="w-full py-2 px-7 bg-[#fff5e5] rounded-[54px] text-[14px] font-medium text-[#1f1f1f] text-center leading-normal active:opacity-80"
              >
                내 프로필을 완성하고 추천 프로필을 열어보세요!
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {infoCard}
            <TemperamentCard section={report.섹션1_연애기질} />
            <TypeMatchCards section={report.섹션2_이상형유형} />
            <LoveFlowCard section={report.섹션3_올해연애운} />
            <CautionCard items={report.섹션4_주의포인트} />
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-4 bg-white">
        <button
          onClick={() => bridgeNavigate("Blocking")}
          className="w-full h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] text-[#1f1f1f] active:opacity-80"
        >
          내 프로필 만들기
        </button>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  )
}
