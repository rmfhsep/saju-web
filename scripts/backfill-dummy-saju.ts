// 더미 유저(scripts/seed-dummy-users.mjs)는 sajuResult가 비어있어 매칭 풀의 사주 궁합
// 하드필터(§2-5, 50점 미만 제외)에서 전부 걸러진다 — 실제 유저처럼 유효한 사주 리포트를 채워준다.
// lib/sajuReport.ts의 buildSajuReport는 실제 운영 경로(app/api/saju/generate)가 아직 안 쓰는
// 결정론 재구현체지만, "명세와 100% 동일한 결과"를 내는 순수 함수라 LLM 호출/비용 없이 쓰기 적합하다.
// 실행: node scripts/backfill-dummy-saju.ts
import "dotenv/config"
import pg from "pg"
import { computeSaju } from "../lib/saju.ts"
import { buildSajuReport } from "../lib/sajuReport.ts"

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL 환경변수가 없습니다 (.env.local 확인)")
  process.exit(1)
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 3 })
  try {
    const { rows: users } = await pool.query(
      `SELECT u.id, u.gender, u."calendarType", u."birthDate"
       FROM "User" u JOIN "DummyUser" d ON d."userId" = u.id
       WHERE u."sajuResult" IS NULL`,
    )
    if (users.length === 0) {
      console.log("sajuResult가 비어있는 더미 유저가 없습니다.")
      return
    }

    let ok = 0
    for (const u of users) {
      try {
        const saju = computeSaju(
          { birthDate: u.birthDate, birthTime: null, birthTimeUnknown: true, calendarType: u.calendarType },
          u.gender,
        )
        const report = buildSajuReport(saju)
        await pool.query(`UPDATE "User" SET "sajuResult" = $1 WHERE id = $2`, [JSON.stringify(report), u.id])
        ok++
      } catch (err) {
        console.error(`user ${u.id} 실패:`, err instanceof Error ? err.message : err)
      }
    }
    console.log(`sajuResult 백필 완료: ${ok}/${users.length}`)
  } finally {
    await pool.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
