/**
 * 오늘의 연애운 배너/상세 리포트 — 결정론적 규칙 기반 계산.
 * prompt/maju_today_fortune.md 명세를 그대로 옮긴 순수 함수.
 *
 * AI 호출이 없는 순수 lookup이라, 스펙 문서의 "매일 배치 + DB 캐싱"과 달리
 * 요청 시점에 매번 재계산한다 — 같은 날짜엔 항상 같은 입력(생일 고정 + 날짜)이므로
 * 캐싱 없이도 하루 동안 동일한 결과가 보장된다.
 */
import { getHeavenlyStemElement, type FiveElement, type HeavenlyStem, type EarthlyBranch } from "manseryeok"
import { computeSaju, computeDayMasterRelation, calculateTodayPillar, type Gender, type CalendarType, type DailyRelation } from "@/lib/saju"
import type { SajuReport } from "@/lib/prompts/sajuReport"

type Level = "HIGH" | "MID" | "LOW"

export interface DailyFortuneUserInput {
  userId: number
  birthDate: string | null
  birthTime: string | null
  birthTimeUnknown: boolean
  calendarType: string | null
  gender: string | null
  sajuResult: string | null
}

export interface DailyFortune {
  date: string
  level: Level
  text: string
  icon: "high" | "mid" | "low"
  총운: { score: number; level: Level }
  애정운: { level: Level; text: string }
  새로운인연운: { level: Level; text: string }
  궁합좋은상대: { 유형명: string; 태그: string[] } | null
  행운의아이템: string
}

// [섹션6] 레벨별 배너 문구 풀 — 5개씩, 날짜+userId 시드로 로테이션
const BANNER_TEXT_POOL: Record<Level, string[]> = {
  HIGH: [
    "오늘은 인연의 기운이 강해요, 대화를 먼저 걸어보세요",
    "설렘 지수 최고! 오늘 만남에 적극적으로 움직여보세요",
    "좋은 인연의 신호가 보이는 하루예요",
    "오늘 대화한 사람, 눈여겨봐도 좋아요",
    "연애운이 상승하는 날, 먼저 다가가 보세요",
  ],
  MID: [
    "잔잔하지만 안정적인 하루예요",
    "서두르지 않아도 괜찮은 하루예요",
    "평소처럼 자연스럽게 흘러가는 날이에요",
    "무리한 기대보단 편안한 마음이 필요한 날",
    "관계를 천천히 알아가기 좋은 하루예요",
  ],
  LOW: [
    "오늘은 흐름이 살짝 느려요, {아이템}과 함께 가볍게 극복해봐요",
    "컨디션이 낮은 날이지만, {아이템}이 기분을 바꿔줄 거예요",
    "잠깐 주춤하는 하루, {아이템}으로 분위기를 환기해보세요",
    "오늘은 나를 먼저 다독여야 할 때, {아이템} 하나면 충분해요",
    "가라앉기 쉬운 하루예요, {아이템}과 함께 이겨내봐요",
  ],
}

// [섹션10-1] 새로운 인연운 — 지지 관계만으로 판정, 레벨별 고정 문구
const NEW_MEET_TEXT: Record<Level, string> = {
  HIGH: "새로운 사람과의 만남운이 열리는 날이에요, 소개팅이나 새 모임에 나가보세요",
  MID: "새로운 만남보다는 이미 알던 사람과의 대화에 집중해보세요",
  LOW: "새로운 만남은 다음으로 미루고, 지금의 관계를 돌보는 게 좋은 날이에요",
}

// [섹션10-3] 오늘 일진 천간의 오행 기준 행운의 아이템 — 모두 받침 있는 명사로 통일(조사 "과/이" 고정 삽입)
const LUCKY_ITEM: Record<FiveElement, string> = {
  목: "초록빛 식물이나 액세서리",
  화: "붉은 계열의 립스틱이나 소품",
  토: "베이지·가죽 계열 아이템",
  금: "실버 액세서리나 화이트 톤 아이템",
  수: "다크 톤 소품이나 향수",
}

