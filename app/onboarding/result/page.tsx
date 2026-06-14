"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"

const OHANG = [
  { label: "목(木) : 3", bg: "#e2ffe2", color: "#0f0f10" },
  { label: "토(土) : 3", bg: "#feeee5", color: "#0f0f10" },
  { label: "화(火) : 1", bg: "#feecec", color: "#0f0f10" },
  { label: "수(水) : 1", bg: "#eaf2fe", color: "#0f0f10" },
  { label: "금(金) : 0", bg: "#555555", color: "#ffffff" },
]

type MingCell = { bg: string; sinshin: string; char: string; sound: string; lightText?: boolean }
type MingCol = { label: string; top: MingCell; bottom: MingCell }

const MINGSHIK: MingCol[] = [
  {
    label: "시주",
    top:    { bg: "#feeee5", sinshin: "겁재", char: "己", sound: "무" },
    bottom: { bg: "#feecec", sinshin: "겁재", char: "己", sound: "진" },
  },
  {
    label: "일주",
    top:    { bg: "#feeee5", sinshin: "비견", char: "己", sound: "기" },
    bottom: { bg: "#eaf2fe", sinshin: "정재", char: "己", sound: "해" },
  },
  {
    label: "월주",
    top:    { bg: "#e2ffe2", sinshin: "정관", char: "己", sound: "갑" },
    bottom: { bg: "#e2ffe2", sinshin: "정관", char: "己", sound: "인" },
  },
  {
    label: "연주",
    top:    { bg: "#feeee5", sinshin: "겁재", char: "己", sound: "무" },
    bottom: { bg: "#e2ffe2", sinshin: "정관", char: "己", sound: "인" },
  },
]

function MingCellView({ cell }: { cell: MingCell }) {
  const mutedColor = cell.lightText ? "rgba(255,255,255,0.6)" : "rgba(15,15,16,0.4)"
  return (
    <div
      className="w-full h-[84px] rounded-[4px] flex flex-col items-center justify-center gap-0.5"
      style={{ backgroundColor: cell.bg }}
    >
      <span className="text-[11px] font-medium" style={{ color: mutedColor }}>{cell.sinshin}</span>
      <span className="text-base font-bold text-[#0f0f10]">{cell.char}</span>
      <span className="text-[11px] font-medium" style={{ color: mutedColor }}>{cell.sound}</span>
    </div>
  )
}

