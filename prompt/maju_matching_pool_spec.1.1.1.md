# Matching Pool Spec

> Service: MAJU
> Version: 2.0.0
> Updated: 2026-06-25
> 연관 문서: matching_pool_policy.md (기획 정책서)

---

## 1. Overview

추천 요청 시 아래 순서로 매칭 풀을 구성하고 최종 3명을 반환한다.

```
전체 활성 유저
  → [1] Hard Filter      : 불가 대상 제거
  → [2] User Filter      : 유저 선택 조건 제거
  → [3] Soft Scoring     : 점수 산출 및 정렬
  → [4] Slot Mixing      : 등급별 슬롯 배분
  → 최종 3명 반환
```

---

## 2. Hard Filter

조건 불일치 유저를 풀에서 완전히 제거한다. 모든 조건은 AND로 적용된다.

### 2-1. 거주지

```
user.region === candidate.region
```

- `region`: 시/도 단위 문자열 (예: `"서울특별시"`, `"경기도"`)
- 풀 고갈 시 단계적 확장 → [7. 예외 처리] 참고

### 2-2. 연애목적

```typescript
type DatingPurpose = "marriage" | "dating" | "unknown"

// 제외 조건
(user.datingPurpose === "marriage" && candidate.datingPurpose === "dating") ||
(user.datingPurpose === "dating"   && candidate.datingPurpose === "marriage")

// "unknown"은 모든 값과 매칭 허용
```

### 2-3. 차단 / 신고

```
candidate.userId NOT IN user.blockedUserIds
candidate.userId NOT IN user.reportedUserIds
```

### 2-4. 이미 교류한 유저

```
candidate.userId NOT IN user.likedUserIds
candidate.userId NOT IN user.chattedUserIds
```

### 2-5. 사주 궁합 최소 기준

사주 궁합 점수가 50 미만인 유저는 풀에서 완전히 제거한다.

```typescript
calcSajuScore(user.aiTags, candidate.aiTags) >= 50
```

---

## 3. User Filter

온보딩 시 5개 항목 중 1개를 필수 선택한다. 이후 마이페이지에서 추가 선택 가능하며 최대 5개까지 복수 선택할 수 있다. 선택한 항목 전체를 하드 필터와 동일하게 AND로 적용한다. 변경 주기 제한 없음.

```typescript
type PreferenceFilter = "height" | "smoking" | "drinking" | "politics" | "religion"

// 온보딩: 1개 필수 / 마이페이지: 최대 5개까지 추가 가능
user.preferenceFilters: PreferenceFilter[]  // e.g. ["height", "smoking"]
```

### 3-1. 키 (height)

단방향 적용. 상대방의 필터 조건은 고려하지 않는다.

```typescript
candidate.height >= user.filterOption.heightMin &&
candidate.height <= user.filterOption.heightMax
```

### 3-2. 흡연여부 (smoking)

필터 선택지는 비흡연 / 흡연 2가지. 완전 일치 방식으로 적용한다. 단방향 적용.

```typescript
type SmokingFilterOption = "non_smoker" | "smoker"
type SmokingStatus = "non_smoker" | "occasional" | "daily" | "quitting"

// 비흡연 선택 시
candidate.smokingStatus === "non_smoker"

// 흡연 선택 시
candidate.smokingStatus !== "non_smoker"  // occasional | daily | quitting 모두 포함
```

### 3-3. 음주빈도 (drinking)

선택값을 상한선으로 설정하여 그 이하의 음주빈도를 가진 유저를 모두 포함한다. 단방향 적용.

```typescript
type DrinkingFrequency = "never" | "sometimes" | "monthly_3_4" | "monthly_5_plus"

// 단계 순서 정의 (낮음 → 높음)
const drinkingOrder: Record<DrinkingFrequency, number> = {
  never:          1,
  sometimes:      2,
  monthly_3_4:    3,
  monthly_5_plus: 4,
}

// 후보의 음주빈도가 선택한 상한선 이하인 경우 통과
drinkingOrder[candidate.drinkingFrequency] <= drinkingOrder[user.filterOption.drinkingFrequency]
```

### 3-4. 정치성향 (politics)

진보(progressive) ↔ 보수(conservative) 간 매칭 제외. 중도·관심없음은 모든 성향과 매칭 허용. 양방향 적용.

두 유저 모두의 매칭 허용 기준을 동시에 만족해야 매칭된다.

