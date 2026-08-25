# saju-agent 개발 컨벤션

Next.js 15 + Tailwind v4 + Prisma 기반의 모바일 WebView 앱입니다.

---

## 프로젝트 구조

```
saju-agent/
├── app/                    # Next.js App Router
│   ├── api/                # API Route Handlers (서버 전용)
│   ├── onboarding/         # 온보딩 플로우 페이지
│   └── layout.tsx          # 루트 레이아웃
├── components/
│   └── ui/                 # 공통 UI 컴포넌트
│       ├── screen.tsx          # 페이지 컨테이너 (h-screen flex-col)
│       ├── page-footer.tsx     # 키보드 대응 하단 푸터
│       ├── cta-button.tsx      # 주요 액션 버튼 (파란색/회색)
│       ├── back-button.tsx     # 뒤로가기 chevron 버튼
│       └── radio-option.tsx    # 라디오 선택 행
├── lib/                    # 서버/클라이언트 유틸
│   ├── bridge.ts           # React Native WebView 브릿지
│   ├── auth.ts             # JWT 인증
│   ├── db.ts               # Prisma 클라이언트
│   └── queries/            # TanStack Query 훅 (쿼리 키, useMe 등 — 아래 "데이터 페칭" 참고)
└── prisma/                 # 스키마 & 마이그레이션
```

---

## 페이지 구조 원칙

- `app/` 의 `page.tsx`는 UI 로직을 직접 담습니다 (단일 파일 페이지).
- 페이지가 200줄을 넘고 재사용 가능한 컴포넌트가 보이면 `components/ui/`로 추출합니다.
- **API 호출은 반드시 클라이언트 컴포넌트에서만** 합니다 (`"use client"`).
- **데이터 페칭 중에는 항상 스켈레톤을 보여줍니다** — "없음/빈 상태" UI와 로딩 상태를 같은 조건(`null`/`[]` 등)으로 뭉뚱그리지 마세요. 로딩 여부를 별도 state(예: `xxxLoading`)로 관리해 로딩 중엔 스켈레톤(`animate-pulse`), 완료 후 데이터가 없을 때만 빈 상태 문구를 보여줍니다.

---

## 데이터 페칭 — TanStack Query

여러 화면이 같은 서버 데이터(특히 보유 별 `stars`)를 보여준다면 **반드시 TanStack Query로 캐시를 공유**합니다.
페이지마다 `useState` + `useEffect(fetch)`로 따로 들고 있으면, 한 화면에서 별을 쓰거나 충전해도 다른 화면(홈 헤더, 마이페이지, 스토어)은 갱신되지 않는 버그가 생깁니다 — 실제로 겪었던 문제입니다.

`app/layout.tsx`에 `QueryProvider`(`app/query-provider.tsx`)가 최상위에 이미 물려 있으므로, 아무 클라이언트 컴포넌트에서나 바로 훅을 가져다 쓰면 됩니다.

### 훅 위치와 이름

- 리소스별 쿼리/뮤테이션 훅은 `lib/queries/use{Resource}.ts`에 모읍니다 (예: `useMe.ts`, `useDiscover.ts`, `useUserDetail.ts`).
- 쿼리 키는 절대 문자열을 직접 쓰지 말고 `lib/queries/keys.ts`의 `queryKeys`에 추가해서 가져다 씁니다. 여러 파일에서 같은 키를 정확히 참조해야 `invalidateQueries`가 제대로 동작하는데, 문자열을 직접 쓰면 오타로 캐시가 갈라집니다.
- 조회는 `useQuery`, 서버 상태를 바꾸는 요청은 `use{Action}Mutation`으로 분리합니다 (`useLikeMutation`, `useMoreIntroMutation`처럼).

```ts
// lib/queries/useMe.ts
export function useMe(options?: { enabled?: boolean }) {
  return useQuery({ queryKey: queryKeys.me, queryFn: fetchMe, enabled: options?.enabled ?? true })
}
```

### 뮤테이션 성공 시 관련 쿼리 무효화/갱신

별을 쓰거나 적립하는 모든 뮤테이션은 `onSuccess`에서 `queryKeys.me`를 갱신합니다. 응답에 최신 값이 바로 들어있으면 `setQueryData`로 즉시 반영하고, 그렇지 않으면 `invalidateQueries`로 리페치를 트리거합니다.

```ts
export function useLikeMutation(targetId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => { /* POST /api/likes, 응답에 최신 stars 포함 */ },
    onSuccess: result => {
      queryClient.setQueryData(queryKeys.me, prev => prev ? { ...prev, stars: result.stars } : prev)
    },
  })
}
```

외부 리다이렉트(결제 등)처럼 응답으로 직접 값을 받을 수 없는 흐름은, 성공을 확인하는 시점(예: 결제 콜백 폴링 완료)에 `useQueryClient()`로 직접 `invalidateQueries({ queryKey: queryKeys.me })`를 호출합니다.

