// 추천 로직 테스트용 더미 유저를 DB에 생성한다.
// 실행: node scripts/seed-dummy-users.mjs [성별당 인원수=20]
//
// 생성된 유저의 id는 전부 "DummyUser" 테이블(이 스크립트가 없으면 자동 생성)에도
// 기록해두고, 나중에 scripts/delete-dummy-users.mjs로 그 id들만 정확히 지운다.
import "dotenv/config"
import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import pg from "pg"
import { buildDummyUser } from "./dummy-users-data.mjs"

const { Pool, Client } = pg

const countPerGender = Number(process.argv[2] ?? 20)
if (!Number.isInteger(countPerGender) || countPerGender <= 0) {
  console.error("사용법: node scripts/seed-dummy-users.mjs [성별당 인원수]")
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL 환경변수가 없습니다 (.env.local 확인)")
  process.exit(1)
}

// pgbouncer 트랜잭션 모드 풀러(6543)는 DDL에 취약해서, prisma.config.ts와 동일하게
// CREATE TABLE 한 번은 세션 모드(5432)로 별도 접속해서 실행한다.
function sessionModeUrl(raw) {
  const url = new URL(raw)
  url.port = "5432"
  url.searchParams.delete("pgbouncer")
  return url.toString()
}

async function ensureDummyUserTable() {
  const client = new Client({ connectionString: sessionModeUrl(databaseUrl) })
  await client.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "DummyUser" (
        "userId" INTEGER PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)
  } finally {
    await client.end()
  }
}

async function insertOneDummyUser(pool, gender) {
  const passwordHash = await bcrypt.hash(randomUUID(), 10)

  // 전화번호 unique 제약 충돌 시 다른 임의번호로 재시도한다.
  for (let attempt = 0; attempt < 5; attempt++) {
    const data = buildDummyUser(gender)
    const phone = `999${String(randInt11())}`

    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      const result = await client.query(
        `INSERT INTO "User" (
          phone, "passwordHash", name, gender, "calendarType", "birthDate", "birthTimeUnknown",
          location, job, "jobDetail", height, smoking, drinking, "datingPurpose", politics, religion, income,
          photos, "bioTags", bio, nickname, "termsAgreed", "marketingAgreed", "signupComplete", "profileComplete",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25,
          now()
        ) RETURNING id`,
        [
          phone, passwordHash, data.name, data.gender, data.calendarType, data.birthDate, data.birthTimeUnknown,
          data.location, data.job, data.jobDetail, data.height, data.smoking, data.drinking, data.datingPurpose, data.politics, data.religion, data.income,
          data.photos, data.bioTags, data.bio, data.nickname, data.termsAgreed, data.marketingAgreed, data.signupComplete, data.profileComplete,
        ],
      )
      const userId = result.rows[0].id
      await client.query(`INSERT INTO "DummyUser" ("userId") VALUES ($1)`, [userId])
      await client.query("COMMIT")
      return userId
    } catch (err) {
      await client.query("ROLLBACK")
      if (err.code === "23505") continue // phone 유니크 충돌 -> 재시도
      throw err
    } finally {
      client.release()
    }
  }
  throw new Error("phone 유니크 충돌이 반복돼 더미 유저 생성에 실패했습니다")
}

function randInt11() {
  return Math.floor(10000000 + Math.random() * 89999999)
}

async function main() {
  console.log(`더미 유저 테이블 준비 중...`)
  await ensureDummyUserTable()

  const pool = new Pool({ connectionString: databaseUrl, max: 3 })
  try {
    let created = 0
    for (const gender of ["MALE", "FEMALE"]) {
      for (let i = 0; i < countPerGender; i++) {
        await insertOneDummyUser(pool, gender)
        created++
      }
    }
    console.log(`더미 유저 ${created}명 생성 완료 (남 ${countPerGender} / 여 ${countPerGender})`)
    console.log(`삭제하려면: node scripts/delete-dummy-users.mjs`)
  } finally {
    await pool.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
