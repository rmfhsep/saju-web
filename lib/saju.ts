/**
 * 생년월일시 → 사주 원국(십성·오행 개수, 세운 관계) 계산.
 *
 * manseryeok 패키지가 사주팔자(연/월/일/시주)와 십신을 계산해주고,
 * 여기서는 그 결과를 prompt/maju_report_prompt_specv2.md 가 요구하는
 * 입력 변수 형태(개수 집계, 합충생극비화 판정)로 가공한다.
 */
import {
  calculateFourPillars,
  getHeavenlyStemElement,
  getEarthlyBranchElement,
  getHeavenlyStemYinYang,
  type FourPillars,
  type HeavenlyStem,
  type EarthlyBranch,
  type FiveElement,
  type TenGod,
} from "manseryeok"

export type Gender = "MALE" | "FEMALE"
export type CalendarType = "SOLAR" | "LUNAR" | "LUNAR_LEAP"

export interface SajuRawInput {
  birthDate: string // YYYYMMDD
  birthTime: string | null // "오전 9:30" 형식, 모름이면 null
  birthTimeUnknown: boolean
  calendarType: CalendarType
}

export interface SajuComputed {
  일간: string
  음양: "양간" | "음간"
  시주_입력여부: boolean
  세운_천간: string
  세운_지지: string
  일지: string
  월지: string
  식신_개수: number
  상관_개수: number
  인성_개수: number
  비겁_개수: number
  관성_개수: number
  재성_개수: number
  목_개수: number
  화_개수: number
  토_개수: number
  금_개수: number
  수_개수: number
  수오행_점수: number
  음간보정: number
  천간합: boolean
  천간충: boolean
  지지합: boolean
  지지충: boolean
  생관계: boolean
  극관계: boolean
  비화: boolean
  일지월지충: boolean
}

const STEM_COMBINE: Record<HeavenlyStem, HeavenlyStem> = {
  갑: "기", 기: "갑",
  을: "경", 경: "을",
  병: "신", 신: "병",
  정: "임", 임: "정",
  무: "계", 계: "무",
}

const STEM_CLASH: Partial<Record<HeavenlyStem, HeavenlyStem>> = {
  갑: "경", 경: "갑",
  을: "신", 신: "을",
  병: "임", 임: "병",
  정: "계", 계: "정",
}

const BRANCH_COMBINE: Record<EarthlyBranch, EarthlyBranch> = {
  자: "축", 축: "자",
  인: "해", 해: "인",
  묘: "술", 술: "묘",
  진: "유", 유: "진",
  사: "신", 신: "사",
  오: "미", 미: "오",
}

const BRANCH_CLASH: Record<EarthlyBranch, EarthlyBranch> = {
  자: "오", 오: "자",
  축: "미", 미: "축",
  인: "신", 신: "인",
  묘: "유", 유: "묘",
  진: "술", 술: "진",
  사: "해", 해: "사",
}

// 오행 상생(생): 목→화→토→금→수→목
const ELEMENT_GENERATES: Record<FiveElement, FiveElement> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
}

// 오행 상극(극): 목→토→수→화→금→목
const ELEMENT_CONTROLS: Record<FiveElement, FiveElement> = {
  목: "토", 토: "수", 수: "화", 화: "금", 금: "목",
}

function parseBirthDate(birthDate: string) {
  return {
    year: parseInt(birthDate.slice(0, 4), 10),
    month: parseInt(birthDate.slice(4, 6), 10),
    day: parseInt(birthDate.slice(6, 8), 10),
  }
}

/** "오전 9:30" / "오후 3:01" → 24시간제 {hour, minute} */
function parseBirthTime(birthTime: string): { hour: number; minute: number } {
  const m = birthTime.match(/(오전|오후)\s*(\d{1,2}):(\d{2})/)
  if (!m) return { hour: 12, minute: 0 }
  const [, ampm, hStr, minStr] = m
  let hour = parseInt(hStr, 10) % 12
  if (ampm === "오후") hour += 12
  return { hour, minute: parseInt(minStr, 10) }
}

function countTenGod(counts: Record<"식신" | "상관" | "인성" | "비겁" | "관성" | "재성", number>, tg: TenGod) {
  switch (tg) {
    case "식신": counts.식신++; break
    case "상관": counts.상관++; break
    case "정인": case "편인": counts.인성++; break
    case "비견": case "겁재": counts.비겁++; break
    case "정관": case "편관": counts.관성++; break
    case "정재": case "편재": counts.재성++; break
  }
}

