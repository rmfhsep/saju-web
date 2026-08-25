/**
 * prompt/maju_matching_section_spec_1.0.md — "나와의 궁합" 섹션 계산 로직.
 * calcSajuScore/similarityScore/complementScore는 prompt/maju_matching_pool_spec.1.1.1.md § 4-2를
 * 그대로 옮겼다(매칭 풀 자체는 아직 구현 전이라 여기서 최초로 구현, 이후 매칭 풀에서도 재사용 가능).
 */
import { TABLE_표현, TABLE_감정, pickTag } from "@/lib/sajuReport"
import type { SajuReport } from "@/lib/prompts/sajuReport"

export interface AiTags {
  express: number
  emotion: number
  lead: number
  attach: number
}

export interface LifestyleFields {
  datingPurpose: string | null
  politics: string | null
  drinking: string | null
  smoking: string | null
  religion: string | null
}

export interface ReasonChip {
  slot: "emotion_similarity" | "lead_complement" | "lifestyle"
  label: string
}

export interface AxisComparison {
  axisKey: keyof AiTags
  label: string
  relationType: "similar" | "complement"
  userValue: number
  candidateValue: number
  leftLabel: string
  rightLabel: string
}

export interface CompatibilitySectionViewModel {
  score: number
  chips: [ReasonChip, ReasonChip, ReasonChip]
  interpretation: { sentence1: string; sentence2: string; sentence3: string }
  // spec § 2-2의 axes는 대표 유사축·보완축 2개뿐이지만, Figma "기질 비교" 카드(node 743:5798 등)는
  // 4개 축을 모두 보여준다. UI 인터페이스는 spec에서도 "참고용"으로 명시돼 있어, 화면은 4축 전부를
  // 그대로 렌더링하고 대표축 선택(selectRepresentativeAxes)은 interpretation 문장 생성에만 사용한다.
  axes: AxisComparison[]
  showSiJuNotice: boolean
  siJuNoticeText?: string
}

// § 4-2 재사용 — 유사도: 수치 차이가 작을수록 높은 점수
function similarityScore(a: number, b: number): number {
  return 100 - Math.abs(a - b)
}
// § 4-2 재사용 — 보완도: 두 수치의 합이 100에 가까울수록 높은 점수
function complementScore(a: number, b: number): number {
  return 100 - Math.abs(a + b - 100)
}

export function calcSajuScore(userTags: AiTags, candidateTags: AiTags): number {
  const expressScore = similarityScore(userTags.express, candidateTags.express)
  const emotionScore = similarityScore(userTags.emotion, candidateTags.emotion)
  const leadScore = complementScore(userTags.lead, candidateTags.lead)
  const attachScore = complementScore(userTags.attach, candidateTags.attach)
  return (expressScore + emotionScore + leadScore + attachScore) / 4
}

function mapEmotionLabel(s: number): string {
  if (s >= 80) return "감정 스타일이 잘 맞아요"
  if (s >= 50) return "감정 결이 비슷해요"
  return "감정 표현 방식이 달라요"
}
function mapLeadLabel(s: number): string {
  if (s >= 80) return "주도성이 딱 보완돼요"
  if (s >= 50) return "성향이 서로 보완돼요"
  return "서로 다른 속도로 다가가요"
}
function mapLifestyleLabel(matchCount: number): string {
  if (matchCount >= 4) return "라이프스타일 비슷해요"
  if (matchCount >= 1) return "라이프스타일 잘 맞아요"
  return "라이프스타일이 달라요"
}

// matching_pool_spec § 3-4 POLITICS_MATCH_MAP 양방향 재사용 — 실제 옵션 값(modules/profile/constants.ts) 기준
const POLITICS_MATCH_MAP: Record<string, string[]> = {
  보수: ["보수", "중도", "관심 없음"],
  중도: ["보수", "중도", "진보", "관심 없음"],
  진보: ["진보", "중도", "관심 없음"],
  "관심 없음": ["보수", "중도", "진보", "관심 없음"],
}
function politicsMatched(a: string, b: string): boolean {
  return (POLITICS_MATCH_MAP[a]?.includes(b) ?? true) && (POLITICS_MATCH_MAP[b]?.includes(a) ?? true)
}

// modules/profile/constants.ts DRINKING_OPTIONS 순서 그대로
const DRINKING_ORDER: Record<string, number> = {
  비음주: 1,
  "가끔 마심": 2,
  "월 3~4회 정도": 3,
  "월 5회 이상": 4,
}