### "실패"가 별 부족처럼 정상적인 분기라면 throw하지 않기

별 부족처럼 사용자가 마주칠 수 있는 정상적인 실패는 `mutationFn`에서 던지지 말고 `{ ok: boolean, ... }` 형태로 반환합니다. 서버가 실패 응답에도 현재 별 잔액을 함께 내려주는 경우가 많은데, throw해버리면 `onSuccess`가 아예 안 불려서 그 값을 캐시에 반영할 기회를 놓칩니다. 페이지에서는 `result.ok`로 토스트 문구만 분기합니다. 반면 네트워크 에러나 "후보 없음"처럼 사용자가 재시도할 만한 예외적 실패는 그대로 throw하고 `onError`에서 처리합니다(`useMoreIntroMutation` 참고).

### 로딩/빈 상태 판단

`isLoading`(= `isPending && isFetching`)보다 **`!query.data`를 로딩 조건으로 쓰는 편이 더 명확**합니다 — 위 "데이터 페칭 중에는 항상 스켈레톤" 원칙과 그대로 이어집니다. `enabled` 옵션으로 쿼리를 끈 상태에서는 `isLoading`이 `false`로 나와 스켈레톤이 잠깐 안 보이는 함정이 있기 때문입니다.

```tsx
const discoverQuery = useDiscover({ enabled: !!user?.profileComplete })
const recosLoading = !discoverQuery.data // ✅
// const recosLoading = discoverQuery.isLoading // ❌ enabled:false일 때 오판 가능
```

### 마이페이지 수정 폼의 "1회 시드" 패턴

`app/my/edit/*` 같은 수정 폼은 `/api/profile/update`로 저장하는 로컬 편집 state가 필요해서, 서버 값을 그대로 `useQuery`로 렌더링할 수 없습니다. 대신 `useMe()`가 데이터를 받아온 시점에 로컬 state를 **한 번만** 채웁니다 — 매 렌더마다 덮어쓰면 사용자가 입력 중인 값이 백그라운드 리페치로 지워집니다. 필드가 하나면 그 필드의 falsy 체크로 충분하고, 여러 필드를 한 번에 채워야 하면 별도 `seeded` 플래그를 씁니다.

```tsx
const meQuery = useMe()
const [nickname, setNickname] = useState("")

useEffect(() => {
  if (meQuery.data?.nickname && !nickname) setNickname(meQuery.data.nickname)
}, [meQuery.data, nickname])
```

저장(`/api/profile/update` 등) 성공 시에는 `queryClient.invalidateQueries({ queryKey: queryKeys.me })`를 호출해, 마이페이지·수정 목록 등 다른 화면에 바로 반영되게 합니다.

---

## 공통 컴포넌트 사용법

모든 온보딩 페이지는 아래 패턴을 따릅니다:

```tsx
import Screen from "@/components/ui/screen";
import BackButton from "@/components/ui/back-button";
import PageFooter from "@/components/ui/page-footer";
import CtaButton from "@/components/ui/cta-button";

export default function SomePage() {
  return (
    <Screen>
      {/* 헤더 */}
      <div className="h-[54px] flex items-center px-4">
        <BackButton onClick={onBack} />
      </div>

      {/* 스크롤 가능한 본문 — scroll-area 클래스 필수 */}
      <div className="flex-1 px-5 pt-5 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
          제목
        </h1>
        {/* ... */}
      </div>

      {/* 하단 버튼 */}
      <PageFooter>
        <CtaButton disabled={!valid} onClick={handleNext}>
          다음
        </CtaButton>
      </PageFooter>
    </Screen>
  );
}
```

### Screen

- `h-screen flex flex-col overflow-hidden bg-white` 래퍼
- iOS에서 전체 화면을 채우고 스크롤이 내부에서만 일어나도록 합니다

### scroll-area

- 스크롤 가능한 `div`에 반드시 `scroll-area` CSS 클래스를 붙입니다
- `overscroll-behavior-y: none` + `-webkit-overflow-scrolling: touch` 적용
- iOS 고무줄 스크롤(통통튀는 효과)을 방지합니다

### PageFooter + keyboard-footer

- `keyboard-footer` CSS 클래스를 통해 키보드 높이만큼 `padding-bottom`이 자동으로 늘어납니다
- **transform 방식을 쓰지 마세요** — 레이아웃 흐름을 벗어나 버튼이 콘텐츠 위에 떠버립니다
- `Screen`이 `h-screen`이고 본문이 `flex-1 overflow-y-auto`이므로, 푸터가 두꺼워지면 본문이 자연스럽게 줄어듭니다

### CtaButton

- `disabled` prop으로 활성/비활성 상태를 제어합니다
- 활성: `bg-[#b6d0ff] text-[#1f1f1f]` / 비활성: `bg-[#f4f4f5] text-[#a0a0a0]`

