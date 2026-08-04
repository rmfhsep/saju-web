/** "YYYYMMDD" 또는 "YYYY-MM-DD" 형태의 birthDate로부터 한국식 나이를 계산한다. */
export function calcAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null
  const y = parseInt(birthDate.slice(0, 4), 10)
  if (!y) return null
  return new Date().getFullYear() - y + 1
}

/** "YYYYMMDD" birthDate로부터 "96년생" 같은 출생년도 라벨을 만든다. */
export function birthYearLabel(birthDate: string | null | undefined): string | null {
  if (!birthDate) return null
  const y = birthDate.slice(0, 4)
  if (!/^\d{4}$/.test(y)) return null
  return `${y.slice(2)}년생`
}