function AnalysisSection() {
  const [mingOpen, setMingOpen] = useState(false)
  return (
    <>
      {/* 오행 기운 */}
      <div className="bg-white rounded-[4px] p-4 flex flex-col gap-[18px]">
        <p className="text-[17px] font-semibold text-[#1f1f1f]">타고난 오행 기운</p>
        <div className="flex flex-wrap gap-[10px]">
          {OHANG.map((t) => (
            <span
              key={t.label}
              className="px-3 py-1 rounded-[4px] text-[14px] font-medium"
              style={{ backgroundColor: t.bg, color: t.color }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* 연애운 분석 */}
      <div className="bg-[#f7fbff] rounded-[4px] p-4 flex flex-col gap-[18px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[17px] font-semibold text-[#1f1f1f]">나의 연애 스타일</p>
            <p className="text-[14px] text-[#3f3f3f] leading-normal">
              사람을 쉽게 좋아하거나 외로움을 못 견뎌서 연애를 시작하는 타입이라기보다는,
              상대를 오래 보고 판단한 뒤 마음을 여는 쪽에 가깝습니다. 상대를 보는 기준이
              높아 겉으로는 이성적이고 냉정해 보일 수 있는데, 실제로 가까워지면 감정 몰입도가
              높은 편이고 관계에 책임감도 크게 느끼는 성향입니다.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[17px] font-semibold text-[#1f1f1f]">올해 연애 흐름</p>
            <p className="text-[14px] text-[#3f3f3f] leading-normal">
              4월부터 6월 사이에 한 차례 강하게 들어오는 흐름이 있습니다. 이 시기에는 새로운
              사람과 연결될 가능성이 높으며, 업무, 프로젝트, 커뮤니티, 취향 기반 모임 등 현실적인
              생활 동선 안에서 인연이 생길 가능성이 큽니다. 또한 올해는 8월부터 10월 사이의
              흐름이 매우 중요하게 작용합니다.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[17px] font-semibold text-[#1f1f1f]">나와 잘맞는 운명의 상대</p>
            <p className="text-[14px] text-[#3f3f3f] leading-normal">
              외적인 취향으로는 지나치게 화려하거나 과하게 들이대는 스타일보다, 깔끔하고 자기관리가
              잘 되어 있는 사람, 담백하면서도 도시적인 분위기를 가진 스타일에 끌릴 가능성이 높습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 명식 */}
      <div className="border border-[#e9e9e9] rounded-[4px]">
        <button
          onClick={() => setMingOpen(!mingOpen)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <span className="text-[16px] font-semibold text-[#0f0f10]">나의 명식</span>
          <span className="text-[13px] text-[#0f0f10]">{mingOpen ? "∧" : "∨"}</span>
        </button>
        {mingOpen && (
          <div className="flex gap-2 px-4 pb-4">
            {MINGSHIK.map((col) => (
              <div key={col.label} className="flex-1 flex flex-col items-center gap-[10px]">
                <p className="text-[13px] font-semibold text-[#0f0f10]">{col.label}</p>
                <MingCellView cell={col.top} />
                <MingCellView cell={col.bottom} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ResultContent() {
  const params = useSearchParams()
  const name = params.get("name") ?? "혜민"
  const gender = params.get("gender") ?? ""
  const [loveOpen, setLoveOpen] = useState(false)

  const genderLabel = gender === "MALE" ? " (남성)" : gender === "FEMALE" ? " (여성)" : ""
  const isMale = gender === "MALE"

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white h-[54px] flex items-center px-4">
        <button
          onClick={() => bridgeBack()}
          className="w-[30px] h-[30px] flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
        >
          ‹
        </button>
        <h2 className="flex-1 text-center text-[18px] font-semibold text-[#1f1f1f]">연애운 리포트</h2>
        <div className="w-[30px]" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-4 pt-2 pb-4 flex flex-col gap-3">
        {/* 분석 완료 badge + 제목 */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a75ff] flex items-center justify-center">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[16px] font-semibold text-[#1a75ff]">분석 완료</span>
        </div>
        <h1 className="text-[22px] font-bold text-[#0f0f10] leading-normal">
          {isMale
            ? <>{name}님의 연애 성향을 분석해<br />프로필을 준비했어요.</>
            : <>{name}님의 연애 성향과 올해 연애운</>
          }
        </h1>

        {/* User info card */}
        <div className="bg-[#f7f7f8] rounded-[4px] px-4 py-3 flex flex-col gap-1">
          <p className="text-[14px] font-semibold text-[#1f1f1f]">{name}{genderLabel}</p>
          <p className="text-[14px] text-[#1f1f1f]">양력 1998년 2월 21일 오전 9:30 출생</p>
        </div>

        {/* ── 남성 레이아웃: 프로필 카드 섹션 ── */}
        {isMale && (
          <>
            {/* 매칭 프로필 카드 (잠금 상태) */}
            <div className="flex gap-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-[180px] rounded-[8px] bg-[#e0e0e0] overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-[#1f1f1f]/40 backdrop-blur-sm flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="1.5"/>
                      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* 프로필 완성 CTA */}
            <div className="bg-[#fff5e4] rounded-[8px] px-4 py-4 text-center">
              <p className="text-[14px] font-medium text-[#1f1f1f]">
                내 프로필을 완성하고 추천 프로필을 열어보세요!
              </p>
            </div>

            {/* 나의 연애운 (collapsible) */}
            <div className="border border-[#e9e9e9] rounded-[4px]">
              <button
                onClick={() => setLoveOpen(!loveOpen)}
                className="w-full flex items-center justify-between px-4 py-4"
              >
                <span className="text-[16px] font-semibold text-[#0f0f10]">나의 연애운</span>
                <svg
                  width="8" height="14" viewBox="0 0 8 14" fill="none"
                  className={`transition-transform ${loveOpen ? "rotate-90" : ""}`}
                >
                  <path d="M1 1l6 6-6 6" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {loveOpen && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <AnalysisSection />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── 여성 레이아웃: 분석 바로 표시 ── */}
        {!isMale && <AnalysisSection />}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white px-4 pb-8 pt-3">
        <button
          onClick={() => bridgeNavigate("MatchPreview", { name })}
          className="w-full h-[48px] bg-[#b5cfff] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80"
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
