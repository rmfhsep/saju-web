// DummyUser 테이블에 있는 더미 유저들에게 AI로 생성한 "한남동/성수동 감성" 프로필 사진을 2장씩 만들어 붙인다.
// 실제 업로드 플로우(app/api/upload/route.ts)와 동일한 Supabase Storage 버킷(profile-photos)에 올린다.
// 실행: node scripts/generate-dummy-photos.mjs [동시 처리 인원수=4]
import "dotenv/config"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import pg from "pg"

const { Pool } = pg

// lib/supabase.ts와 동일한 값 (해당 파일도 이 값을 하드코딩해서 씀)
const SUPABASE_URL = "https://rfcprmyclrlgnmonjmxd.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3BybXljbHJsZ25tb25qbXhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQzMTIxOSwiZXhwIjoyMDk3MDA3MjE5fQ.aHG5iUGUBOb3I_7-2NSvJFnN-MoupcDaDUCU8rYAF34"
const BUCKET = "profile-photos"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL 환경변수가 없습니다 (.env.local 확인)")
  process.exit(1)
}
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY 환경변수가 없습니다 (.env.local 확인)")
  process.exit(1)
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const concurrency = Number(process.argv[2] ?? 4)
// 두 번째 인자로 "135,136,137"처럼 id를 콤마로 넘기면 해당 더미 유저만 재생성한다(실패분 재시도용).
const onlyIds = process.argv[3] ? process.argv[3].split(",").map(s => Number(s.trim())) : null

// "한국 인플루언서 인스타 감성" 스타일 — 사용자가 확정한 레퍼런스 프롬프트를 기준으로 삼는다.
// 매 유저마다 배경/의상/헤어/표정을 랜덤 조합해서 얼굴이 다 비슷비슷해 보이지 않게 한다.
const SETTINGS = [
  "a large Christmas-decorated cafe interior with string lights and a Christmas tree",
  "a trendy minimalist cafe with warm wooden tones and soft afternoon light",
  "an aesthetic brunch restaurant with plants and neutral interior tones",
  "a modern flower-shop cafe with soft natural light",
  "a cozy dessert cafe with warm pendant lighting",
  "a bright bakery cafe with large windows and soft daylight",
]
const FEMALE_OUTFITS = [
  "an off-shoulder white knit dress", "a cream oversized knit sweater",
  "a brown ribbed knit top", "a soft beige turtleneck sweater",
  "an elegant camel-colored coat over a knit top",
]
const FEMALE_HAIR = [
  "long loose wavy perm, ash brown hair color", "long straight black hair with soft face-framing layers",
  "long wavy hair, warm brown color",
]
const MALE_OUTFITS = [
  "a simple black crewneck sweater", "a smart-casual beige overshirt",
  "a denim jacket over a white tee", "a minimalist knit sweater",
  "a light gray button-up shirt",
]
const MALE_HAIR = [
  "neat short black hair", "textured medium-length hair with a soft fringe", "clean side-parted hair",
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildPrompt(gender) {
  const setting = pick(SETTINGS)
  const base =
    `Natural Instagram-style photo of a Korean ${gender === "FEMALE" ? "female" : "male"} influencer, ` +
    `shot like an iPhone 17 Pro — warm natural color grading, high-resolution fine detail, natural light, ` +
    `subtle soft film grain texture, warm white balance. Composition: Instagram 4:5 portrait crop, ` +
    `upper-body medium close-up shot. Expression: natural soft smile, gazing gently down and to the side. `

  if (gender === "FEMALE") {
    return (
      base +
      `Facial features: double eyelids, big bright eyes, clear fair skin. Makeup: dewy glowing base, ` +
      `soft coral-toned light makeup. Hairstyle: ${pick(FEMALE_HAIR)}. Outfit: ${pick(FEMALE_OUTFITS)}, elegant and tasteful. ` +
      `Background: ${setting}, softly blurred. Style: soft tone, clean minimal-edit look, Seoul influencer aesthetic, fully clothed.`
    )
  }
  return (
    base +
    `Facial features: sharp clean jawline, warm friendly eyes, clear healthy skin. Well-groomed natural look. ` +
    `Hairstyle: ${pick(MALE_HAIR)}. Outfit: ${pick(MALE_OUTFITS)}, smart-casual and stylish. ` +
    `Background: ${setting}, softly blurred. Style: soft tone, clean minimal-edit look, Seoul influencer aesthetic, fully clothed.`
  )
}

async function generateOneImage(gender) {
  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt: buildPrompt(gender),
    size: "1024x1536",
    quality: "high",
  })
  const b64 = result.data[0].b64_json
  return Buffer.from(b64, "base64")
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some(b => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }
}

async function uploadImage(buffer, userId, idx) {
  const path = `dummy/${userId}/${Date.now()}-${idx}.png`
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: false,
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function processUser(pool, user) {
  const urls = []
  for (let i = 0; i < 2; i++) {
    const buffer = await generateOneImage(user.gender)
    const url = await uploadImage(buffer, user.id, i)
    urls.push(url)
  }
  await pool.query(`UPDATE "User" SET photos = $1 WHERE id = $2`, [JSON.stringify(urls), user.id])
  return urls
}

async function runWithConcurrency(items, limit, worker) {
  let idx = 0
  let done = 0
  const errors = []
  async function next() {
    while (idx < items.length) {
      const i = idx++
      const item = items[i]
      try {
        await worker(item)
        done++
        console.log(`[${done}/${items.length}] user ${item.id} (${item.gender}) 사진 생성 완료`)
      } catch (err) {
        errors.push({ item, err })
        console.error(`user ${item.id} 실패:`, err.message)
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, next))
  return errors
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: concurrency + 1 })
  try {
    await ensureBucket()

    const { rows: users } = onlyIds
      ? await pool.query(
          `SELECT u.id, u.gender FROM "User" u JOIN "DummyUser" d ON d."userId" = u.id WHERE u.id = ANY($1) ORDER BY u.id`,
          [onlyIds],
        )
      : await pool.query(
          `SELECT u.id, u.gender FROM "User" u JOIN "DummyUser" d ON d."userId" = u.id ORDER BY u.id`,
        )
    if (users.length === 0) {
      console.log("더미 유저가 없습니다. 먼저 npm run seed:dummy를 실행하세요.")
      return
    }

    console.log(`더미 유저 ${users.length}명 x 2장 = 총 ${users.length * 2}장 생성 시작 (동시 ${concurrency}명씩)`)
    const errors = await runWithConcurrency(users, concurrency, u => processUser(pool, u))

    console.log(`완료: 성공 ${users.length - errors.length}명 / 실패 ${errors.length}명`)
    if (errors.length > 0) {
      console.log("실패한 유저 id:", errors.map(e => e.item.id).join(", "))
    }
  } finally {
    await pool.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
