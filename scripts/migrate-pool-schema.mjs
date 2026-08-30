// 매칭 풀 스펙(prompt/maju_matching_pool_spec.1.1.1.md) 구현을 위한 1회성 스키마 변경.
// prisma migrate/db push는 migration_lock.toml이 sqlite로 고정돼 있어 postgresql 데이터소스와
// 어긋나 P3019로 막혀있다 — scripts/seed-dummy-users.mjs와 동일하게 세션 모드(5432, pgbouncer
// 파라미터 제거) raw SQL로 직접 ALTER/CREATE 하고, schema.prisma는 별도로 수기 반영한다.
// 실행: node scripts/migrate-pool-schema.mjs
import "dotenv/config"
import pg from "pg"

const { Client } = pg

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL 환경변수가 없습니다 (.env.local 확인)")
  process.exit(1)
}

function sessionModeUrl(raw) {
  const url = new URL(raw)
  url.port = "5432"
  url.searchParams.delete("pgbouncer")
  return url.toString()
}

async function main() {
  const client = new Client({ connectionString: sessionModeUrl(databaseUrl) })
  await client.connect()
  try {
    await client.query(`
      ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "grade" TEXT,
        ADD COLUMN IF NOT EXISTS "gradeScore" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "preferenceFilters" TEXT
    `)
    console.log('"User" 컬럼 추가 완료 (lastLoginAt, grade, gradeScore, preferenceFilters)')

    // 기존 단일선택 필터를 새 preferenceFilters 배열로 백필 — UI는 그대로 단일선택이라
    // 항상 최대 1개짜리 배열이 되지만, 매칭 로직은 배열을 기준으로 동작하게 통일한다.
    const backfill = await client.query(`
      UPDATE "User"
      SET "preferenceFilters" = json_build_array("preferredFilterType")::text
      WHERE "preferredFilterType" IS NOT NULL AND "preferenceFilters" IS NULL
    `)
    console.log(`preferenceFilters 백필: ${backfill.rowCount}행`)

    await client.query(`
      CREATE TABLE IF NOT EXISTS "WithdrawReason" (
        "id" SERIAL PRIMARY KEY,
        "phone" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "detail" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)
    console.log('"WithdrawReason" 테이블 준비 완료')
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
