"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAppRouter } from "@/lib/useAppRouter"
import type { SajuReport } from "@/lib/prompts/sajuReport"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import PageFooter from "@/components/ui/page-footer"
import { WarningIcon } from "@/components/ui/icons"
import { useMe } from "@/lib/queries/useMe"
import { queryKeys } from "@/lib/queries/keys"

const LEVEL_LABEL: Record<string, string> = { HIGH: "높음", MID: "보통", LOW: "낮음" }
// 레벨별 뱃지 색상: 높음-빨강 / 보통-파랑 / 낮음-노랑
const LEVEL_BADGE: Record<string, string> = {
  HIGH: "text-[#ff334b] bg-[#feecec]",
  MID: "text-[#1a75ff] bg-[#e9f1ff]",
  LOW: "text-[#e5920a] bg-[#fff3df]",
}

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

// 4축 점수 막대 (표현/감정깊이/주도성/집착도)
function ScoreBar({ score }: { score: number }) {
  const height = Math.round(Math.min(100, Math.max(0, score)) * 0.82 + 20)
  return (
    <div className="flex flex-col items-center gap-1 w-[52px]">
      <span className="text-[12px] font-semibold text-[#1a75ff] leading-[1.4]">{score}</span>
      <div
        className="w-4 rounded-[30px] bg-gradient-to-b from-[#b6d0ff] to-[#e4eeff]"
        style={{ height }}
      />
    </div>
  )
}

function TemperamentCard({ section }: { section: SajuReport["섹션1_연애기질"] }) {
  const axes = [
    { key: "표현", ...section.표현방식 },
    { key: "감정 깊이", ...section.감정깊이 },
    { key: "주도성", ...section.주도성 },
    { key: "집착도", ...section.집착도 },
  ]
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] p-4 flex flex-col gap-5">
      <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">나의 연애 기질</p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-5 h-[120px] items-end justify-center">
          {axes.map(a => <ScoreBar key={a.key} score={a.최종점수} />)}
        </div>
        <div className="flex gap-5 justify-center text-[12px] font-medium text-[#777] text-center">
          {axes.map(a => <span key={a.key} className="w-[52px]">{a.key}</span>)}
        </div>
      </div>
      {/* 축별 유형 태그 + 설명을 각각 노출 (병합된 줄글 아님) */}
      <div className="bg-[#e9f1ff] rounded-[4px] p-3 flex flex-col gap-1.5">
        {axes.map(a => (
          <p key={a.key} className="text-[14px] font-normal text-[#1f1f1f] leading-[1.5] tracking-[-0.14px]">
            <span className="font-semibold">{a.태그}</span> — {a.설명}
          </p>
        ))}
      </div>
    </div>
  )
}

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
          <p className="text-[14px] font-normal text-[#3f3f3f] leading-[1.5] tracking-[-0.14px]">{data.설명}</p>
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