// matching_pool_spec § 2-2 재사용 — "잘 모르겠어요."(unknown)는 항상 매칭 허용
const DATING_UNKNOWN = "잘 모르겠어요."
const DATING_MARRIAGE = "결혼을 고려한 연애를 하고 싶어요."
const DATING_CASUAL = "아직은 연애에만 집중하고 싶어요."
function datingPurposeCompatible(a: string, b: string): boolean {
  if (a === DATING_UNKNOWN || b === DATING_UNKNOWN) return true
  return !((a === DATING_MARRIAGE && b === DATING_CASUAL) || (a === DATING_CASUAL && b === DATING_MARRIAGE))
}

// matching_pool_spec § 3-5 religionMatched()의 취지(선택적 필터 일치 확인) 재사용. 다만 이 프로젝트
// 스키마에는 아직 preferenceFilters(다중 선택 필터 목록)가 없어(온보딩 필터는 단일 선택), 완전 일치로
// 단순화했다 — 매칭을 걸러내는 로직이 아니라 이유 칩 문구용 근사치이므로 매칭 풀 하드필터와는 별개.
function religionMatched(a: string, b: string): boolean {
  return a === b
}

// § 3-3 — 라이프스타일 필드 일부 미입력 시 skip(예외처리 §6): 값이 있는 항목만 비교에 포함한다.
function countLifestyleMatches(user: LifestyleFields, candidate: LifestyleFields): number {
  let count = 0

  if (user.datingPurpose && candidate.datingPurpose) {
    if (datingPurposeCompatible(user.datingPurpose, candidate.datingPurpose)) count++
  }
  if (user.politics && candidate.politics) {
    if (politicsMatched(user.politics, candidate.politics)) count++
  }
  if (user.drinking && candidate.drinking) {
    const a = DRINKING_ORDER[user.drinking]
    const b = DRINKING_ORDER[candidate.drinking]
    // ⚠️ 매칭 풀의 하드 필터(상한선 단방향)와 달리 이유 칩 표시용으로 "1단계 이내 차이"로 완화(§ 3-3)
    if (a != null && b != null && Math.abs(a - b) <= 1) count++
  }
  if (user.smoking && candidate.smoking && user.smoking === candidate.smoking) count++
  if (user.religion && candidate.religion && religionMatched(user.religion, candidate.religion)) count++

  return count
}

function computeReasonChips(
  userTags: AiTags,
  candidateTags: AiTags,
  userLifestyle: LifestyleFields,
  candidateLifestyle: LifestyleFields,
): [ReasonChip, ReasonChip, ReasonChip] {
  const emotionSlotScore =
    (similarityScore(userTags.express, candidateTags.express) + similarityScore(userTags.emotion, candidateTags.emotion)) / 2
  const leadSlotScore =
    (complementScore(userTags.lead, candidateTags.lead) + complementScore(userTags.attach, candidateTags.attach)) / 2
  const matchCount = countLifestyleMatches(userLifestyle, candidateLifestyle)

  return [
    { slot: "emotion_similarity", label: mapEmotionLabel(emotionSlotScore) },
    { slot: "lead_complement", label: mapLeadLabel(leadSlotScore) },
    { slot: "lifestyle", label: mapLifestyleLabel(matchCount) },
  ]
}

function selectRepresentativeAxes(userTags: AiTags, candidateTags: AiTags) {
  const similarAxis: "express" | "emotion" =
    similarityScore(userTags.express, candidateTags.express) >= similarityScore(userTags.emotion, candidateTags.emotion)
      ? "express"
      : "emotion"
  const complementAxis: "lead" | "attach" =
    complementScore(userTags.lead, candidateTags.lead) >= complementScore(userTags.attach, candidateTags.attach)
      ? "lead"
      : "attach"
  return { similarAxis, complementAxis }
}

// § 3-5 문장② — 대표 유사축 × 대표 보완축 2x2 조합
const SENTENCE2_TEMPLATE: Record<"express" | "emotion", Record<"lead" | "attach", string>> = {
  express: {
    lead: "표현 방식이 잘 맞으면서도 관계를 이끄는 속도는 서로 보완되는 조합이에요",
    attach: "표현 방식이 잘 맞으면서도 애정 온도는 서로 보완되는 조합이에요",
  },
  emotion: {
    lead: "감정의 결이 비슷하면서도 관계를 이끄는 속도는 서로 보완되는 조합이에요",
    attach: "감정의 결이 비슷하면서도 애정 온도는 서로 보완되는 조합이에요",
  },
}
// § 3-5 문장③ — 기대 효과 (sajuScore 50 미만 없음 전제, § 1)
const SENTENCE3_HIGH = "함께할수록 편안함이 커질 궁합이에요"
const SENTENCE3_MID = "신뢰가 쌓일수록 만족도가 커질 궁합이에요"