```typescript
type PoliticalView = "conservative" | "moderate" | "progressive" | "not_interested"

const POLITICS_MATCH_MAP: Record<PoliticalView, PoliticalView[]> = {
  conservative:    ["conservative", "moderate", "not_interested"],
  moderate:        ["conservative", "moderate", "progressive", "not_interested"],
  progressive:     ["progressive", "moderate", "not_interested"],
  not_interested:  ["conservative", "moderate", "progressive", "not_interested"],
}

function politicsMatched(user: User, candidate: User): boolean {
  const userView      = user.filterOption.politicalView ?? user.politicalView
  const candidateView = candidate.filterOption.politicalView ?? candidate.politicalView

  // 양방향: 두 유저 모두의 허용 기준을 동시에 만족해야 매칭
  return POLITICS_MATCH_MAP[userView].includes(candidate.politicalView) &&
         POLITICS_MATCH_MAP[candidateView].includes(user.politicalView)
}
```

적용 예시
- 내가 보수 + 상대가 진보: 내 기준(보수→진보 불허) + 상대 기준(진보→보수 불허) → 제외
- 내가 보수 + 상대가 중도: 내 기준(보수→중도 허용) + 상대 기준(중도→보수 허용) → 매칭
- 내가 중도 + 상대가 진보: 내 기준(중도→진보 허용) + 상대 기준(진보→중도 허용) → 매칭

### 3-5. 종교 (religion)

양방향 적용. 두 유저 중 어느 한쪽이라도 종교 필터를 선택하면 해당 조건이 양방향으로 적용된다.

```typescript
type Religion = "none" | "protestant" | "buddhist" | "catholic" | "other"

function religionMatched(user: User, candidate: User): boolean {
  const userSelected    = user.preferenceFilters.includes("religion")
  const candidateSelected = candidate.preferenceFilters.includes("religion")

  // 둘 다 필터 미선택 → 종교 무관 매칭
  if (!userSelected && !candidateSelected) return true

  // 어느 한쪽이라도 선택 → 종교 일치 여부 확인
  return user.religion === candidate.religion
}
```

### 3-6. 필터 적용 함수

```typescript
function applyUserFilters(user: User, candidate: User): boolean {
  for (const filter of user.preferenceFilters) {
    if (!isMatched(user, candidate, filter)) return false
  }
  return true
}
```

---

## 4. Soft Scoring

Hard Filter, User Filter를 통과한 유저를 대상으로 점수를 산출한다. 최종 점수는 0~100.

> 행동 신호는 초기 운영 시 데이터 부족으로 제외한다. 좋아요 데이터가 충분히 쌓인 후 도입하며, 도입 시 가중치를 재조정한다.

```
// 초기 운영
finalScore = (sajuScore     × 0.6)
           + (activityScore × 0.4)

// 행동 신호 도입 후 (추후 조정)
finalScore = (behaviorScore × 0.4)
           + (activityScore × 0.4)
           + (sajuScore     × 0.2)
```

### 4-1. 활동 최신성 (activityScore, 40%)

최근 7일 내 접속 여부 및 빈도 기반 점수.

```typescript
const daysSinceLastLogin = diffInDays(now, candidate.lastLoginAt)

if      (daysSinceLastLogin <= 1)  activityScore = 100
else if (daysSinceLastLogin <= 3)  activityScore = 80
else if (daysSinceLastLogin <= 7)  activityScore = 50
else                                activityScore = 0
```

### 4-2. 사주 궁합 (sajuScore, 60%)

`maju_report` API 응답의 `섹션1_연애기질.ai_tags` 수치를 사용한다.

```typescript
interface AiTags {
  express: number  // 0~100
  emotion: number  // 0~100
  lead:    number  // 0~100
  attach:  number  // 0~100
}

// 유사도: 수치 차이가 작을수록 높은 점수
function similarityScore(a: number, b: number): number {
  return 100 - Math.abs(a - b)
}

// 보완도: 두 수치의 합이 100에 가까울수록 높은 점수
function complementScore(a: number, b: number): number {
  return 100 - Math.abs((a + b) - 100)
}

function calcSajuScore(userTags: AiTags, candidateTags: AiTags): number {
  const expressScore = similarityScore(userTags.express, candidateTags.express)  // 유사도
  const emotionScore = similarityScore(userTags.emotion, candidateTags.emotion)  // 유사도
  const leadScore    = complementScore(userTags.lead,    candidateTags.lead)     // 보완도
  const attachScore  = complementScore(userTags.attach,  candidateTags.attach)   // 보완도

  return (expressScore + emotionScore + leadScore + attachScore) / 4
}
```

### 4-3. 비선택 필터 가산점

