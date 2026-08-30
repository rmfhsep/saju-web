// 이미 생성된 더미 유저들의 name/nickname을 dummy-users-data.mjs의 최신 이름 생성 로직으로 다시 채운다
// (영단어 섞인 닉네임 대신 성+이름 형태의 자연스러운 한국 이름으로 교체).
// 실행: node scripts/rename-dummy-users.mjs
import "dotenv/config"
import pg from "pg"

const { Pool } = pg

// dummy-users-data.mjs와 동일한 이름 풀 — import는 .mjs 확장자 문제로 함수만 재사용하기 애매해서
// 이 스크립트 안에 직접 둔다(이름 생성 로직 자체는 아주 짧다).
const MALE_GIVEN = [
  "민준", "서준", "도윤", "예준", "시우", "주원", "지호", "준서", "현우", "우진", "지훈", "동현",
  "그루", "하늘", "라온", "지환", "태윤", "성민", "재우", "동욱",
]
const FEMALE_GIVEN = [
  "서연", "서윤", "지우", "하윤", "지민", "다은", "채원", "수아", "예린", "소율", "은서", "유나",
  "유미", "채영", "다솜", "새봄", "가은", "나연", "수빈", "혜진",
]
const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "송", "권", "황", "안"]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function pickFullName(gender) {
  const given = gender === "MALE" ? pick(MALE_GIVEN) : pick(FEMALE_GIVEN)
  return `${pick(SURNAMES)}${given}`
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL 환경변수가 없습니다 (.env.local 확인)")
  process.exit(1)
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 3 })
  try {
    const { rows: users } = await pool.query(
      `SELECT u.id, u.gender FROM "User" u JOIN "DummyUser" d ON d."userId" = u.id ORDER BY u.id`,
    )
    for (const u of users) {
      await pool.query(`UPDATE "User" SET name = $1, nickname = $2 WHERE id = $3`, [
        pickFullName(u.gender),
        pickFullName(u.gender),
        u.id,
      ])
    }
    console.log(`이름/닉네임 갱신 완료: ${users.length}명`)
  } finally {
    await pool.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
