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
│   └── db.ts               # Prisma 클라이언트
└── prisma/                 # 스키마 & 마이그레이션
```

---

## 페이지 구조 원칙

- `app/` 의 `page.tsx`는 UI 로직을 직접 담습니다 (단일 파일 페이지).
- 페이지가 200줄을 넘고 재사용 가능한 컴포넌트가 보이면 `components/ui/`로 추출합니다.
- **API 호출은 반드시 클라이언트 컴포넌트에서만** 합니다 (`"use client"`).

---

## 공통 컴포넌트 사용법

모든 온보딩 페이지는 아래 패턴을 따릅니다:

```tsx
import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

export default function SomePage() {
  return (
    <Screen>
      {/* 헤더 */}
      <div className="h-[54px] flex items-center px-4">
        <BackButton onClick={onBack} />
      </div>

      {/* 스크롤 가능한 본문 — scroll-area 클래스 필수 */}
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">제목</h1>
        {/* ... */}
      </div>

      {/* 하단 버튼 */}
      <PageFooter>
        <CtaButton disabled={!valid} onClick={handleNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
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

| 용도 | 값 |
|------|-----|
| 주요 파란색 | `#1a73e8` |
| 연한 파란색 (버튼 활성) | `#b6d0ff` |
| 텍스트 기본 | `#0f0f10` / `#1f1f1f` |
| 텍스트 보조 | `#6b6b6b` / `#777` |
| 배경 회색 | `#f4f4f5` / `#f5f5f7` |
| 오류 | `#ff3b30` |
| 버튼 높이 | `h-[48px]` |
| 버튼 radius | `rounded-[4px]` |
| 페이지 좌우 패딩 | `px-5` (20px) |

---

## Import 순서

```tsx
// 1. 외부 라이브러리
import { useState } from "react"
import { useRouter } from "next/navigation"

// 2. 내부 유틸 / 브릿지
import { bridgeNavigate } from "@/lib/bridge"

// 3. 공통 UI 컴포넌트
import Screen from "@/components/ui/screen"
import CtaButton from "@/components/ui/cta-button"
```

---

## 커밋 컨벤션

```
타입: 내용
```

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `hotfix` | 긴급 수정 |
| `style` | CSS/스타일 수정 |
| `refactor` | 리팩토링 |
| `chore` | 빌드, 설정, 기타 |

예시: `fix: 키보드 올라올 때 버튼 겹침 문제 수정`

---

## 주의사항

- **`keyboard-safe-bottom` 클래스는 삭제됨** — `PageFooter` + `keyboard-footer` 사용
- `min-h-screen`이 아닌 `h-screen`을 쓰세요 — 키보드 높이 계산이 정확히 동작합니다
- 스크롤 컨테이너에 `scroll-area overflow-y-auto` 조합을 항상 씁니다
- API Route는 서버 컴포넌트에서 직접 호출하지 않고 `fetch()`로 클라이언트에서 호출합니다
