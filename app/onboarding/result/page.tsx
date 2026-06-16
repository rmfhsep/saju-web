"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"

// Figma design token colors
const OHANG = [
  { label: "목(木) : 3", bg: "#e2ffdf", color: "#1f1f1f" },
  { label: "토(土) : 3", bg: "#feeee5", color: "#1f1f1f" },
  { label: "화(火) : 1", bg: "#feecec", color: "#1f1f1f" },
  { label: "수(水) : 1", bg: "#eaf2fe", color: "#1f1f1f" },
  { label: "금(金) : 0", bg: "#555555", color: "#ffffff" },
]

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

// 오행 기운 card
function OhangCard() {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] px-5 py-4 flex flex-col gap-4">
      <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">타고난 오행 기운</p>
      <div className="flex flex-wrap gap-[10px]">
        {OHANG.map((t) => (
          <span
            key={t.label}
            className="px-3 py-1 rounded-[4px] text-[14px] font-medium leading-normal tracking-[-0.14px]"
            style={{ backgroundColor: t.bg, color: t.color }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// Analysis text sections — light blue bg card
function AnalysisTextCard() {
  return (
    <div className="bg-[#f7fbff] rounded-[4px] p-5 flex flex-col gap-5">
      {/* 나의 연애 스타일 */}
      <div className="flex flex-col gap-2">
        <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">나의 연애 스타일</p>
        <p className="text-[14px] text-[#3f3f3f] leading-normal tracking-[-0.14px]">
          사람을 쉽게 좋아하거나 외로움을 못 견뎌서 연애를 시작하는 타입이라기보다는,
          상대를 오래 보고 판단한 뒤 마음을 여는 쪽에 가깝습니다. 상대를 보는 기준이
          높아 겉으로는 이성적이고 냉정해 보일 수 있는데, 실제로 가까워지면 감정 몰입도가
          높은 편이고 관계에 책임감도 크게 느끼는 성향입니다. 그래서 연애가 깊어질수록
          상대를 더 챙기고, 감정적으로 더 많이 투자하는 구조가 자주 생깁니다.
        </p>
      </div>

      {/* 올해 연애 흐름 */}
      <div className="flex flex-col gap-2">
        <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">올해 연애 흐름</p>
        <p className="text-[14px] text-[#3f3f3f] leading-normal tracking-[-0.14px]">
          4월부터 6월 사이에 한 차례 강하게 들어오는 흐름이 있습니다. 이 시기에는 새로운
          사람과 연결될 가능성이 높으며, 업무, 프로젝트, 커뮤니티, 취향 기반 모임 등 현실적인
          생활 동선 안에서 인연이 생길 가능성이 큽니다. 또한 올해는 8월부터 10월 사이의 흐름이
          매우 중요하게 작용합니다. 이 시기에는 새로운 인연 자체보다 기존 인연이 깊어지거나
          실제 연애로 연결될 가능성이 더욱 커집니다.
        </p>
      </div>

      {/* 나와 잘맞는 운명의 상대 */}
      <div className="flex flex-col gap-2">
        <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">나와 잘맞는 운명의 상대</p>
        <p className="text-[14px] text-[#3f3f3f] leading-normal tracking-[-0.14px]">
          외적인 취향으로는 지나치게 화려하거나 과하게 들이대는 스타일보다, 깔끔하고 자기관리가
          잘 되어 있는 사람, 담백하면서도 도시적인 분위기를 가진 스타일에 끌릴 가능성이 높습니다.
          결국 단순히 설레는 사람보다, "이 사람과 실제 삶을 함께해도 괜찮겠다"는 안정감과
          신뢰를 느끼게 하는 사람에게 훨씬 깊게 마음이 움직이는 흐름으로 보입니다.
        </p>
      </div>
    </div>
  )
}

function MaleProfileCards() {
  return (
    <div className="overflow-x-auto flex gap-3 pb-1 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
      {MALE_PROFILES.map((p) => (
        <div
          key={p.name}
          className="shrink-0 w-[300px] h-[400px] rounded-[8px] relative overflow-hidden"
          style={{ background: p.grad }}
        >
          {/* dim overlay with blur */}
          <div
            className="absolute inset-0 rounded-[8px]"
            style={{ background: "rgba(31,31,31,0.52)", backdropFilter: "blur(10px)" }}
          />
          {/* info at bottom */}
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
  )
}

function ResultContent() {
  const params = useSearchParams()
  const name = params.get("name") ?? "혜민"
  const gender = params.get("gender") ?? ""
  const calendarType = params.get("calendarType") ?? "SOLAR"
  const bd = params.get("bd") ?? ""
  const bt = params.get("bt") ?? ""
  const [loveOpen, setLoveOpen] = useState(true)

  const genderLabel = gender === "MALE" ? " (남성)" : gender === "FEMALE" ? " (여성)" : ""
  const isMale = gender === "MALE"
  const birthDisplay = formatBirthDisplay(bd, bt, calendarType)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header — left-aligned title, matches Figma */}
      <div className="sticky top-0 z-10 bg-white h-[52px] flex items-center px-5">
        <button
          onClick={() => bridgeBack()}
          className="w-8 h-8 flex items-center justify-center mr-2 shrink-0"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="#0f0f10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M1.5 4.5L4.5 7.5L9.5 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

        {/* User info card */}
        <div className="bg-[#f7f7f8] rounded-[4px] px-5 py-4 flex flex-col gap-1">
          <p className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">{name}{genderLabel}</p>
          <p className="text-[14px] font-normal text-[#1f1f1f] leading-normal tracking-[-0.14px]">{birthDisplay}</p>
        </div>

        {/* ── 남성 레이아웃 ── */}
        {isMale && (
          <>
            {/* Profile cards horizontal scroll */}
            <MaleProfileCards />

            {/* 프로필 완성 유도 버튼 — pill shape, yellow bg */}
            <button
              onClick={() => bridgeNavigate("Blocking")}
              className="w-full py-2 px-7 bg-[#fff5e5] rounded-[54px] text-[14px] font-medium text-[#1f1f1f] text-center leading-normal active:opacity-80"
            >
              내 프로필을 완성하고 추천 프로필을 열어보세요!
            </button>

            {/* 나의 연애운 — collapsible with chevron, expanded by default */}
            <div className="flex flex-col gap-5">
              <button
                onClick={() => setLoveOpen(!loveOpen)}
                className="w-full flex items-center justify-between"
              >
                <span className="text-[16px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.32px]">나의 연애운</span>
                <svg
                  width="12" height="8" viewBox="0 0 12 8" fill="none"
                  className={`transition-transform duration-200 ${loveOpen ? "rotate-180" : ""}`}
                >
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {loveOpen && (
                <div className="flex flex-col gap-3">
                  <OhangCard />
                  <AnalysisTextCard />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── 여성 레이아웃: 분석 바로 표시 ── */}
        {!isMale && (
          <div className="flex flex-col gap-3">
            <OhangCard />
            <AnalysisTextCard />
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
