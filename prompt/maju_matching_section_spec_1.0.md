# 사주로 본 추천 이유 섹션 — 개발 스펙

> **대상**: 프론트엔드 / 백엔드 개발자
> **위치**: 프로필 카드 화면 하단, 추천 상대 프로필마다 1개
> **연관 문서**: maju_report_prompt_spec.md, maju_matching_pool_spec.md, maju_saju_recommendation_section_spec.md(기획 문서, 결정 근거)
> **버전**: v1.0

---

## 1. 선행 조건 (백엔드 변경 필요 — 반드시 먼저 반영)

이 섹션은 **추천된 후보의 sajuScore가 이미 50점 이상으로 보장된다는 전제**로 동작한다. 별도의 최소 점수 체크 로직을 프론트엔드에 두지 않으므로, 아래 변경이 선행되어야 한다.

```typescript
// matching_pool_spec.md 매칭 풀 구성 단계에 추가 (Hard/User Filter 이후, Soft Scoring 이전)
function applySajuScoreFloor(candidate: ScoredCandidate): boolean {
  return candidate.sajuScore >= 50
}
```

- 근거: `similarityScore`/`complementScore` 두 공식 모두 50점이 "무작위 기준선"에 해당 (기획 문서 § 5-1 참고)
- **이 조건이 반영되지 않은 상태에서 프론트엔드를 배포하면 sajuScore 50 미만 후보에게도 이 섹션이 노출되며, § 4-3 문장② 템플릿에 해당 구간 카피가 없어 빈 텍스트가 렌더링된다.**

---

## 2. 데이터 계약 (Data Contract)

### 2-1. 입력 타입

```typescript
interface AiTags {
  express: number  // 0~100
  emotion: number   // 0~100
  lead: number       // 0~100
  attach: number    // 0~100
}

interface LifestyleFields {
  datingPurpose: DatingPurpose        // maju_matching_pool_spec.md § 8
  politicalView: PoliticalView
  drinkingFrequency: DrinkingFrequency
  smokingStatus: SmokingStatus
  religion: Religion
  preferenceFilters: PreferenceFilter[]  // religionMatched() 계산에 필요
}

interface RecommendationSectionInput {
  sajuScore: number          // 0~100, 정수. 매칭 API 응답에서 그대로 전달 (50 미만 없음 전제)
  userTags: AiTags
  candidateTags: AiTags
  userLifestyle: LifestyleFields
  candidateLifestyle: LifestyleFields
  hasSiJu: boolean            // 시주 입력 여부, meta.시주미입력안내 노출 판단용
}
```

### 2-2. 출력 타입 (컴포넌트가 렌더링에 사용하는 최종 뷰모델)

```typescript
interface CompatibilitySectionViewModel {
  score: number                          // 0~100 정수
  chips: [ReasonChip, ReasonChip, ReasonChip]  // 순서 고정: 슬롯1, 슬롯2, 슬롯3
  interpretation: { sentence1: string; sentence2: string; sentence3: string }
  axes: [AxisComparison, AxisComparison]  // 순서 고정: 대표 유사축, 대표 보완축
  showSiJuNotice: boolean
}

interface ReasonChip {
  slot: "emotion_similarity" | "lead_complement" | "lifestyle"
  label: string       // § 3-2 매핑 문구
  colorToken: string  // 디자이너 확정 전까지 placeholder, § 5 참고
}

interface AxisComparison {
  axisKey: "express" | "emotion" | "lead" | "attach"
  relationType: "similar" | "complement"
  userValue: number       // 0~100, 마커 위치(%)에 그대로 사용
  candidateValue: number
  leftLabel: string        // 0~20 구간 태그명
  rightLabel: string       // 81~100 구간 태그명
}
```

---

## 3. 계산 함수 스펙

### 3-1. 궁합 점수

```typescript
// maju_matching_pool_spec.md § 4-2 재사용, 신규 구현 불필요
const score = Math.round(calcSajuScore(userTags, candidateTags))
const barWidthPercent = score
```

### 3-2. 이유 칩 3종