유저가 선택하지 않은 필터 항목은 일치 시 소폭 가산점 처리한다.

```typescript
let bonusScore = 0
const bonusPerItem = 2  // 항목당 가산점 (튜닝 가능)

const nonSelectedFilters = ALL_FILTERS.filter(f => !user.preferenceFilters.includes(f))

for (const filter of nonSelectedFilters) {
  if (isMatched(user, candidate, filter)) bonusScore += bonusPerItem
}

// finalScore에 합산 (100 초과 시 클램핑)
finalScore = Math.min(100, finalScore + bonusScore)
```

### 4-4. 자기소개 미입력 감점

자기소개를 입력하지 않은 유저는 추천 대상에서 제외하지 않되, finalScore에서 5점을 차감하여 우선순위를 낮춘다.

```typescript
const INTRO_PENALTY = 5  // 튜닝 가능

if (!candidate.hasIntroduction) {
  finalScore = Math.max(0, finalScore - INTRO_PENALTY)
}
```

자기소개 미입력 유저에게 적용되는 기능 제한은 아래와 같다.

| 기능 | 미입력 유저 |
|---|---|
| 추천 프로필 열람 | 가능 |
| 타 유저에게 추천 노출 | 가능 (감점 적용) |
| 추가 추천받기 | 가능 |
| 추천 이유 (사주 궁합 풀이) 열람 | 불가 |
| 호감 / 쪽지 표시 | 불가 |

---

## 5. 등급 분류

등급은 유저에게 비공개. 주간 단위 갱신. 전체 활성 유저 기준 전국 단위 백분위로 산출. 직전 7일 기준.

```typescript
type UserGrade = "gold" | "silver" | "newbie"
```

### 5-1. 뉴비

```
가입일로부터 14일 이내 → grade = "newbie"
14일 경과 시 gradeScore 기반으로 gold / silver 재분류
```

### 5-2. 골드 / 실버

```typescript
// 응답률 = 받은 좋아요 수 대비 응답(좋아요 반환 또는 대화 시작) 수
const responseRate = responsedCount / receivedLikeCount  // 0~1

// 활동성 보조 점수
const activityBonus = recentActionCount / 7  // 최근 7일 행동 수, 정규화

// 등급 점수
const gradeScore = (responseRate * 0.8) + (activityBonus * 0.2)

// 전체 활성 유저 기준 백분위 산출 (직전 7일, 전국 단위)
// 상위 20% → gold
// 중위 50% → silver
// 하위 30% → (silver 하단 또는 추후 정의)
```

---

## 6. Slot Mixing

Soft Scoring으로 등급별 순위를 정한 뒤 등급별 1명씩 추출하여 최종 3명을 반환한다.

### 6-0. 추천 발송 시각

하루 1회 고정 시각에 추천을 발송한다. 슬롯 믹싱을 통해 골드 1명 / 실버 1명 / 뉴비 1명으로 구성된 추천 3명을 1세트로 발송한다.

```typescript
const RECOMMENDATION_TIME = "20:00"  // KST 기준
```

| 발송 시각 | 슬롯 구성 |
|---|---|
| 20:00 | 골드 1명 / 실버 1명 / 뉴비 1명 |

```typescript
const slots: UserGrade[] = ["gold", "silver", "newbie"]

function pickCandidates(
  scoredPool: ScoredCandidate[],
  userGradeMap: Map<string, UserGrade>
): ScoredCandidate[] {
  const result: ScoredCandidate[] = []
  const remaining = [...scoredPool]

  for (const targetGrade of slots) {
    const idx = remaining.findIndex(c => userGradeMap.get(c.userId) === targetGrade)

    if (idx !== -1) {
      result.push(remaining.splice(idx, 1)[0])
    } else {
      // 해당 등급 풀 부족 시 잔여 풀에서 점수 최상위 1명으로 보완
      if (remaining.length > 0) {
        result.push(remaining.splice(0, 1)[0])
      }
    }
  }

  return result  // 최대 3명
}
```

---

## 7. 예외 처리

### 7-1. 풀 고갈 (거주지 단계적 확장)

슬롯당 후보가 3명 미만이면 거주지를 다음 단계로 확장한다. 확장 후에도 부족하면 등급 구분 없이 잔여 풀에서 점수 순으로 채운다.

```typescript
const MIN_POOL_SIZE = 3  // 슬롯당 최소 후보 수

const regionFallback = [
  (user: User) => sameRegion(user),      // 1단계: 동일 시/도
  (user: User) => adjacentRegion(user),  // 2단계: 인접 시/도
  (user: User) => allRegion(),           // 3단계: 전국
]

for (const filterFn of regionFallback) {
  const pool = buildPool(user, filterFn)
  if (pool.length >= MIN_POOL_SIZE) return pool
}
```

