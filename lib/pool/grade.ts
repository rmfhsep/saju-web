/**
 * matching_pool_spec § 5 — 등급 분류. 주간 배치(app/api/cron/weekly-grade)가 이 파일의 순수 함수로
 * 전체 유저의 grade/gradeScore를 재계산한다. 유저에게는 비공개(§5 서두).
 */
const NEWBIE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

export type UserGrade = "gold" | "silver" | "newbie"

/** § 5-2 — 응답률(0.8) + 활동성 보조점수(0.2). activityBonus는 이미 recentActionCount/7로 정규화된 값을 받는다. */
export function computeGradeScore(responseRate: number, activityBonus: number): number {
  return responseRate * 0.8 + activityBonus * 0.2
}

export interface GradeInput {
  id: number
  createdAt: Date
  gradeScore: number
}

export interface GradeResult {
  id: number
  grade: UserGrade
  gradeScore: number
}

/**
 * § 5-1/5-2 — 가입 14일 이내는 무조건 newbie. 나머지는 gradeScore 상위 20% gold, 하위 80% silver
 * (스펙 원문의 "하위 30%"는 "추후 정의"로 남겨져 있어 일단 silver로 합친다, § 9 미확정 사항 참고).
 */
export function classifyGrades(users: GradeInput[], now: Date = new Date()): GradeResult[] {
  const newbies: GradeResult[] = []
  const rest: GradeInput[] = []

  for (const u of users) {
    if (now.getTime() - u.createdAt.getTime() <= NEWBIE_WINDOW_MS) {
      newbies.push({ id: u.id, grade: "newbie", gradeScore: u.gradeScore })
    } else {
      rest.push(u)
    }
  }

  const sorted = [...rest].sort((a, b) => b.gradeScore - a.gradeScore)
  const goldCount = Math.ceil(sorted.length * 0.2)
  const ranked = sorted.map((u, i) => ({ id: u.id, grade: (i < goldCount ? "gold" : "silver") as UserGrade, gradeScore: u.gradeScore }))

  return [...newbies, ...ranked]
}
