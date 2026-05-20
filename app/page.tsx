"use client"

import { useState } from "react"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassHeader } from "@/components/ui/glass-header"
import { BottomNav } from "@/components/ui/bottom-nav"
import { cn } from "@/lib/utils"

type Step = "form" | "loading" | "result"
type NavTab = "home" | "history" | "profile"

export default function Page() {
  const [gender, setGender] = useState<"male" | "female" | "">("")
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [unknownTime, setUnknownTime] = useState(false)
  const [result, setResult] = useState("")
  const [step, setStep] = useState<Step>("form")
  const [activeTab, setActiveTab] = useState<NavTab>("home")

  const isReady = gender !== "" && birthDate !== ""

  async function submit() {
    if (!isReady) return
    setStep("loading")
    const [year, month, day] = birthDate.split("-")
    const res = await fetch("/api/saju", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gender,
        birthYear: Number(year),
        birthMonth: Number(month),
        birthDay: Number(day),
        birthHour: unknownTime ? "모름" : birthTime || "12:00",
      }),
    })
    const json = await res.json()
    setResult(json.message)
    setStep("result")
  }

  if (step === "loading") return <LoadingView />

  if (step === "result") {
    return (
      <ResultView
        result={result}
        onBack={() => { setStep("form"); setActiveTab("home") }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-28">
      <GlassHeader title="연애 사주" subtitle="별이 말해주는 당신의 연애운" />

      {/* 메인 배너 */}
      <div className="px-4 pt-6 pb-4">
        <div className="relative overflow-hidden rounded-3xl p-6"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.3) 100%)" }}>
          <div className="absolute inset-0 backdrop-blur-sm border border-white/20 rounded-3xl" />
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-2">✦ Love Fortune</p>
            <h2 className="text-white text-2xl font-extrabold leading-tight mb-1">
              오늘의 연애운을<br />확인해보세요
            </h2>
            <p className="text-white/50 text-sm mt-2">사주팔자로 알아보는 당신의 인연</p>
          </div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-30">🔮</div>
        </div>
      </div>

      {/* 폼 */}
      <div className="px-4 space-y-3 flex-1">
        {/* 성별 */}
        <GlassCard glowEffect={false}>
          <GlassCardContent className="p-4">
            <p className="text-white/40 text-[11px] font-semibold tracking-widest uppercase mb-3">성별</p>
            <div className="flex gap-2">
              {([["male", "👦", "남자"], ["female", "👧", "여자"]] as const).map(([val, emoji, label]) => (
                <button
                  key={val}
                  onClick={() => setGender(val)}
                  className={cn(
                    "flex-1 h-12 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 border",
                    gender === val
                      ? "bg-linear-to-r from-violet-500/70 to-cyan-500/70 border-white/40 text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10",
                  )}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* 생년월일 */}
        <GlassCard glowEffect={false}>
          <GlassCardContent className="p-4">
            <p className="text-white/40 text-[11px] font-semibold tracking-widest uppercase mb-3">생년월일</p>
            <GlassInput
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-12 font-semibold"
              style={{ colorScheme: "dark" }}
            />
          </GlassCardContent>
        </GlassCard>

        {/* 태어난 시간 */}
        <GlassCard glowEffect={false}>
          <GlassCardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/40 text-[11px] font-semibold tracking-widest uppercase">태어난 시간</p>
              {/* 토글 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-white/40 text-xs">모르겠어요</span>
                <div
                  onClick={() => setUnknownTime(!unknownTime)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer border",
                    unknownTime
                      ? "bg-linear-to-r from-violet-500/70 to-cyan-500/70 border-white/30"
                      : "bg-white/10 border-white/10",
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300",
                    unknownTime ? "translate-x-4" : "translate-x-0",
                  )} />
                </div>
              </label>
            </div>
            <GlassInput
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              disabled={unknownTime}
              className={cn("h-12 font-semibold transition-opacity", unknownTime && "opacity-30 pointer-events-none")}
              style={{ colorScheme: "dark" }}
            />
          </GlassCardContent>
        </GlassCard>

        {/* 안내 */}
        <p className="text-white/25 text-xs text-center px-4 leading-relaxed">
          ✦ 입력하신 정보는 사주 분석에만 사용되며 저장되지 않아요
        </p>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4">
        <div className="relative">
          {isReady && (
            <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-violet-500/50 via-cyan-500/50 to-pink-500/50 blur-lg opacity-80" />
          )}
          <GlassButton
            variant="primary"
            size="lg"
            onClick={submit}
            disabled={!isReady}
            className="w-full rounded-xl"
          >
            ✨ 사주 보기
          </GlassButton>
        </div>
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

function LoadingView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-8">
      {/* 회전 오브 */}
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-violet-500/30 to-cyan-500/30 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-linear-to-r from-violet-500/20 to-cyan-500/20 animate-ping" style={{ animationDelay: "0.3s" }} />
        <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce">🔮</div>
      </div>

      <GlassCard glowEffect className="w-full">
        <GlassCardContent className="p-6 text-center">
          <p className="text-white font-bold text-lg mb-2">사주를 분석하는 중이에요</p>
          <p className="text-white/50 text-sm">별자리의 기운을 읽고 있어요...</p>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}

function ResultView({
  result,
  onBack,
  activeTab,
  onTabChange,
}: {
  result: string
  onBack: () => void
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}) {
  return (
    <div className="min-h-screen flex flex-col pb-28">
      <GlassHeader title="사주 결과" subtitle="당신의 연애운이에요" onBack={onBack} />

      <div className="px-4 pt-6 space-y-4 flex-1">
        {/* 결과 배너 */}
        <div className="relative overflow-hidden rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(124,58,237,0.4) 100%)" }}>
          <div className="absolute inset-0 backdrop-blur-sm border border-white/20 rounded-3xl" />
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-4xl">✨</span>
            <div>
              <p className="text-white font-extrabold text-lg leading-tight">AI 사주 분석 완료</p>
              <p className="text-white/50 text-xs mt-0.5">명리학 기반 연애운 리포트</p>
            </div>
          </div>
        </div>

        {/* 결과 텍스트 */}
        <GlassCard glowEffect>
          <GlassCardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-linear-to-b from-violet-400 to-cyan-400" />
              <span className="text-white/70 text-sm font-semibold">연애 사주 분석</span>
            </div>
            <p className="text-white/80 text-[13.5px] leading-[2] whitespace-pre-wrap font-medium">
              {result}
            </p>
          </GlassCardContent>
        </GlassCard>

        <p className="text-white/20 text-xs text-center leading-relaxed px-2">
          ✦ 사주는 참고용이며, AI가 생성한 내용입니다
        </p>

        {/* 다시보기 버튼 */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-violet-500/40 to-cyan-500/40 blur-lg opacity-70" />
          <GlassButton variant="primary" size="lg" onClick={onBack} className="w-full rounded-xl">
            🔄 다시 보기
          </GlassButton>
        </div>
      </div>

      <BottomNav active={activeTab} onChange={onTabChange} />
    </div>
  )
}
