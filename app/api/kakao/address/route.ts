import { NextRequest, NextResponse } from "next/server"

const KAKAO_ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json"
const KAKAO_REST_API_KEY = "d14e4292ae17a231c02b23454d8043d9"

// 카카오 주소 검색 API는 시도명을 축약형("서울", "경기")으로 반환하므로 정식명칭으로 변환
const SIDO_FULL_NAME: Record<string, string> = {
  "서울": "서울특별시",
  "부산": "부산광역시",
  "대구": "대구광역시",
  "인천": "인천광역시",
  "광주": "광주광역시",
  "대전": "대전광역시",
  "울산": "울산광역시",
  "세종": "세종특별자치시",
  "경기": "경기도",
  "강원": "강원특별자치도",
  "충북": "충청북도",
  "충남": "충청남도",
  "전북": "전북특별자치도",
  "전남": "전라남도",
  "경북": "경상북도",
  "경남": "경상남도",
  "제주": "제주특별자치도",
}

interface KakaoRegion {
  region_1depth_name: string
  region_2depth_name: string
}

interface KakaoAddressDocument {
  address?: KakaoRegion
  road_address?: KakaoRegion
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim()
  if (!query) return NextResponse.json({ results: [] })

  const res = await fetch(`${KAKAO_ADDRESS_SEARCH_URL}?query=${encodeURIComponent(query)}&size=30`, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  })
  if (!res.ok) return NextResponse.json({ results: [] }, { status: res.status })

  const data: { documents: KakaoAddressDocument[] } = await res.json()
  const seen = new Set<string>()
  const results: string[] = []
  for (const doc of data.documents) {
    const region = doc.address ?? doc.road_address
    if (!region) continue
    const sidoFull = SIDO_FULL_NAME[region.region_1depth_name] ?? region.region_1depth_name
    const location = region.region_2depth_name ? `${sidoFull} ${region.region_2depth_name}` : sidoFull
    if (seen.has(location)) continue
    seen.add(location)
    results.push(location)
  }

  return NextResponse.json({ results })
}
