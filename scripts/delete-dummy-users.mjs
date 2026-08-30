// scripts/seed-dummy-users.mjs로 만든 더미 유저를 전부 삭제한다.
// "DummyUser" 테이블에 기록된 id만 정확히 지우므로, 그 사이 실제 유저를 잘못 지울 위험이 없다.
// 실행: node scripts/delete-dummy-users.mjs
import "dotenv/config"
import pg from "pg"

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL 환경변수가 없습니다 (.env.local 확인)")
  process.exit(1)
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 3 })
  const client = await pool.connect()
  try {
    const { rows: check } = await client.query(
      `SELECT to_regclass('"DummyUser"') IS NOT NULL AS exists`,
    )
    if (!check[0].exists) {
      console.log(`"DummyUser" 테이블이 없습니다 — 삭제할 더미 유저가 없습니다.`)
      return
    }

    await client.query("BEGIN")

    const { rows: ids } = await client.query(`SELECT "userId" FROM "DummyUser"`)
    const dummyIds = ids.map(r => r.userId)

    if (dummyIds.length === 0) {
      console.log("삭제할 더미 유저가 없습니다.")
      await client.query("ROLLBACK")
      return
    }

    // 더미 유저를 대상/발신으로 참조하는 부수 테이블 정리 (User와 FK 관계는 없어 자동으론 안 지워짐)
    await client.query(`DELETE FROM "Recommendation" WHERE "userId" = ANY($1) OR "recommendedId" = ANY($1)`, [dummyIds])
    await client.query(`DELETE FROM "Like" WHERE "fromUserId" = ANY($1) OR "toUserId" = ANY($1)`, [dummyIds])
    await client.query(`DELETE FROM "Message" WHERE "fromUserId" = ANY($1) OR "toUserId" = ANY($1)`, [dummyIds])
    await client.query(`DELETE FROM "UserBlock" WHERE "blockerId" = ANY($1) OR "blockedId" = ANY($1)`, [dummyIds])
    await client.query(`DELETE FROM "Report" WHERE "reporterId" = ANY($1) OR "reportedId" = ANY($1)`, [dummyIds])

    // "DummyUser"는 "User" 삭제 시 ON DELETE CASCADE로 함께 지워진다.
    const { rowCount } = await client.query(`DELETE FROM "User" WHERE id = ANY($1)`, [dummyIds])

    await client.query("COMMIT")
    console.log(`더미 유저 ${rowCount}명 삭제 완료`)
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
