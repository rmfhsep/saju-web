// 더미 유저 생성/삭제 스크립트가 공유하는 상수 & 랜덤 생성 유틸.
// 옵션 값들은 app/api/profile/route.ts가 저장하는 형식과 modules/profile/constants.ts의
// 실제 선택지를 그대로 따른다 — 추천 로직(lib/recommendations.ts)이 쓰는 필드만 정확하면
// 되지만, 상세 프로필 화면에서도 자연스럽게 보이도록 전체 필드를 채운다.

export const JOBS = [
  "전문직", "금융직", "R&D", "대기업", "공기업", "외국계 기업", "중견기업",
  "중소기업", "스타트업", "공무원", "직업군인", "사업가", "기술직", "프리랜서",
  "자영업", "학생", "기타",
]

export const PROFESSIONALS = [
  "의사", "치과의사", "한의사", "수의사", "약사", "변호사", "판사", "검사",
  "법무사", "변리사", "회계사", "세무사", "감정평가사", "건축사", "기타 전문직",
]

export const GENERIC_JOB_DETAILS = [
  "백엔드 개발자", "프론트엔드 개발자", "마케터", "디자이너", "영업관리",
  "회계팀", "인사팀", "MD", "프로덕트 매니저", "데이터 분석가",
]

export const SMOKING = ["비흡연", "가끔 피움", "매일 피움", "금연 중"]
export const DRINKING = ["비음주", "가끔 마심", "월 3~4회 정도", "월 5회 이상"]
export const DATING_PURPOSE = [
  "아직은 연애에만 집중하고 싶어요.",
  "결혼을 고려한 연애를 하고 싶어요.",
  "잘 모르겠어요.",
]
export const POLITICS = ["중도", "진보", "보수", "관심 없음"]
export const RELIGION = ["무교", "개신교", "불교", "천주교", "기타 종교"]
export const INCOME = [
  "2천만원 이상", "3천만원 이상", "4천만원 이상", "5천만원 이상",
  "6천만원 이상", "7천만원 이상", "8천만원 이상", "1억 이상", "소득 없음",
]

export const DEFAULT_TAGS = [
  "천천히 가까워지는", "편안한 관계 추구", "깔끔한 스타일 선호", "감정표현 풍부",
  "행동으로 바로 실천", "혼자만의 시간도 중요", "연락에 진심", "신뢰가 가장 중요",
]

export const BIO_SENTENCES = [
  "처음엔 낯을 좀 가리지만 친해지면 편하게 대하는 편이에요.",
  "주말엔 카페 투어나 산책하는 걸 좋아해요.",
  "일할 땐 집중하고 쉴 땐 확실히 쉬는 스타일이에요.",
  "새로운 사람을 만나는 것도, 익숙한 사람과 있는 것도 둘 다 좋아해요.",
  "약속은 꼭 지키는 편이라 연락 잘 안 되는 건 별로예요.",
  "운동은 잘 못하지만 같이 시작해볼 사람을 찾고 있어요.",
  "맛집 찾아다니는 걸 좋아해서 데이트 코스는 자신 있어요.",
  "혼자만의 시간도 중요하지만 좋은 사람과의 시간은 더 소중해요.",
]

export const LOCATIONS = [
  "서울특별시 강남구", "서울특별시 서초구", "서울특별시 송파구", "서울특별시 마포구",
  "서울특별시 성동구", "서울특별시 용산구", "서울특별시 영등포구", "서울특별시 광진구",
  "서울특별시 종로구", "서울특별시 강서구",
  "경기도 성남시", "경기도 수원시", "경기도 용인시", "경기도 고양시", "경기도 화성시",
  "경기도 안양시", "경기도 부천시",
  "인천광역시 연수구", "인천광역시 남동구",
  "부산광역시 해운대구", "부산광역시 수영구",
  "대구광역시 수성구", "대전광역시 유성구", "광주광역시 서구",
]

const MALE_GIVEN = ["민준", "서준", "도윤", "예준", "시우", "주원", "지호", "준서", "현우", "우진", "지훈", "동현"]
const FEMALE_GIVEN = ["서연", "서윤", "지우", "하윤", "지민", "다은", "채원", "수아", "예린", "소율", "은서", "유나"]
const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오"]

const NICKNAME_PREFIX = ["하늘", "라온", "다온", "그루", "소망", "별빛", "새봄", "온유", "다솜", "가온", "누리", "solar", "moon", "hana", "rin"]
const NICKNAME_SUFFIX = ["이", "언니", "님", "star", "day", "light", ""]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickMany(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pad2(n) {
  return String(n).padStart(2, "0")
}

/** MALE/FEMALE 랜덤 더미 유저 1명치 데이터를 만든다. phone은 호출부에서 유니크하게 채워야 한다. */
export function buildDummyUser(gender, seed) {
  const given = gender === "MALE" ? pick(MALE_GIVEN) : pick(FEMALE_GIVEN)
  const name = `${pick(SURNAMES)}${given}`
  const nickname = `${pick(NICKNAME_PREFIX)}${pick(NICKNAME_SUFFIX)}`.slice(0, 12)

  const year = randInt(1987, 2005) // 2026 기준 21~39세(한국식 나이)
  const month = randInt(1, 12)
  const day = randInt(1, 28) // 날짜 유효성 검증 없이도 항상 유효하도록 28일까지만 사용
  const birthDate = `${year}${pad2(month)}${pad2(day)}`

  const job = pick(JOBS)
  const jobDetail = job === "전문직" ? pick(PROFESSIONALS) : pick(GENERIC_JOB_DETAILS)
  const height = gender === "MALE" ? randInt(168, 186) : randInt(155, 172)

  const bioTags = pickMany(DEFAULT_TAGS, 3)
  const bio = Object.fromEntries(bioTags.map(tag => [tag, pick(BIO_SENTENCES)]))

  const photoBase = randInt(1, 68)
  const photos = [`https://i.pravatar.cc/600?img=${photoBase}`, `https://i.pravatar.cc/600?img=${photoBase + 1}`]

  return {
    name,
    nickname,
    gender,
    calendarType: "SOLAR",
    birthDate,
    birthTimeUnknown: true,
    location: pick(LOCATIONS),
    job,
    jobDetail,
    height,
    smoking: pick(SMOKING),
    drinking: pick(DRINKING),
    datingPurpose: pick(DATING_PURPOSE),
    politics: pick(POLITICS),
    religion: pick(RELIGION),
    income: pick(INCOME),
    photos: JSON.stringify(photos),
    bioTags: JSON.stringify(bioTags),
    bio: JSON.stringify(bio),
    termsAgreed: true,
    marketingAgreed: false,
    signupComplete: true,
    profileComplete: true,
  }
}