### 7-2. 슬롯 등급 풀 부족

해당 등급 후보가 없을 경우 잔여 풀 전체에서 점수 최상위 유저로 보완한다. → [6. Slot Mixing] 코드 참고

### 7-3. 전국 확장 후에도 풀 고갈

전국 확장 후에도 3명을 채우지 못한 경우 아래와 같이 처리한다.

```typescript
if (finalCandidates.length > 0) {
  // 채울 수 있는 인원만 반환 (1~2명)
  return finalCandidates
} else {
  // 추천 가능한 인연 없음
  return { empty: true, message: "오늘은 추천 인연이 없어요" }
}
```

### 7-4. 탈퇴 시 인연 추천

탈퇴 사유로 "마음에 드는 이성이 없어서"를 선택한 유저에게 탈퇴 완료 전 마지막으로 3명을 추천한다.

하드 필터와 유저 선택 필터를 적용하지 않고 등급 기준으로만 추출한다.

```typescript
// 슬롯 구성
const exitSlots: UserGrade[] = ["gold", "silver", "silver"]

function pickExitCandidates(
  scoredPool: ScoredCandidate[],
  userGradeMap: Map<string, UserGrade>
): ScoredCandidate[] {
  const result: ScoredCandidate[] = []
  const remaining = [...scoredPool]

  for (const targetGrade of exitSlots) {
    const idx = remaining.findIndex(c => userGradeMap.get(c.userId) === targetGrade)

    if (idx !== -1) {
      result.push(remaining.splice(idx, 1)[0])
    } else {
      // 해당 등급 풀 부족 시 잔여 풀에서 점수 최상위 1명으로 보완
      if (remaining.length > 0) {
        result.push(remaining.splice(0, 1)[0])
      }
    }
  }

  return result  // 최대 3명 (골드 1명, 실버 2명)
}
```

- 하드 필터(차단/신고/이미 교류한 유저)는 동일하게 적용한다.
- 유저 선택 필터(키, 흡연여부, 음주빈도, 정치성향, 종교)는 적용하지 않는다.
- 풀 고갈 시 [7-3] 동일하게 처리한다.

---

## 8. 데이터 스키마

```typescript
type DatingPurpose    = "marriage" | "dating" | "unknown"
type SmokingStatus    = "non_smoker" | "occasional" | "daily" | "quitting"
type DrinkingFrequency = "never" | "sometimes" | "monthly_3_4" | "monthly_5_plus"
type PoliticalView    = "conservative" | "moderate" | "progressive" | "not_interested"
type Religion         = "none" | "protestant" | "buddhist" | "catholic" | "other"
type PreferenceFilter = "height" | "smoking" | "drinking" | "politics" | "religion"
type UserGrade        = "gold" | "silver" | "newbie"

interface AiTags {
  express: number  // 0~100
  emotion: number  // 0~100
  lead:    number  // 0~100
  attach:  number  // 0~100
}

interface FilterOption {
  heightMin?:          number
  heightMax?:          number
  smokingFilter?:      SmokingFilterOption
  drinkingFrequency?:  DrinkingFrequency
  politicalView?:      PoliticalView
}

interface User {
  userId:             string
  region:             string              // 시/도
  datingPurpose:      DatingPurpose
  height:             number              // cm
  smokingStatus:      SmokingStatus
  drinkingFrequency:  DrinkingFrequency
  politicalView:      PoliticalView
  religion:           Religion
  hasIntroduction:    boolean             // 자기소개 입력 여부
  aiTags:             AiTags              // 온보딩 필수 입력
  preferenceFilters:  PreferenceFilter[]  // 온보딩 1개 필수, 마이페이지에서 최대 5개까지 추가
  filterOption:       FilterOption
  grade:              UserGrade
  lastLoginAt:        Date
  blockedUserIds:     string[]
  reportedUserIds:    string[]
  likedUserIds:       string[]
  chattedUserIds:     string[]
}
```

---

## 9. 미확정 사항

| 항목 | 내용 |
|---|---|
| 행동 신호 피처 | 초기 운영 시 0% 적용. 데이터 축적 후 ML 팀과 별도 설계 필요 |
| `bonusPerItem` | 비선택 필터 가산점 수치 튜닝 필요 |
| 연봉 재반영 | 런칭 후 6개월 시점에 매칭 만족도 데이터 기반으로 재검토 |