```typescript
function computeReasonChips(
  userTags: AiTags,
  candidateTags: AiTags,
  userLifestyle: LifestyleFields,
  candidateLifestyle: LifestyleFields
): [ReasonChip, ReasonChip, ReasonChip] {

  const emotionSlotScore = (
    similarityScore(userTags.express, candidateTags.express) +
    similarityScore(userTags.emotion, candidateTags.emotion)
  ) / 2

  const leadSlotScore = (
    complementScore(userTags.lead, candidateTags.lead) +
    complementScore(userTags.attach, candidateTags.attach)
  ) / 2

  const matchCount = countLifestyleMatches(userLifestyle, candidateLifestyle) // 0~5, § 3-3

  return [
    { slot: "emotion_similarity", label: mapEmotionLabel(emotionSlotScore), colorToken: "TBD" },
    { slot: "lead_complement",    label: mapLeadLabel(leadSlotScore),       colorToken: "TBD" },
    { slot: "lifestyle",          label: mapLifestyleLabel(matchCount),     colorToken: "TBD" },
  ]
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
```

### 3-3. 라이프스타일 matchCount (5개 필드)

```typescript
function countLifestyleMatches(user: LifestyleFields, candidate: LifestyleFields): number {
  let count = 0

  // 연애목적: unknown은 항상 매칭 허용 (matching_pool_spec § 2-2 규칙 재사용)
  if (datingPurposeCompatible(user.datingPurpose, candidate.datingPurpose)) count++

  // 정치성향: matching_pool_spec § 3-4 POLITICS_MATCH_MAP 양방향 재사용
  if (politicsMatched(user, candidate)) count++

  // 음주빈도: 상한선 비교이지만 이유 칩 용도이므로 단방향이 아닌 "차이 1단계 이내"로 완화 적용
  if (Math.abs(drinkingOrder[user.drinkingFrequency] - drinkingOrder[candidate.drinkingFrequency]) <= 1) count++

  // 흡연여부: 완전 일치
  if (user.smokingStatus === candidate.smokingStatus) count++

  // 종교: matching_pool_spec § 3-5 religionMatched() 그대로 재사용
  if (religionMatched(user, candidate)) count++

  return count // 0~5
}
```

> ⚠️ 음주빈도 항목은 매칭 풀의 하드 필터 로직(§ 3-3, 상한선 단방향)과 달리 이유 칩 표시용으로 "1단계 이내 차이"로 완화했다. 매칭 자체를 걸러내는 로직이 아니라 UI 문구용 근사치이므로 혼동 주의. 백엔드에서 별도 함수로 분리 구현 권장(`isLifestyleFieldSimilar`, 매칭 필터 함수와 다른 파일).

### 3-4. 대표 축 선택 및 풀이 텍스트

```typescript
function selectRepresentativeAxes(userTags: AiTags, candidateTags: AiTags) {
  const similarAxis = similarityScore(userTags.express, candidateTags.express)
    >= similarityScore(userTags.emotion, candidateTags.emotion) ? "express" : "emotion"

  const complementAxis = complementScore(userTags.lead, candidateTags.lead)
    >= complementScore(userTags.attach, candidateTags.attach) ? "lead" : "attach"

  return { similarAxis, complementAxis }
}

function buildInterpretation(
  candidateTags: AiTags,
  similarAxis: "express" | "emotion",
  complementAxis: "lead" | "attach",
  score: number
) {
  // 문장①: 상대 기질 — 상대의 similarAxis 점수를 report-prompt-spec 5단계 태그·설명 테이블에 대입
  const sentence1 = buildCandidateTraitSentence(candidateTags, similarAxis)  // § 3-5

  // 문장②: 궁합 포인트 — 2x2 카탈로그
  const sentence2 = SENTENCE2_TEMPLATE[similarAxis][complementAxis]  // § 3-5

  // 문장③: 기대 효과 — sajuScore 구간별 (50 미만 없음, §1 전제)
  const sentence3 = score >= 80 ? SENTENCE3_HIGH : SENTENCE3_MID

  return { sentence1, sentence2, sentence3 }
}
```

### 3-5. 문장①·문장②·문장③ 카탈로그 (상수 테이블)

