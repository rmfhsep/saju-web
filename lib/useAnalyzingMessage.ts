import { useEffect, useState } from "react"

const ANALYZING_MESSAGES = [
  "사주 데이터를 계산하고 있어요...",
  "연애 기질을 분석하고 있어요...",
  "어울리는 유형을 찾고 있어요...",
  "올해 연애운을 살펴보고 있어요...",
  "결과를 정리하고 있어요...",
]

/** 실제 생성 단계를 추적하진 않고, active인 동안 몇 초마다 문구를 순환시키는 가짜 진행 표시. */
export function useAnalyzingMessage(active: boolean, intervalMs = 2500): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) {
      setIndex(0)
      return
    }
    const timer = setInterval(() => {
      setIndex(i => Math.min(i + 1, ANALYZING_MESSAGES.length - 1))
    }, intervalMs)
    return () => clearInterval(timer)
  }, [active, intervalMs])

  return ANALYZING_MESSAGES[index]
}