// [섹션5] 관계 유형별 오늘 레벨 (HIGH=2, MID=1, LOW=0) — 세운(연간)과는 다른 단일 컬럼 값
const RELATION_VALUE: Record<keyof DailyRelation, number> = {
  천간합: 2, 천간충: 0, 지지합: 2, 지지충: 0, 생관계: 2, 극관계: 0, 비화: 1,
}

function levelAndScore(rel: DailyRelation): { level: Level; score: number } {
  const active = (Object.keys(rel) as (keyof DailyRelation)[]).filter(k => rel[k])
  // 비화라도 항상 하나는 성립하므로 active가 비는 경우는 이론상 없다 — 안전장치로 MID(=1) 기본값
  const avg = active.length === 0 ? 1 : active.reduce((sum, k) => sum + RELATION_VALUE[k], 0) / active.length
  const level: Level = avg >= 1.5 ? "HIGH" : avg >= 0.5 ? "MID" : "LOW"
  const score = Math.round((avg / 2) * 100)
  return { level, score }
}

function newMeetLevel(rel: DailyRelation): Level {
  if (rel.지지합) return "HIGH"
  if (rel.지지충) return "LOW"
  return "MID"
}

// djb2 계열 결정론적 해시 — 같은 (userId, date) 입력엔 항상 같은 값
function hashSeed(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

function pickBannerText(level: Level, userId: number, dateStr: string, luckyItem: string): string {
  const pool = BANNER_TEXT_POOL[level]
  const idx = hashSeed(`${userId}-${dateStr}`) % pool.length
  const template = pool[idx]
  return level === "LOW" ? template.replace("{아이템}", luckyItem) : template
}

/** 오늘 날짜를 KST 기준 "YYYY-MM-DD"로 — 서버 타임존과 무관하게 항상 KST 자정 기준으로 바뀐다. */
export function todayDateStrKst(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date)
}

/** 연간 리포트(JSON string)에서 "궁합 좋은 상대" 카드에 쓸 값만 뽑아낸다. 없거나 파싱 실패 시 null. */
function extractGoodMatch(sajuResult: string | null): { 유형명: string; 태그: string[] } | null {
  if (!sajuResult) return null
  try {
    const parsed = JSON.parse(sajuResult) as SajuReport
    const 끌리는유형 = parsed?.섹션2_이상형유형?.끌리는유형
    if (!끌리는유형) return null
    return { 유형명: 끌리는유형.유형명, 태그: 끌리는유형.태그.slice(0, 3) }
  } catch {
    return null
  }
}

/**
 * 유저의 사주 입력값 + 오늘 날짜로 오늘의 운세를 계산한다.
 * 생년월일/성별/양음력 중 하나라도 없으면(온보딩 미완료) null.
 */
export function computeDailyFortune(user: DailyFortuneUserInput, now: Date = new Date()): DailyFortune | null {
  if (!user.birthDate || !user.calendarType || !user.gender) return null

  const saju = computeSaju(
    {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthTimeUnknown: user.birthTimeUnknown,
      calendarType: user.calendarType as CalendarType,
    },
    user.gender as Gender,
  )

  const todayPillar = calculateTodayPillar(now)
  const rel = computeDayMasterRelation(
    saju.일간 as HeavenlyStem,
    saju.일지 as EarthlyBranch,
    todayPillar.heavenlyStem,
    todayPillar.earthlyBranch,
  )

  const dateStr = todayDateStrKst(now)
  const { level, score } = levelAndScore(rel)
  const luckyItem = LUCKY_ITEM[getHeavenlyStemElement(todayPillar.heavenlyStem)]
  const bannerText = pickBannerText(level, user.userId, dateStr, luckyItem)
  const meetLevel = newMeetLevel(rel)

  return {
    date: dateStr,
    level,
    text: bannerText,
    icon: level === "HIGH" ? "high" : level === "MID" ? "mid" : "low",
    총운: { score, level },
    애정운: { level, text: bannerText },
    새로운인연운: { level: meetLevel, text: NEW_MEET_TEXT[meetLevel] },
    궁합좋은상대: extractGoodMatch(user.sajuResult),
    행운의아이템: luckyItem,
  }
}