function countElement(counts: Record<FiveElement, number>, el: FiveElement) {
  counts[el]++
}

export function computeSaju(input: SajuRawInput, gender: Gender): SajuComputed {
  const { year, month, day } = parseBirthDate(input.birthDate)
  const hasTime = !input.birthTimeUnknown && !!input.birthTime
  const { hour, minute } = hasTime ? parseBirthTime(input.birthTime!) : { hour: 12, minute: 0 }

  const result = calculateFourPillars({
    year, month, day, hour, minute,
    isLunar: input.calendarType !== "SOLAR",
    isLeapMonth: input.calendarType === "LUNAR_LEAP",
    gender: gender === "MALE" ? "male" : "female",
  })

  const dayMaster = result.day.heavenlyStem
  const dayYinYang = getHeavenlyStemYinYang(dayMaster)

  // 오행 개수 — 일간 포함, 시주는 입력된 경우만 포함
  const elementCounts: Record<FiveElement, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  const pillarsForElements: FourPillars = result
  const pillarKeys: (keyof FourPillars)[] = hasTime ? ["year", "month", "day", "hour"] : ["year", "month", "day"]
  for (const key of pillarKeys) {
    const pillar = pillarsForElements[key]
    countElement(elementCounts, getHeavenlyStemElement(pillar.heavenlyStem))
    countElement(elementCounts, getEarthlyBranchElement(pillar.earthlyBranch))
  }

  // 십성 개수 — 일간(day.stem) 제외, 시주는 입력된 경우만 포함
  const tenGodCounts = { 식신: 0, 상관: 0, 인성: 0, 비겁: 0, 관성: 0, 재성: 0 }
  countTenGod(tenGodCounts, result.tenGods.year.stem)
  countTenGod(tenGodCounts, result.tenGods.year.branch)
  countTenGod(tenGodCounts, result.tenGods.month.stem)
  countTenGod(tenGodCounts, result.tenGods.month.branch)
  countTenGod(tenGodCounts, result.tenGods.day.branch)
  if (hasTime) {
    countTenGod(tenGodCounts, result.tenGods.hour.stem)
    countTenGod(tenGodCounts, result.tenGods.hour.branch)
  }

  // 세운 — 현재 시점 기준 연주
  const now = new Date()
  const currentYearPillar = calculateFourPillars({
    year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(),
    hour: now.getHours(), minute: now.getMinutes(),
  }).year

  const dayElement = getHeavenlyStemElement(dayMaster)
  const sewunStemElement = getHeavenlyStemElement(currentYearPillar.heavenlyStem)

  return {
    일간: dayMaster,
    음양: dayYinYang === "양" ? "양간" : "음간",
    시주_입력여부: hasTime,
    세운_천간: currentYearPillar.heavenlyStem,
    세운_지지: currentYearPillar.earthlyBranch,
    일지: result.day.earthlyBranch,
    월지: result.month.earthlyBranch,
    식신_개수: tenGodCounts.식신,
    상관_개수: tenGodCounts.상관,
    인성_개수: tenGodCounts.인성,
    비겁_개수: tenGodCounts.비겁,
    관성_개수: tenGodCounts.관성,
    재성_개수: tenGodCounts.재성,
    목_개수: elementCounts.목,
    화_개수: elementCounts.화,
    토_개수: elementCounts.토,
    금_개수: elementCounts.금,
    수_개수: elementCounts.수,
    수오행_점수: elementCounts.수 >= 3 ? 90 : elementCounts.수 === 2 ? 60 : elementCounts.수 === 1 ? 30 : 0,
    음간보정: dayYinYang === "음" ? 20 : 0,
    천간합: STEM_COMBINE[dayMaster] === currentYearPillar.heavenlyStem,
    천간충: STEM_CLASH[dayMaster] === currentYearPillar.heavenlyStem,
    지지합: BRANCH_COMBINE[result.day.earthlyBranch] === currentYearPillar.earthlyBranch,
    지지충: BRANCH_CLASH[result.day.earthlyBranch] === currentYearPillar.earthlyBranch,
    생관계: ELEMENT_GENERATES[sewunStemElement] === dayElement,
    극관계: ELEMENT_CONTROLS[sewunStemElement] === dayElement,
    비화: sewunStemElement === dayElement,
    일지월지충: BRANCH_CLASH[result.day.earthlyBranch] === result.month.earthlyBranch,
  }
}
