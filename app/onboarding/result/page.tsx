"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import type { SajuReport } from "@/lib/prompts/sajuReport"
import RunnerGame from "@/components/ui/runner-game"
import StarIcon from "@/components/ui/star-icon"
import { WarningIcon } from "@/components/ui/icons"
import { calcAge } from "@/lib/age"
import { queryKeys } from "@/lib/queries/keys"

type Reco = {
  id: number
  nickname: string | null
  name: string | null
  photos: string | null
  birthDate: string | null
  bioTags: string | null
}

const CARD_GRADIENTS = [
  "linear-gradient(160deg, #b5b0d6 0%, #8b7aa8 100%)",
  "linear-gradient(160deg, #a8c4b0 0%, #6b9e7a 100%)",
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

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="9" fill="#FF334B"/>
  <path d="M10 6.66675V10.8334" stroke="white" stroke-width="1.25" stroke-linecap="round"/>
  <circle cx="10.0002" cy="13.2292" r="0.729167" fill="white"/>
</svg>
  )
}

const LEVEL_LABEL: Record<string, string> = { HIGH: "높음", MID: "보통", LOW: "낮음" }
// 레벨별 뱃지 색상: 높음-빨강 / 보통-파랑 / 낮음-노랑
const LEVEL_BADGE: Record<string, string> = {
  HIGH: "text-[#ff334b] bg-[#feecec]",
  MID: "text-[#1a75ff] bg-[#e9f1ff]",
  LOW: "text-[#e5920a] bg-[#fff3df]",
}