// § 3-5 문장① — maju_report_prompt_spec 표현방식/감정깊이 태그·설명 테이블(TABLE_표현/TABLE_감정) 재사용
function buildCandidateTraitSentence(candidateTags: AiTags, axis: "express" | "emotion", candidateNickname: string): string {
  const table = axis === "express" ? TABLE_표현 : TABLE_감정
  const { 설명 } = pickTag(table, candidateTags[axis])
  return `${candidateNickname}님은 ${설명}`
}

function buildInterpretation(
  candidateTags: AiTags,
  candidateNickname: string,
  similarAxis: "express" | "emotion",
  complementAxis: "lead" | "attach",
  score: number,
) {
  const sentence1 = buildCandidateTraitSentence(candidateTags, similarAxis, candidateNickname)
  const sentence2 = SENTENCE2_TEMPLATE[similarAxis][complementAxis]
  const sentence3 = score >= 80 ? SENTENCE3_HIGH : SENTENCE3_MID
  return { sentence1, sentence2, sentence3 }
}

// § 3-6 — 0~20 / 81~100 구간 태그명만 추출 (Figma 기질 비교 카드 좌우 라벨과 동일 표기)
const AXIS_META: Record<keyof AiTags, { label: string; left: string; right: string; relationType: "similar" | "complement" }> = {
  express: { label: "표현 방식", left: "내면형", right: "감성형", relationType: "similar" },
  emotion: { label: "감정 깊이", left: "쿨한편", right: "매우 깊음", relationType: "similar" },
  lead: { label: "주도성", left: "대기형", right: "매우 주도적", relationType: "complement" },
  attach: { label: "집착도", left: "자유형", right: "매우 몰입", relationType: "complement" },
}
const AXIS_ORDER: (keyof AiTags)[] = ["express", "emotion", "lead", "attach"]

function buildAxes(userTags: AiTags, candidateTags: AiTags): AxisComparison[] {
  return AXIS_ORDER.map(key => ({
    axisKey: key,
    label: AXIS_META[key].label,
    relationType: AXIS_META[key].relationType,
    userValue: userTags[key],
    candidateValue: candidateTags[key],
    leftLabel: AXIS_META[key].left,
    rightLabel: AXIS_META[key].right,
  }))
}

export function buildCompatibilitySection(input: {
  userReport: SajuReport
  candidateReport: SajuReport
  candidateNickname: string
  userLifestyle: LifestyleFields
  candidateLifestyle: LifestyleFields
}): CompatibilitySectionViewModel | null {
  const userTags = input.userReport.섹션1_연애기질.ai_tags
  const candidateTags = input.candidateReport.섹션1_연애기질.ai_tags

  const score = Math.round(calcSajuScore(userTags, candidateTags))

  // § 6 예외 처리 — 매칭 풀 floor(sajuScore >= 50, § 1)가 아직 반영되지 않은 상태로 후보가 내려온
  // 경우를 조기 탐지하기 위한 방어 코드. 섹션 자체를 렌더링하지 않고 로깅만 한다.
  if (score < 50) {
    console.error("[matching] sajuScore < 50 후보가 궁합 섹션까지 도달함(매칭 풀 floor 미반영 의심)", { score })
    return null
  }

  const chips = computeReasonChips(userTags, candidateTags, input.userLifestyle, input.candidateLifestyle)
  const { similarAxis, complementAxis } = selectRepresentativeAxes(userTags, candidateTags)
  const interpretation = buildInterpretation(candidateTags, input.candidateNickname, similarAxis, complementAxis, score)
  const axes = buildAxes(userTags, candidateTags)

  const hasSiJu = input.userReport.meta.시주입력여부 && input.candidateReport.meta.시주입력여부
  const siJuNoticeText = input.candidateReport.meta.시주미입력안내 ?? input.userReport.meta.시주미입력안내

  return {
    score,
    chips,
    interpretation,
    axes,
    showSiJuNotice: !hasSiJu,
    siJuNoticeText,
  }
}
