import { NextResponse } from "next/server"

// VWorld(국토교통부) 시군구 경계 데이터 — 전국 시군구 전체 명칭을 한 번에 받아온다.
// 행정구역은 사실상 안 바뀌므로 오래 캐싱한다(30일).
const VWORLD_URL = "https://api.vworld.kr/req/data"
// 대한민국 전역을 덮는 바운딩 박스 — geomFilter 없이는 VWorld가 조회를 거부한다.
const KOREA_BBOX = "BOX(124.5,33,132,43)"

interface VWorldFeature {
  properties: { full_nm: string }
}

export async function GET() {
  const key = process.env.VWORLD_API_KEY
  if (!key) return NextResponse.json({ results: [] }, { status: 500 })

  try {
    const url = `${VWORLD_URL}?service=data&request=GetFeature&data=LT_C_ADSIGG_INFO&key=${key}&format=json&size=300&page=1&geomFilter=${encodeURIComponent(KOREA_BBOX)}&crs=EPSG:4326&geometry=false`
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } })
    if (!res.ok) return NextResponse.json({ results: [] }, { status: 502 })

    const data = await res.json()
    const features: VWorldFeature[] = data?.response?.result?.featureCollection?.features ?? []
    const results = Array.from(new Set(features.map(f => f.properties.full_nm))).sort((a, b) =>
      a.localeCompare(b, "ko"),
    )

    return NextResponse.json({ results })
  } catch (err) {
    console.error("[api/locations] failed:", err)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