```typescript
// 문장① — 상대 기질: 신규 카탈로그를 만들지 않고 maju_report_prompt_spec.md
// 섹션1 "태그·설명" 매핑 테이블(표현방식/감정깊이 각 5단계)을 그대로 import해서 재사용한다.
// 예: TRAIT_DESCRIPTION.express[81~100] === "감정을 즉각적으로 표현하고, 감성이 풍부한 편이에요"
function buildCandidateTraitSentence(
  candidateTags: AiTags,
  axis: "express" | "emotion"
): string {
  const tier = getTier(candidateTags[axis])          // 0~20/21~40/41~60/61~80/81~100
  const description = TRAIT_DESCRIPTION[axis][tier]  // report-prompt-spec 테이블 재사용, 중복 정의 금지
  return `${candidateNickname}은 ${description}`
}

// 문장② — 궁합 포인트: 대표 유사축 × 대표 보완축 2x2 조합
const SENTENCE2_TEMPLATE: Record<"express" | "emotion", Record<"lead" | "attach", string>> = {
  express: {
    lead:   "표현 방식이 잘 맞으면서도 관계를 이끄는 속도는 서로 보완되는 조합이에요",
    attach: "표현 방식이 잘 맞으면서도 애정 온도는 서로 보완되는 조합이에요",
  },
  emotion: {
    lead:   "감정의 결이 비슷하면서도 관계를 이끄는 속도는 서로 보완되는 조합이에요",
    attach: "감정의 결이 비슷하면서도 애정 온도는 서로 보완되는 조합이에요",
  },
}

// 문장③ — 기대 효과: sajuScore 구간별 (50 미만 없음, §1 전제)
const SENTENCE3_HIGH = "함께할수록 편안함이 커질 궁합이에요"      // score >= 80
const SENTENCE3_MID  = "신뢰가 쌓일수록 만족도가 커질 궁합이에요"   // 50 <= score < 80
```

> `TRAIT_DESCRIPTION`, `getTier`는 `maju_report_prompt_spec.md` 구현체에 이미 존재할 가능성이 높다. 새로 만들기 전에 리포트 생성 모듈에 동일 상수/함수가 있는지 먼저 확인하고, 있다면 import해서 재사용할 것(중복 유지보수 방지).

### 3-6. 축 비교 바 좌우 라벨

`maju_report_prompt_spec.md` 섹션1 태그 매핑 테이블에서 0~20 구간, 81~100 구간 태그명만 상수로 추출해 사용한다.

```typescript
const AXIS_END_LABELS: Record<keyof AiTags, { left: string; right: string }> = {
  express: { left: "내면형", right: "감성형" },
  emotion: { left: "쿨한 편", right: "매우 깊음" },
  lead:    { left: "대기형", right: "매우 주도적" },
  attach:  { left: "자유형", right: "매우 몰입" },
}
```

---

## 4. UI 컴포넌트 인터페이스 (참고용)

```typescript
interface CompatibilitySectionProps {
  data: CompatibilitySectionViewModel
}
```

- 계산은 서버(추천 API 응답 생성 시점)에서 수행하고 `CompatibilitySectionViewModel`을 그대로 내려주는 것을 권장한다. 프론트엔드에서 재계산 시 § 3의 함수를 클라이언트에도 동일하게 구현해야 하며, 두 곳에 로직이 중복되지 않도록 서버 계산을 우선한다.
- 레이아웃 순서: 궁합 점수 카드 → 풀이 말풍선 → 축 비교 바 (§ 2. 기획 문서 UI 구성 요약과 동일)
- 축 비교 바는 `axes` 배열의 순서(유사축 → 보완축)를 그대로 렌더링 순서로 사용한다.


## 6. 예외 처리

| 상황 | 처리 |
|---|---|
| `hasSiJu === false` | `showSiJuNotice = true`, 섹션 상단에 `maju_report_prompt_spec.md`의 `meta.시주미입력안내` 문구 노출 |
| 라이프스타일 필드 일부 미입력(둘 중 하나) | `countLifestyleMatches`에서 해당 항목 skip, 분모는 5 유지하지 않고 계산에서 제외(예: 4개 항목 중 매칭 수 계산) — 프론트엔드에 분모 값도 함께 전달 필요 시 `matchCount`와 `matchTotal` 페어로 API 응답 확장 검토 |
| `sajuScore < 50`인 후보가 API로 내려온 경우(§1 전제 위반) | 방어 코드로 섹션 자체를 렌더링하지 않고 로깅(백엔드 floor 미적용 상태를 조기 탐지하기 위함) |

---

## 7. 개발 착수 전 체크리스트

- [ ] `matching_pool_spec.md`에 sajuScore 50점 floor 반영 여부 확인 (§ 1)
- [ ] 디자이너로부터 칩/뱃지 실제 색상 토큰 전달받기 (§ 5)
- [ ] 서버 API 응답에 `CompatibilitySectionViewModel` 스키마 반영 (§ 2-2)
- [ ] QA: sajuScore 50~69 / 70~89 / 90~100 구간별 실제 데이터로 칩 문구·풀이 3문장·2축 표시 검증