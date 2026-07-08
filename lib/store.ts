/**
 * 스토어(별) 관련 하드코딩 데이터.
 * 아직 백엔드에 별/포인트 스키마가 없어 UI 구현용 mock 으로 사용한다.
 * 실제 결제/잔액 연동 시 이 파일을 API 호출로 대체하면 된다.
 */

export const STAR_BALANCE = 50

export type StarPackage = { count: number; price: number }

export const STAR_PACKAGES: StarPackage[] = [
  { count: 10, price: 1900 },
  { count: 30, price: 4900 },
  { count: 50, price: 7900 },
  { count: 70, price: 9900 },
  { count: 150, price: 19900 },
]

export type StarHistoryItem = {
  type: "charge" | "use"
  date: string // YYYY.MM.DD
  amount: number // 충전 +, 사용 -
  balance: number // 처리 후 남은 별 수
}

export const STAR_HISTORY: StarHistoryItem[] = [
  { type: "charge", date: "2026.07.01", amount: 150, balance: 200 },
  { type: "charge", date: "2026.06.20", amount: 10, balance: 50 },
  { type: "use", date: "2026.06.15", amount: -5, balance: 40 },
  { type: "use", date: "2026.06.10", amount: -5, balance: 45 },
]

export function formatWon(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`
}