// 4축 점수 막대 (표현/감정깊이/주도성/집착도)
// 숫자는 막대 바로 위에 붙어 있어야 함 → 막대 높이만큼만 차지하는 컨테이너를 bottom 정렬
function ScoreBar({ label, score }: { label: string; score: number }) {
  const height = Math.round(Math.min(100, Math.max(0, score)) * 0.82 + 20)
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="h-[124px] flex flex-col items-center justify-end gap-1">
        <span className="text-[12px] font-semibold text-[#1a75ff] leading-[1.4]">{score}</span>
        <div
          className="w-4 bg-linear-to-b from-[#b6d0ff] to-[#e4eeff] rounded-[30px] transition-all"
          style={{ height }}
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
      {/* 마이(report)와 동일하게 축별 유형 태그 + 설명을 각각 노출 (병합된 줄글 아님) */}
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
              <span className={`text-[11px] font-medium rounded-[4px] px-1.5 py-[2px] ${LEVEL_BADGE[p.레벨] ?? LEVEL_BADGE.MID}`}>{LEVEL_LABEL[p.레벨] ?? p.레벨}</span>
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
    <div className="bg-[#fff5e5] rounded-[4px] px-5 py-4 flex flex-col gap-4">
      <p className="text-[17px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.34px]">주의 포인트</p>
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="flex gap-2">
            <WarningIcon size={20} className="shrink-0 mt-0.5" />
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

// 분석 대기 화면 — 스피너 대신 별 모으기 미니게임. 분석이 끝나면 '결과 보기' 활성화.
// 게임은 최초 리포트 생성 시 1회만 노출한다(재생성 시 재도전 방지) — showGame=false면 안내 문구만 보여준다.
function AnalyzingGameScreen({ name, ready, showGame, earnedStars, onGameOver, onReveal }: {
  name: string
  ready: boolean
  showGame: boolean
  earnedStars: number
  onGameOver: (survivalSeconds: number) => void
  onReveal: () => void
}) {
  return (
    <Screen>
      <div className="flex flex-col px-5 pt-[52px] gap-2">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
          {ready ? "분석이 완료됐어요!" : <>{name}님의 연애운을<br />분석하고 있어요...</>}
        </h1>
        <p className="text-[15px] text-[#777] leading-normal tracking-[-0.3px]">
          {showGame ? "기다리는 동안 별을 모아보세요. 오래 생존할수록 별이 더 적립돼요!" : "잠시만 기다려주세요."}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 px-5">
        {earnedStars > 0 && (
          <div className="self-center flex items-center gap-1.5 h-[34px] px-3.5 bg-[#fff5e5] rounded-full">
            <StarIcon size={20} color="#FFA100" />
            <span className="text-[15px] font-bold text-[#1f1f1f]">+{earnedStars}</span>
          </div>
        )}
        {showGame && <RunnerGame height={220} maxPlays={3} onGameOver={onGameOver} />}
      </div>

      <div className="keyboard-footer">
        <button
          onClick={ready ? onReveal : undefined}
          disabled={!ready}
          className={`w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] transition-colors ${
            ready ? "bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80" : "bg-[#f4f4f5] text-[#a0a0a0]"
          }`}
        >
          {ready ? "결과 보기" : "분석 중..."}
        </button>
      </div>
    </Screen>
  )
}

function ResultContent() {
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const name = params.get("name") ?? "혜민"
  const gender = params.get("gender") ?? ""
  const calendarType = params.get("calendarType") ?? "SOLAR"
  const bd = params.get("bd") ?? ""
  const bt = params.get("bt") ?? ""
  const [report, setReport] = useState<SajuReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  // 서버가 구분해서 내려주는 실패 사유 — "INVALID_LEAP_MONTH"면 재시도가 아니라
  // 출생 정보를 고치러 돌아가야 하는 케이스라 CTA 문구/동작이 달라진다.
  const [retryErrorCode, setRetryErrorCode] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [earnedStars, setEarnedStars] = useState(0)
  // 최초 리포트 생성 시 1회만 게임을 노출 — 이미 지급받은 유저는 게임을 건너뛴다.
  const [miniGamePlayed, setMiniGamePlayed] = useState<boolean | null>(null)
  const [bestSeconds, setBestSeconds] = useState(0)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [starsSubmitted, setStarsSubmitted] = useState(false)
  const [maleRecos, setMaleRecos] = useState<Reco[]>([])
  const [maleRecosLoading, setMaleRecosLoading] = useState(true)

  function handleGameOver(survivalSeconds: number) {
    setHasPlayed(true)
    setBestSeconds(prev => Math.max(prev, survivalSeconds))
  }

  // 3회 중 최고 생존시간 하나만 서버로 보내 별을 지급받는다(강제 종료·기회 소진 시 1회만 호출).
  async function awardStars(seconds: number) {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    try {
      const res = await fetch("/api/stars/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bestSeconds: seconds }),
      })
      const d = await res.json()
      if (res.ok && d.earned) {
        setEarnedStars(d.earned)
        // 홈 화면(app/page.tsx) 첫 진입 시 별 적립 안내 모달을 띄우기 위한 1회성 플래그
        localStorage.setItem("star_reward_pending", String(d.earned))
        // 이후 홈/스토어 등에서 useMe()로 읽는 별 개수가 곧바로 반영되도록 캐시를 무효화한다.
        queryClient.invalidateQueries({ queryKey: queryKeys.me })
      }
      setMiniGamePlayed(true)
    } catch { /* ignore */ }
  }

  async function generateReport(token: string) {
    setRetrying(true)
    setRetryErrorCode(null)
    try {
      const res = await fetch("/api/saju/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.sajuResult) {
        try { setReport(JSON.parse(data.sajuResult)) } catch { /* ignore */ }
      } else {
        setRetryErrorCode(data.error === "INVALID_LEAP_MONTH" ? "INVALID_LEAP_MONTH" : "UNKNOWN")
      }
    } catch {
      setRetryErrorCode("UNKNOWN")
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
        if (typeof user?.miniGamePlayed === "boolean") setMiniGamePlayed(user.miniGamePlayed)
        if (user?.sajuResult) {
          try {
            const parsed = JSON.parse(user.sajuResult)
            // 섹션1이 없으면 불완전한 데이터 (max_tokens 부족으로 잘린 경우 등) → 재생성
            if (parsed?.섹션1_연애기질?.표현방식) {
              setReport(parsed)
            } else {
              generateReport(token)
            }
          } catch {
            generateReport(token)
          }
        } else if (user) {
          generateReport(token)
        }
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 남성 유저에게 보여줄 추천 프로필 카드 — 홈 화면과 동일한 추천 로직을 재사용한다.
  useEffect(() => {
    if (gender !== "MALE") { setMaleRecosLoading(false); return }
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) { setMaleRecosLoading(false); return }
    fetch("/api/users/discover", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setMaleRecos(((d?.users as Reco[] | undefined) ?? []).slice(0, 2)))
      .catch(() => setMaleRecos([]))
      .finally(() => setMaleRecosLoading(false))
  }, [gender])

  const ready = !loading && !retrying

  // 분석은 백그라운드에서 진행되고 게임은 항상 3판 다 즐길 수 있다 — 결과 보기를 누르는 시점에
  // (그때까지의) 최고 생존시간 1개만 서버로 제출한다.
  async function handleReveal() {
    if (!starsSubmitted && miniGamePlayed === false && hasPlayed) {
      setStarsSubmitted(true)
      await awardStars(bestSeconds)
    }
    setRevealed(true)
  }

  const genderLabel = gender === "MALE" ? " (남성)" : gender === "FEMALE" ? " (여성)" : ""
  const isMale = gender === "MALE"
  const birthDisplay = formatBirthDisplay(bd, bt, calendarType)

  if (!revealed) {
    return (
      <AnalyzingGameScreen
        name={name}
        ready={ready}
        showGame={miniGamePlayed === false}
        earnedStars={earnedStars}
        onGameOver={handleGameOver}
        onReveal={handleReveal}
      />
    )
  }

  const infoCard = (
    <div className="bg-[#f7f7f8] rounded-[4px] px-5 py-4 flex flex-col gap-1">
      <p className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">{name}{genderLabel}</p>
      <p className="text-[14px] font-normal text-[#1f1f1f] leading-normal tracking-[-0.14px]">{birthDisplay}</p>
    </div>
  )

  return (
    <Screen>
      {/* Header — left-aligned title, matches Figma */}
      <div className="sticky top-0 z-10 bg-white h-[52px] flex items-center px-5">
        <button
          onClick={() => bridgeBack()}
          className="w-8 h-8 flex items-center justify-center mr-2 shrink-0"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path
              d="M9 1L1 9L9 17"
              stroke="#0f0f10"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className="text-[18px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.36px]">
          연애운 리포트
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-5 pt-5 pb-4 flex flex-col gap-7 scroll-area overflow-y-auto">
        {/* 분석 완료 badge + 제목 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {/* Blue check circle */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" fill="#1A75FF"/>
  <path d="M8.25 12L10.75 14.5L15.75 9.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
            <span className="text-[16px] font-semibold text-[#1a75ff] leading-normal tracking-[-0.32px]">
              분석 완료
            </span>
          </div>
          <h1 className="text-[22px] font-bold text-[#0f0f10] leading-[1.4] tracking-[-0.44px]">
            {isMale ? (
              <>
                {name}님의 연애 성향을 분석해
                <br />
                프로필을 준비했어요.
              </>
            ) : (
              <>{name}님의 연애 성향과 올해 연애운</>
            )}
          </h1>
        </div>

        {!report ? (
          <div className="flex flex-col gap-3">
            {infoCard}
            <div className="flex items-center gap-2">
              <ErrorIcon />
              <p className="flex-1 text-[14px] font-medium text-[#1f1f1f] leading-normal tracking-[-0.14px]">
                {retryErrorCode === "INVALID_LEAP_MONTH" ? (
                  <>입력하신 생년월일이 윤달에 해당하지 않아 분석 중<br />오류가 발생했습니다.</>
                ) : (
                  <>일시적인 오류로 사주 분석을 완료하지 못했어요.<br />다시 시도해주세요.</>
                )}
              </p>
            </div>
          </div>
        ) : isMale ? (
          <>
            {/* 유저 정보 + 나의 연애 기질 */}
            <div className="flex flex-col gap-3">
              {infoCard}
              <TemperamentCard section={report.섹션1_연애기질} />
            </div>

            {/* 추천 프로필 캐러셀 + CTA */}
            <div className="flex flex-col gap-3">
              <div
                className="overflow-x-auto flex gap-3 pb-1 -mx-5 px-5"
                style={{ scrollbarWidth: "none" }}
              >
                {maleRecosLoading ? (
                  [0, 1].map((i) => (
                    <div
                      key={i}
                      className="shrink-0 w-[300px] h-[400px] rounded-[8px] bg-[#f4f4f5] animate-pulse"
                    />
                  ))
                ) : maleRecos.length === 0 ? (
                  <div className="shrink-0 w-full h-[200px] rounded-[8px] bg-[#f4f4f5] flex items-center justify-center">
                    <p className="text-[14px] text-[#777]">
                      아직 추천할 프로필이 없어요.
                    </p>
                  </div>
                ) : (
                  maleRecos.map((reco, i) => {
                    const photos: string[] = reco.photos
                      ? JSON.parse(reco.photos)
                      : [];
                    const tags: string[] = reco.bioTags
                      ? JSON.parse(reco.bioTags)
                      : [];
                    const displayName = reco.nickname || reco.name || "";
                    const age = calcAge(reco.birthDate);
                    return (
                      <div
                        key={reco.id}
                        className="shrink-0 w-[300px] h-[400px] rounded-[8px] relative overflow-hidden"
                        style={
                          photos[0]
                            ? undefined
                            : {
                                background:
                                  CARD_GRADIENTS[i % CARD_GRADIENTS.length],
                              }
                        }
                      >
                        {photos[0] && (
                          <img
                            src={photos[0]}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <div
                          className="absolute inset-0 rounded-[8px]"
                          style={
                            {
                              background: "rgba(31,31,31,0.52)",
                              backdropFilter: "blur(10px)",
                              WebkitBackdropFilter: "blur(10px)",
                              transform: "translateZ(0)",
                              willChange: "transform",
                            } as React.CSSProperties
                          }
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[20px] font-semibold text-white leading-[1.4] tracking-[-0.4px]">
                              {displayName}
                            </span>
                            {age != null && (
                              <>
                                <span className="text-[20px] font-semibold text-white leading-[1.4] tracking-[-0.4px]">
                                  /
                                </span>
                                <span className="text-[20px] font-semibold text-white leading-[1.4] tracking-[-0.4px]">
                                  {age}살
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
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
                    );
                  })
                )}
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
      <div className="keyboard-footer bg-white">
        {!report ? (
          <button
            onClick={() => {
              if (retryErrorCode === "INVALID_LEAP_MONTH") {
                bridgeNavigate("BirthInfo")
                return
              }
              const token = localStorage.getItem("auth_token")
              if (token) generateReport(token)
            }}
            className="w-full h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] text-[#1f1f1f] active:opacity-80"
          >
            {retryErrorCode === "INVALID_LEAP_MONTH" ? "출생 정보 다시 입력하기" : "다시 분석하기"}
          </button>
        ) : (
          <button
            onClick={() => bridgeNavigate("Blocking")}
            className="w-full h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] text-[#1f1f1f] active:opacity-80"
          >
            내 프로필 만들기
          </button>
        )}
      </div>
    </Screen>
  );
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  )
}