function LoveFlowCard({ section }: { section: SajuReport["섹션3_올해연애운"] }) {
  const periods = [
    { label: "상반기", ...section.상반기 },
    { label: "하반기", ...section.하반기 },
    { label: "연말", ...section.연말 },
  ]
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] p-4 flex flex-col gap-4">
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
              <span className={`text-[11px] font-medium rounded-[4px] px-1.5 py-[2px] ${LEVEL_BADGE[p.레벨] ?? LEVEL_BADGE.MID}`}>{LEVEL_LABEL[p.레벨] ?? p.레벨}</span>
            </div>
            <p className="text-[14px] font-normal text-[#3f3f3f] leading-[1.5] pl-6">{p.텍스트}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CautionCard({ items }: { items: SajuReport["섹션4_주의포인트"] }) {
  return (
    <div className="bg-[#fff5e5] rounded-[4px] p-4 flex flex-col gap-5">
      <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">주의 포인트</p>
      <div className="flex flex-col gap-4">
        {items.map(item => (
          <div key={item.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <WarningIcon size={20} className="shrink-0" />
              <p className="flex-1 text-[15px] font-semibold text-[#1f1f1f] leading-[1.5] tracking-[-0.3px]">{item.제목}</p>
            </div>
            <p className="pl-7 text-[14px] font-normal text-[#3f3f3f] leading-[1.5] tracking-[-0.14px]">{item.설명}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReportPage() {
  const router = useAppRouter()
  const queryClient = useQueryClient()
  const meQuery = useMe()
  const user = meQuery.data ?? null
  const loading = meQuery.isLoading
  const [report, setReport] = useState<SajuReport | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generateReport(token: string) {
    setRegenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/saju/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.sajuResult) {
        try { setReport(JSON.parse(data.sajuResult)) } catch { /* ignore */ }
        queryClient.invalidateQueries({ queryKey: queryKeys.me })
      } else {
        setError(data.detail ?? data.error ?? "분석에 실패했어요.")
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setRegenerating(false)
    }
  }

  useEffect(() => {
    if (!user?.sajuResult || report) return
    try {
      const parsed = JSON.parse(user.sajuResult)
      if (parsed?.섹션1_연애기질?.표현방식) setReport(parsed)
    } catch { /* ignore */ }
  }, [user, report])

  const name = user?.name ?? ""
  const genderLabel = user?.gender === "MALE" ? " (남성)" : user?.gender === "FEMALE" ? " (여성)" : ""
  const birthDisplay = user
    ? formatBirthDisplay(user.birthDate ?? "", user.birthTimeUnknown ? "" : (user.birthTime ?? ""), user.calendarType ?? "SOLAR")
    : ""
  // 시주(출생시) 입력 여부 — 미입력이면 연애 기질만, 입력이면 전체 리포트
  const hasBirthTime = report?.meta?.시주입력여부 ?? (!!user && !user.birthTimeUnknown && !!user.birthTime)

  const infoCard = (
    <div className="bg-[#f7f7f8] rounded-[4px] px-5 py-4 flex flex-col gap-1">
      <p className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">{name}{genderLabel}</p>
      <p className="text-[14px] font-normal text-[#1f1f1f] leading-normal tracking-[-0.14px]">{birthDisplay}</p>
    </div>
  )

  return (
    <Screen>
      <EditHeader title="연애운 리포트" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto px-5 pt-1 pb-4">
        <h1 className="text-[22px] font-bold text-[#0f0f10] leading-[1.4] tracking-[-0.44px]">
          {name}님의 연애 성향{hasBirthTime ? "과 올해 연애운" : ""}
        </h1>

        {loading || regenerating ? (
          <p className="pt-8 text-[14px] text-[#777]">연애운을 분석하고 있어요...</p>
        ) : !report ? (
          <div className="pt-6 flex flex-col gap-4">
            {infoCard}
            <p className="text-[14px] text-[#777] leading-relaxed whitespace-pre-line">
              {error ?? "아직 분석된 연애운 리포트가 없어요. 다시 분석하기를 눌러주세요."}
            </p>
          </div>
        ) : (
          <div className="pt-6 flex flex-col gap-3">
            {infoCard}
            <TemperamentCard section={report.섹션1_연애기질} />
            
                <TypeMatchCards section={report.섹션2_이상형유형} />
                <LoveFlowCard section={report.섹션3_올해연애운} />
                <CautionCard items={report.섹션4_주의포인트} />
              
            
          </div>
        )}
      </div>

      <PageFooter>
        <button
          onClick={() => {
            const token = localStorage.getItem("auth_token")
            if (token) generateReport(token)
          }}
          disabled={regenerating}
          className="w-full h-[48px] bg-[#e9f1ff] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] text-[#1a75ff] active:opacity-80 disabled:opacity-50"
        >
          {regenerating ? "분석 중..." : "다시 분석하기"}
        </button>
      </PageFooter>
    </Screen>
  )
}
