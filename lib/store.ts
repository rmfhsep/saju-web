/**
 * 스토어(별) 구매 패키지 — 서버(가격)와 클라이언트(표시) 양쪽에서 공유하는 단일 소스.
 * app/api/stars/purchase가 이 목록으로 가격을 검증하므로, 클라이언트가 보낸 가격은 신뢰하지 않는다.
 */

export type StarPackage = { count: number; price: number }

export const STAR_PACKAGES: StarPackage[] = [
  { count: 3, price: 660 },
  { count: 10, price: 1900 },
  { count: 30, price: 4900 },
  { count: 70, price: 9900 },
  { count: 150, price: 19900 },
  { count: 300, price: 35900 },
]

export function formatWon(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`
}
