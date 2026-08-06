"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"

type Level = "HIGH" | "MID" | "LOW"

type DailyFortuneDetail = {
  date: string
  총운: { score: number; level: Level }
  애정운: { level: Level; text: string }
  새로운인연운: { level: Level; text: string }
  궁합좋은상대: { 유형명: string; 태그: string[] } | null
  행운의아이템: string
}

const LEVEL_LABEL: Record<Level, string> = { HIGH: "좋음", MID: "보통", LOW: "주의" }
const LEVEL_BADGE: Record<Level, string> = {
  HIGH: "text-[#ff7b2e] bg-[#fff5e5]",
  MID: "text-[#6b6b6b] bg-[#f4f4f5]",
  LOW: "text-[#6b6b6b] bg-[#f4f4f5]",
}
const LEVEL_BAR: Record<Level, string> = {
  HIGH: "bg-[#ff7b2e]",
  MID: "bg-[#b6d0ff]",
  LOW: "bg-[#dbdcdf]",
}

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-")
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}

function LevelCard({ title, level, text }: { title: string; level: Level; text: string }) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <p className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">{title}</p>
        <span className={`text-[11px] font-semibold rounded-[4px] px-1.5 py-[2px] ${LEVEL_BADGE[level]}`}>
          {LEVEL_LABEL[level]}
        </span>
      </div>
      <p className="text-[14px] text-[#3f3f3f] leading-normal tracking-[-0.14px]">{text}</p>
    </div>
  )
}

export default function TodayFortunePage() {
  const router = useRouter()
  const [fortune, setFortune] = useState<DailyFortuneDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setLoading(false)
      return
    }
    fetch("/api/daily-fortune/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setFortune(d))
      .catch(() => setFortune(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleShare() {
    if (!fortune) return
    const text = `[오늘의 운세 · ${formatDate(fortune.date)}]\n총운 ${fortune.총운.score}점 (${LEVEL_LABEL[fortune.총운.level]})\n${fortune.애정운.text}`
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "오늘의 운세", text }).catch(() => {})
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareMsg("클립보드에 복사했어요")
    } catch {
      setShareMsg("공유하지 못했어요")
    }
    setTimeout(() => setShareMsg(null), 2000)
  }

  return (
    <Screen>
      <div className="h-[52px] flex items-center gap-3 px-5 py-3.5 shrink-0">
        <BackButton onClick={() => router.back()} />
        <h1 className="flex-1 text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">오늘의 운세</h1>
        {fortune && <span className="text-[13px] text-[#777]">{formatDate(fortune.date)}</span>}
      </div>

      <div className="flex-1 scroll-area overflow-y-auto px-5 pb-8 flex flex-col gap-3">
        {loading ? (
          <>
            <div className="h-[100px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
            <div className="h-[80px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
            <div className="h-[80px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
            <div className="h-[100px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
            <div className="h-[80px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
          </>
        ) : !fortune ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
            <p className="text-[15px] font-semibold text-[#1f1f1f]">운세를 불러오지 못했어요</p>
            <p className="text-[13px] text-[#777]">잠시 후 다시 시도해주세요.</p>
          </div>
        ) : (
          <>
            {/* 총운 게이지 */}
            <div className="bg-white border border-[#e8e8e8] rounded-[4px] px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">총운</p>
                <span className={`text-[11px] font-semibold rounded-[4px] px-1.5 py-[2px] ${LEVEL_BADGE[fortune.총운.level]}`}>
                  {LEVEL_LABEL[fortune.총운.level]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-[#f4f4f5] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${LEVEL_BAR[fortune.총운.level]}`}
                    style={{ width: `${fortune.총운.score}%` }}
                  />
                </div>
                <span className="text-[15px] font-bold text-[#1f1f1f]">{fortune.총운.score}</span>
              </div>
            </div>

            <LevelCard title="애정운" level={fortune.애정운.level} text={fortune.애정운.text} />
            <LevelCard title="새로운 인연운" level={fortune.새로운인연운.level} text={fortune.새로운인연운.text} />

            {fortune.궁합좋은상대 && (
              <div className="bg-[#e9f1ff] rounded-[4px] px-5 py-4 flex flex-col gap-3">
                <p className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">오늘의 궁합 좋은 상대</p>
                <p className="text-[14px] text-[#3f3f3f]">
                  <span className="font-semibold text-[#1f1f1f]">{fortune.궁합좋은상대.유형명}</span> 스타일과 잘 맞는 하루예요
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fortune.궁합좋은상대.태그.map(tag => (
                    <span key={tag} className="text-[12px] font-medium text-white bg-[#1f1f1f] rounded-[4px] px-2 py-[3px] h-6 flex items-center">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="h-10 rounded-[4px] bg-[#1f1f1f] text-white text-[14px] font-semibold tracking-[-0.14px] active:opacity-80"
                >
                  지금 둘러보기
                </button>
              </div>
            )}

            <div className="bg-[#fff5e5] rounded-[4px] px-5 py-4 flex flex-col gap-1">
              <p className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">행운의 아이템</p>
              <p className="text-[14px] text-[#3f3f3f] leading-normal">{fortune.행운의아이템}</p>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="h-11 rounded-[4px] border border-[#dbdcdf] text-[14px] font-semibold text-[#1f1f1f] active:opacity-70 mt-1"
            >
              {shareMsg ?? "공유하기"}
            </button>
          </>
        )}
      </div>
    </Screen>
  )
}