---

## 키보드 높이 감지 (layout.tsx)

`--keyboard-height` CSS 변수를 `visualViewport` API로 계산합니다.
직접 수정하지 마세요 — `keyboard-footer` 클래스가 이 변수를 사용합니다.

---

## 디자인 토큰 (자주 쓰는 값)

| 용도                    | 값                    |
| ----------------------- | --------------------- |
| 주요 파란색             | `#1a73e8`             |
| 연한 파란색 (버튼 활성) | `#b6d0ff`             |
| 텍스트 기본             | `#0f0f10` / `#1f1f1f` |
| 텍스트 보조             | `#6b6b6b` / `#777`    |
| 배경 회색               | `#f4f4f5` / `#f5f5f7` |
| 오류                    | `#ff3b30`             |
| 버튼 높이               | `h-[48px]`            |
| 버튼 radius             | `rounded-[4px]`       |
| 페이지 좌우 패딩        | `px-5` (20px)         |

---

## Import 순서

```tsx
// 1. 외부 라이브러리
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. 내부 유틸 / 브릿지
import { bridgeNavigate } from "@/lib/bridge";

// 3. 공통 UI 컴포넌트
import Screen from "@/components/ui/screen";
import CtaButton from "@/components/ui/cta-button";
```

---

## 재사용 가능한 훅 & 유틸 함수

- 화면 전용 로직(그 페이지에서만 쓰는 상태·핸들러)은 `page.tsx` 안에 그대로 둡니다 — 위 "페이지 구조 원칙"대로 단일 파일을 기본으로 합니다.
- 두 곳 이상에서 같은 로직이 필요해지면 그때 `lib/`로 추출합니다(조기 추출 금지). 데이터 페칭/뮤테이션은 `lib/queries/`, 그 외 훅(`useBioIncomplete`, `useAppRouter`처럼)과 순수 유틸(`lib/age.ts`, `lib/store.ts`처럼)은 `lib/` 바로 아래에 둡니다.
- **새 유틸/포맷 함수를 만들기 전에 `lib/`에 이미 있는지 먼저 찾습니다.** 예: 나이 계산은 `lib/age.ts`의 `calcAge`, 별 패키지 표시는 `lib/store.ts`의 `formatWon` — 페이지 파일 안에 같은 로직을 다시 구현하지 않습니다.
- `lib/`의 재사용 훅·유틸에는 JSDoc으로 용도를 한 줄 남깁니다(파라미터가 타입만으로 알 수 없는 조건·기본값을 가질 때는 `@param`도). 화면 전용 로컬 함수에는 굳이 달지 않습니다.

```ts
/** 자기소개(bioTags 전부)를 다 작성했는지 여부 — 홈/마이페이지의 작성 유도 배너 노출 판단에 쓴다. */
export function useBioIncomplete(user: BioUser): boolean { ... }
```

---

## 타입 정의

- 서버 API 응답 타입은 그 데이터를 가져오는 훅/route 파일 하나에서만 정의하고(예: `MeUser`는 `lib/queries/useMe.ts`), 다른 파일은 거기서 import해서 씁니다. 같은 이름의 타입을 페이지마다 복붙해서 중복 정의하지 않습니다.
- 한 파일에서만 쓰는 UI 전용 타입(로컬 state 모양 등)은 그 파일 안에 그대로 둬도 됩니다.

---

## Props 정의

```tsx
// 1~2개: 인라인
function Avatar({ src, size }: { src: string | null; size: number }) {}

// 3개 이상: named 인터페이스/타입
type AxisBarProps = {
  axis: AxisComparison
  myPhoto: string | null
  candidatePhoto: string | null
}
function AxisBar({ axis, myPhoto, candidatePhoto }: AxisBarProps) {}
```

---

## 커밋 컨벤션

```
타입: 내용
```

| 타입       | 설명             |
| ---------- | ---------------- |
| `feat`     | 새로운 기능      |
| `fix`      | 버그 수정        |
| `hotfix`   | 긴급 수정        |
| `style`    | CSS/스타일 수정  |
| `refactor` | 리팩토링         |
| `chore`    | 빌드, 설정, 기타 |

예시: `fix: 키보드 올라올 때 버튼 겹침 문제 수정`

---

## 주의사항

- **`keyboard-safe-bottom` 클래스는 삭제됨** — `PageFooter` + `keyboard-footer` 사용
- `min-h-screen`이 아닌 `h-screen`을 쓰세요 — 키보드 높이 계산이 정확히 동작합니다
- 스크롤 컨테이너에 `scroll-area overflow-y-auto` 조합을 항상 씁니다
- API Route는 서버 컴포넌트에서 직접 호출하지 않고 `fetch()`로 클라이언트에서 호출합니다
