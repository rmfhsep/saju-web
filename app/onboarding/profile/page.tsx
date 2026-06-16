"use client"

import { useEffect, useRef, useState } from "react"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"

const TOTAL_STEPS = 12

type ProfileData = {
  nickname: string
  location: string
  job: string
  jobDetail: string
  height: string
  smoking: string
  drinking: string
  datingPurpose: string
  politics: string
  religion: string
  income: string
  photos: string[]
  bioTags: string[]
  bio: Record<string, string>
}

const JOBS = [
  { id: "전문직", hasDetail: true },
  { id: "금융직", hasDetail: false },
  { id: "R&D", hasDetail: false },
  { id: "대기업", hasDetail: false },
  { id: "공기업", hasDetail: false },
  { id: "외국계 기업", hasDetail: false },
  { id: "중견기업", hasDetail: false },
  { id: "중소기업", hasDetail: false },
  { id: "스타트업", hasDetail: false },
  { id: "공무원", hasDetail: false },
  { id: "직업군인", hasDetail: false },
  { id: "사업가", hasDetail: false },
  { id: "기술직", hasDetail: false },
  { id: "프리랜서", hasDetail: false },
  { id: "자영업", hasDetail: false },
  { id: "학생", hasDetail: false },
  { id: "기타", hasDetail: false },
]

const PROFESSIONALS = [
  "의사", "치과의사", "한의사", "수의사", "약사",
  "변호사", "판사", "검사", "법무사", "변리사",
  "회계사", "세무사", "감정평가사", "건축사", "기타 전문직",
]

const SMOKING_OPTIONS = ["비흡연", "가끔 피움", "매일 피움", "금연 중"]
const DRINKING_OPTIONS = ["비음주", "가끔 마심", "월 3~4회 정도", "월 5회 이상"]
const DATING_OPTIONS = [
  "아직은 연애에만 집중하고 싶어요.",
  "결혼을 고려한 연애를 하고 싶어요.",
  "잘 모르겠어요.",
]
const POLITICS_OPTIONS = ["중도", "진보", "보수", "관심 없음"]
const RELIGION_OPTIONS = ["무교", "개신교", "불교", "천주교", "기타 종교"]
const INCOME_OPTIONS = [
  "2천만원 이상", "3천만원 이상",
  "4천만원 이상", "5천만원 이상",
  "6천만원 이상", "7천만원 이상",
  "8천만원 이상", "1억 이상",
  "소득 없음",
]

const DEFAULT_TAGS = [
  "천천히 가까워지는", "편안한 관계 추구",
  "깔끔한 스타일 선호", "감정표현 풍부",
  "행동으로 바로 실천", "혼자만의 시간도 중요",
  "연락에 진심", "신뢰가 가장 중요",
]

// ── Intro screen ───────────────────────────────────────────────────────────────

function StepIntro({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-[54px] flex items-center px-4">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="#0f0f10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="flex-1 px-5 flex flex-col items-center justify-center gap-6">
        {/* App logo */}
        <div className="w-[72px] h-[72px] rounded-[18px] bg-[#b6d0ff] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 8C14 8 9 13 9 19.5C9 23.5 11 27 14.5 29.5L13 33L17.5 30.5C18.3 30.7 19.1 30.8 20 30.8C26 30.8 31 25.8 31 19.5C31 13.2 26 8 20 8Z" fill="#1a73e8"/>
            <path d="M15 20C15 20 17 22.5 20 22.5C23 22.5 25 20 25 20" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="16" cy="18" r="1.5" fill="white"/>
            <circle cx="24" cy="18" r="1.5" fill="white"/>
          </svg>
        </div>
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
            인연을 추천받기 위한<br />프로필을 완성해주세요.
          </h1>
          <p className="text-[15px] text-[#6b6b6b] leading-relaxed">
            내가 어떤 사람인지 솔직하게 작성할수록<br />더 잘 맞는 관계를 발견할 수 있어요.<br />좋은 인연을 만나기 위해 진솔하게 채워주세요.
          </p>
        </div>
      </div>
      <div className="px-5 pb-8 pt-4">
        <button
          onClick={onNext}
          className="w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-tight bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80"
        >
          다음
        </button>
      </div>
    </div>
  )
}

// ── Shared components ──────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-[4px] px-5 py-3">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full transition-colors"
          style={{ backgroundColor: i < step ? "#1a73e8" : "#e0e0e0" }}
        />
      ))}
    </div>
  )
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-[54px] flex items-center px-4">
      <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
          <path d="M9 1L1 9L9 17" stroke="#0f0f10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <span className="flex-1 text-center text-[17px] font-semibold text-[#0f0f10]">프로필 설정</span>
      <div className="w-8" />
    </div>
  )
}

function NextBtn({ active, onClick, label = "다음" }: { active: boolean; onClick: () => void; label?: string }) {
  return (
    <div className="px-5 pb-8 pt-4 shrink-0 keyboard-safe-bottom">
      <button
        onClick={active ? onClick : undefined}
        className={`w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-tight transition-colors ${
          active ? "bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80" : "bg-[#f4f4f5] text-[#a0a0a0]"
        }`}
      >
        {label}
      </button>
    </div>
  )
}

function RadioRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 h-[48px] rounded-[10px] transition-colors ${
        selected ? "bg-[#eef2ff] border border-[#aecbff]" : "bg-[#f5f5f7] border border-transparent"
      }`}
    >
      <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-[#1a73e8]" : "border-[#ccc]"
      }`}>
        {selected && <div className="w-[9px] h-[9px] rounded-full bg-[#1a73e8]" />}
      </div>
      <span className={`text-[15px] ${selected ? "font-semibold text-[#0f0f10]" : "font-normal text-[#4a4a4a]"}`}>
        {label}
      </span>
    </button>
  )
}

// ── Steps ──────────────────────────────────────────────────────────────────────

function StepNickname({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  const max = 12
  const valid = data.nickname.trim().length > 0 && data.nickname.trim().length <= max
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35] mb-1">닉네임을 입력해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b] leading-relaxed">
            내 프로필에 보일 이름이에요.<br />한글 및 영문으로 작성해주세요.
          </p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] font-semibold text-[#0f0f10]">닉네임</label>
          <div className="relative">
            <input
              type="text"
              placeholder={`${max}자 이하 한글 및 영문으로 입력해주세요.`}
              value={data.nickname}
              onChange={e => onChange({ nickname: e.target.value.slice(0, max) })}
              className="w-full h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[16px] text-[#0f0f10] placeholder:text-[#b7b7b7] outline-none focus:border-[#1a73e8] bg-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#9e9e9e]">
              {data.nickname.length}/{max}
            </span>
          </div>
        </div>
      </div>
      <NextBtn active={valid} onClick={onNext} />
    </div>
  )
}

const ALL_LOCATIONS = [
  "강원특별자치도 강릉시","강원특별자치도 고성군","강원특별자치도 동해시","강원특별자치도 삼척시",
  "강원특별자치도 속초시","강원특별자치도 양구군","강원특별자치도 양양군","강원특별자치도 영월군",
  "강원특별자치도 원주시","강원특별자치도 인제군","강원특별자치도 정선군","강원특별자치도 철원군",
  "강원특별자치도 춘천시","강원특별자치도 태백시","강원특별자치도 평창군","강원특별자치도 홍천군",
  "강원특별자치도 화천군","강원특별자치도 횡성군",
  "경기도 가평군","경기도 고양시 덕양구","경기도 고양시 일산동구","경기도 고양시 일산서구",
  "경기도 과천시","경기도 광명시","경기도 광주시","경기도 구리시","경기도 군포시",
  "경기도 김포시","경기도 남양주시","경기도 동두천시","경기도 부천시","경기도 성남시 분당구",
  "경기도 성남시 수정구","경기도 성남시 중원구","경기도 수원시 권선구","경기도 수원시 영통구",
  "경기도 수원시 장안구","경기도 수원시 팔달구","경기도 시흥시","경기도 안산시 단원구",
  "경기도 안산시 상록구","경기도 안성시","경기도 안양시 동안구","경기도 안양시 만안구",
  "경기도 양주시","경기도 양평군","경기도 여주시","경기도 연천군","경기도 오산시",
  "경기도 용인시 기흥구","경기도 용인시 수지구","경기도 용인시 처인구","경기도 의왕시",
  "경기도 의정부시","경기도 이천시","경기도 파주시","경기도 평택시","경기도 포천시",
  "경기도 하남시","경기도 화성시",
  "경상남도 거제시","경상남도 거창군","경상남도 고성군","경상남도 김해시","경상남도 남해군",
  "경상남도 밀양시","경상남도 사천시","경상남도 산청군","경상남도 양산시","경상남도 의령군",
  "경상남도 진주시","경상남도 창녕군","경상남도 창원시 마산합포구","경상남도 창원시 마산회원구",
  "경상남도 창원시 성산구","경상남도 창원시 의창구","경상남도 창원시 진해구","경상남도 통영시",
  "경상남도 하동군","경상남도 함안군","경상남도 함양군","경상남도 합천군",
  "경상북도 경산시","경상북도 경주시","경상북도 고령군","경상북도 구미시","경상북도 군위군",
  "경상북도 김천시","경상북도 문경시","경상북도 봉화군","경상북도 상주시","경상북도 성주군",
  "경상북도 안동시","경상북도 영덕군","경상북도 영양군","경상북도 영주시","경상북도 영천시",
  "경상북도 예천군","경상북도 울릉군","경상북도 울진군","경상북도 의성군","경상북도 청도군",
  "경상북도 청송군","경상북도 칠곡군","경상북도 포항시 남구","경상북도 포항시 북구",
  "광주광역시 광산구","광주광역시 남구","광주광역시 동구","광주광역시 북구","광주광역시 서구",
  "대구광역시 군위군","대구광역시 남구","대구광역시 달서구","대구광역시 달성군",
  "대구광역시 동구","대구광역시 북구","대구광역시 서구","대구광역시 수성구","대구광역시 중구",
  "대전광역시 대덕구","대전광역시 동구","대전광역시 서구","대전광역시 유성구","대전광역시 중구",
  "부산광역시 강서구","부산광역시 금정구","부산광역시 기장군","부산광역시 남구",
  "부산광역시 동구","부산광역시 동래구","부산광역시 부산진구","부산광역시 북구",
  "부산광역시 사상구","부산광역시 사하구","부산광역시 서구","부산광역시 수영구",
  "부산광역시 연제구","부산광역시 영도구","부산광역시 중구","부산광역시 해운대구",
  "서울특별시 강남구","서울특별시 강동구","서울특별시 강북구","서울특별시 강서구",
  "서울특별시 관악구","서울특별시 광진구","서울특별시 구로구","서울특별시 금천구",
  "서울특별시 노원구","서울특별시 도봉구","서울특별시 동대문구","서울특별시 동작구",
  "서울특별시 마포구","서울특별시 서대문구","서울특별시 서초구","서울특별시 성동구",
  "서울특별시 성북구","서울특별시 송파구","서울특별시 양천구","서울특별시 영등포구",
  "서울특별시 용산구","서울특별시 은평구","서울특별시 종로구","서울특별시 중구","서울특별시 중랑구",
  "세종특별자치시",
  "울산광역시 남구","울산광역시 동구","울산광역시 북구","울산광역시 울주군","울산광역시 중구",
  "인천광역시 강화군","인천광역시 계양구","인천광역시 남동구","인천광역시 동구",
  "인천광역시 미추홀구","인천광역시 부평구","인천광역시 서구","인천광역시 연수구",
  "인천광역시 옹진군","인천광역시 중구",
  "전라남도 강진군","전라남도 고흥군","전라남도 곡성군","전라남도 광양시","전라남도 구례군",
  "전라남도 나주시","전라남도 담양군","전라남도 목포시","전라남도 무안군","전라남도 보성군",
  "전라남도 순천시","전라남도 신안군","전라남도 여수시","전라남도 영광군","전라남도 영암군",
  "전라남도 완도군","전라남도 장성군","전라남도 장흥군","전라남도 진도군","전라남도 함평군",
  "전라남도 해남군","전라남도 화순군",
  "전북특별자치도 고창군","전북특별자치도 군산시","전북특별자치도 김제시","전북특별자치도 남원시",
  "전북특별자치도 무주군","전북특별자치도 부안군","전북특별자치도 순창군","전북특별자치도 완주군",
  "전북특별자치도 익산시","전북특별자치도 임실군","전북특별자치도 장수군","전북특별자치도 전주시 덕진구",
  "전북특별자치도 전주시 완산구","전북특별자치도 정읍시","전북특별자치도 진안군",
  "제주특별자치도 서귀포시","제주특별자치도 제주시",
  "충청남도 계룡시","충청남도 공주시","충청남도 금산군","충청남도 논산시","충청남도 당진시",
  "충청남도 보령시","충청남도 부여군","충청남도 서산시","충청남도 서천군","충청남도 아산시",
  "충청남도 예산군","충청남도 천안시 동남구","충청남도 천안시 서북구","충청남도 청양군",
  "충청남도 태안군","충청남도 홍성군",
  "충청북도 괴산군","충청북도 단양군","충청북도 보은군","충청북도 영동군","충청북도 옥천군",
  "충청북도 음성군","충청북도 제천시","충청북도 증평군","충청북도 진천군","충청북도 청주시 상당구",
  "충청북도 청주시 서원구","충청북도 청주시 청원구","충청북도 청주시 흥덕구","충청북도 충주시",
].sort((a, b) => a.localeCompare(b, "ko"))

function StepLocation({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  const [q, setQ] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = q.trim()
    ? ALL_LOCATIONS.filter(l => l.includes(q.trim()))
    : ALL_LOCATIONS

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="px-5 pt-6 pb-4 shrink-0">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35] mb-6">거주지를 알려주세요.</h1>
        <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[8px] px-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#1f1f1f" strokeWidth="1.6"/>
            <path d="M16.5 16.5L20 20" stroke="#1f1f1f" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="시·군·구 검색"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 text-[16px] text-[#1f1f1f] placeholder:text-[#9e9e9e] outline-none bg-transparent tracking-[-0.32px]"
          />
          {q && (
            <button onClick={() => { setQ(""); inputRef.current?.focus() }}
              className="w-[20px] h-[20px] flex items-center justify-center rounded-full bg-[#9e9e9e]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5">
        {filtered.length === 0 ? (
          <p className="text-[14px] text-[#777] leading-relaxed pt-4">
            검색 결과가 없어요.<br />주소를 다시 확인해주세요.
          </p>
        ) : (
          filtered.map(loc => {
            const selected = data.location === loc
            return (
              <button
                key={loc}
                onClick={() => { onChange({ location: loc }); setQ(loc) }}
                className="w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-left"
              >
                <span className={`text-[15px] tracking-[-0.15px] leading-normal font-medium ${selected ? "text-[#1a73e8]" : "text-[#1f1f1f]"}`}>
                  {loc}
                </span>
                {selected && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10.5l4.5 4.5L16 6" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )
          })
        )}
      </div>
      <NextBtn active={!!data.location} onClick={onNext} />
    </div>
  )
}

function StepJob({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  const [q, setQ] = useState("")
  const [showPro, setShowPro] = useState(false)
  const filtered = q ? JOBS.filter(j => j.id.toLowerCase().includes(q.toLowerCase())) : JOBS

  function selectJob(jobId: string, hasDetail: boolean) {
    if (hasDetail) { setShowPro(true); onChange({ job: jobId, jobDetail: "" }) }
    else { onChange({ job: jobId, jobDetail: "" }) }
  }

  if (showPro) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header onBack={() => { setShowPro(false); onChange({ jobDetail: "" }) }} />
        <ProgressBar step={step} />
        <div className="px-5 pt-6 shrink-0">
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">전문직 종류를 선택해주세요.</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-5 mt-4 flex flex-col gap-2">
          {PROFESSIONALS.map(p => (
            <RadioRow key={p} label={p} selected={data.jobDetail === p} onClick={() => onChange({ jobDetail: p })} />
          ))}
        </div>
        <NextBtn active={!!data.jobDetail} onClick={onNext} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="px-5 pt-6 flex flex-col gap-4 shrink-0">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">직업을 알려주세요.</h1>
        <div className="flex items-center gap-2 h-[48px] bg-[#f4f4f5] rounded-[8px] px-4 border-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#9e9e9e" strokeWidth="1.4"/>
            <path d="M11 11L14 14" stroke="#9e9e9e" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="업종 검색"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 text-[15px] text-[#0f0f10] placeholder:text-[#9e9e9e] outline-none bg-transparent"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5">
        {filtered.map(job => (
          <button
            key={job.id}
            onClick={() => selectJob(job.id, job.hasDetail)}
            className={`w-full flex items-center justify-between h-[53px] border-b border-[#f4f4f5] text-[15px] transition-colors ${
              data.job === job.id ? "text-[#1a73e8] font-semibold" : "text-[#0f0f10] font-medium"
            }`}
          >
            {job.id}
            {job.hasDetail ? (
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1l5 5-5 5" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : data.job === job.id ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10.5l4.5 4.5L16 6" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </button>
        ))}
      </div>
      <NextBtn active={!!data.job} onClick={onNext} />
    </div>
  )
}

function StepHeight({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  const valid = /^\d{3}$/.test(data.height) && +data.height >= 100 && +data.height <= 250
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-8">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">키를 알려주세요.</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="숫자만 입력해주세요."
            value={data.height}
            onChange={e => onChange({ height: e.target.value.replace(/\D/g, "").slice(0, 3) })}
            className="w-[295px] h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#b7b7b7] outline-none focus:border-[#1a73e8] bg-white"
          />
          <span className="text-[15px] font-medium text-[#0f0f10]">cm</span>
        </div>
      </div>
      <NextBtn active={valid} onClick={onNext} />
    </div>
  )
}

function StepRadio({ title, options, value, onChange, onNext, onBack, step }: {
  title: string; options: string[]; value: string
  onChange: (v: string) => void; onNext: () => void; onBack: () => void; step: number
}) {
  useEffect(() => {
    if (!value && options.length > 0) onChange(options[0])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">{title}</h1>
        <div className="flex flex-col gap-[10px]">
          {options.map(opt => (
            <RadioRow key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
          ))}
        </div>
      </div>
      <NextBtn active={!!value} onClick={onNext} />
    </div>
  )
}

function IncomeCell({ opt, selected, onClick }: { opt: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 h-[48px] rounded-[10px] transition-colors text-left ${
        selected ? "bg-[#eef2ff] border border-[#aecbff]" : "bg-[#f5f5f7] border border-transparent"
      }`}
    >
      <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#1a73e8]" : "border-[#ccc]"}`}>
        {selected && <div className="w-[9px] h-[9px] rounded-full bg-[#1a73e8]" />}
      </div>
      <span className={`text-[14px] ${selected ? "font-semibold text-[#0f0f10]" : "text-[#4a4a4a]"}`}>{opt}</span>
    </button>
  )
}

function StepIncome({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">연봉을 알려주세요.</h1>
          <p className="mt-1 text-[13px] text-[#e53935]">연봉 정보는 프로필에 공개되지 않아요.</p>
        </div>
        {/* 2-column grid for all 9 options; 9th item sits in the left column naturally */}
        <div className="grid grid-cols-2 gap-[8px]">
          {INCOME_OPTIONS.slice(0, 8).map(opt => (
            <IncomeCell key={opt} opt={opt} selected={data.income === opt} onClick={() => onChange({ income: opt })} />
          ))}
          {/* 9th item in left column only */}
          <IncomeCell opt={INCOME_OPTIONS[8]} selected={data.income === INCOME_OPTIONS[8]} onClick={() => onChange({ income: INCOME_OPTIONS[8] })} />
        </div>
      </div>
      <NextBtn active={!!data.income} onClick={onNext} />
    </div>
  )
}

function StepPhotos({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const slots = [...data.photos, ...Array(Math.max(0, 5 - data.photos.length)).fill("")]

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || activeSlot === null) return
    const url = URL.createObjectURL(file)
    const next = [...data.photos]
    if (activeSlot < next.length) next[activeSlot] = url
    else next.push(url)
    onChange({ photos: next })
    e.target.value = ""
  }

  function openSlot(idx: number) { setActiveSlot(idx); fileRef.current?.click() }
  const valid = data.photos.length >= 2

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">프로필 사진을 2장 이상<br />등록해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b]">정면 사진 2장은 필수예요.</p>
          <p className="mt-[2px] text-[13px] text-[#e53935]">가이드에 위배되는 사진은 경고를 받을 수 있습니다.</p>
          <button className="mt-3 px-4 h-[28px] border border-[#d0d0d0] rounded-full text-[13px] text-[#6b6b6b] flex items-center">
            사진 등록 가이드
          </button>
        </div>
        <div className="flex flex-col gap-[8px]">
          {/* Large required slots — square, ~163.5px each with 8px gap */}
          <div className="flex gap-[8px]">
            {[0, 1].map(i => (
              <button
                key={i}
                onClick={() => openSlot(i)}
                className="relative flex-1 rounded-[10px] border-[1.5px] border-dashed border-[#d0d0d0] bg-[#f5f5f7] flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: "1/1" }}
              >
                {slots[i] ? (
                  <img src={slots[i]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="absolute top-2 left-2 bg-[#1a73e8] text-white text-[11px] font-semibold px-2 py-[2px] rounded-full leading-none">필수</span>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="15" stroke="#d0d0d0" strokeWidth="1.5"/>
                      <path d="M16 10v12M10 16h12" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </>
                )}
              </button>
            ))}
          </div>
          {/* Small optional slots — square, ~106px each with 8px gap */}
          <div className="flex gap-[8px]">
            {[2, 3, 4].map(i => (
              <button
                key={i}
                onClick={() => openSlot(i)}
                className="relative flex-1 rounded-[10px] border-[1.5px] border-dashed border-[#d0d0d0] bg-[#f5f5f7] flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: "1/1" }}
              >
                {slots[i] ? (
                  <img src={slots[i]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="15" stroke="#d0d0d0" strokeWidth="1.5"/>
                    <path d="M16 10v12M10 16h12" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[13px] text-[#9e9e9e] text-center">길게 눌러 순서를 변경할 수 있어요.</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <NextBtn active={valid} onClick={onNext} />
    </div>
  )
}

function StepBioTags({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  const [customInput, setCustomInput] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [toast, setToast] = useState(false)
  const userTags = data.bioTags.filter(t => !DEFAULT_TAGS.includes(t))
  const allTags = [...DEFAULT_TAGS, ...userTags]

  function toggleTag(tag: string) {
    const sel = data.bioTags.includes(tag)
    if (!sel && data.bioTags.length >= 3) {
      setToast(true); setTimeout(() => setToast(false), 2000); return
    }
    onChange({ bioTags: sel ? data.bioTags.filter(t => t !== tag) : [...data.bioTags, tag] })
  }

  function addCustom() {
    const t = customInput.trim()
    if (!t) return
    if (data.bioTags.length >= 3) { setToast(true); setTimeout(() => setToast(false), 2000); return }
    onChange({ bioTags: [...data.bioTags, t] })
    setCustomInput(""); setShowCustom(false)
  }

  const valid = data.bioTags.length === 3
  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">자기소개를 작성을 위해<br />태그를 선택해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b] leading-relaxed">
            입력한 출생 정보를 분석해 나의 연애 성향을 기반으로 자동 생성된 태그예요. 원하는 태그를 3개 선택하고 나에 대한 소개를 더 상세하게 작성해주세요.
          </p>
          <p className="mt-2 text-[13px] font-semibold text-[#1a73e8]">3개 선택 필수</p>
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {allTags.map(tag => {
            const sel = data.bioTags.includes(tag)
            return (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`px-4 h-[36px] rounded-full border text-[14px] font-medium transition-colors flex items-center ${
                  sel ? "bg-[#0f0f10] border-[#0f0f10] text-white" : "bg-white border-[#d0d0d0] text-[#0f0f10]"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
        {showCustom ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="태그를 입력하세요"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustom()}
              autoFocus
              className="flex-1 h-[44px] border border-[#d8d8d8] rounded-[8px] px-3 text-[15px] outline-none focus:border-[#1a73e8]"
            />
            <button onClick={addCustom} className="px-4 h-[44px] bg-[#0f0f10] text-white rounded-[8px] text-[14px] font-semibold">추가</button>
          </div>
        ) : (
          <button onClick={() => setShowCustom(true)} className="px-4 h-[36px] rounded-full border border-[#d0d0d0] text-[14px] font-medium text-[#0f0f10] w-fit flex items-center">
            태그 직접 입력
          </button>
        )}
      </div>
      {toast && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-[#0f0f10]/90 text-white text-[13px] px-4 py-2 rounded-full whitespace-nowrap z-20">
          태그는 최대 3개까지 선택할 수 있어요.
        </div>
      )}
      <NextBtn active={valid} onClick={onNext} label="자기 소개 작성하기" />
    </div>
  )
}

function StepBio({ data, onChange, onNext, onBack, step }: {
  data: ProfileData; onChange: (d: Partial<ProfileData>) => void
  onNext: () => void; onBack: () => void; step: number
}) {
  const MIN = 50; const MAX = 500
  const valid = data.bioTags.every(tag => (data.bio[tag]?.length ?? 0) >= MIN)
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onBack={onBack} />
      <ProgressBar step={step} />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-5 overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">선택한 태그를 바탕으로<br />나를 더 자세히 소개해주세요.</h1>
          <p className="mt-2 text-[14px] text-[#6b6b6b] leading-relaxed">
            자세히 쓸수록 나와 잘 맞는 사람을 만날 확률이 높아져요.
          </p>
        </div>
        {data.bioTags.map(tag => (
          <div key={tag} className="flex flex-col gap-2">
            <span className="px-4 py-[6px] bg-[#f0f0f0] rounded-full text-[14px] font-semibold text-[#0f0f10] w-fit">{tag}</span>
            <div className="relative">
              <textarea
                placeholder="50자 이상 작성해주세요."
                value={data.bio[tag] ?? ""}
                onChange={e => onChange({ bio: { ...data.bio, [tag]: e.target.value.slice(0, MAX) } })}
                className="w-full h-[120px] border border-[#d8d8d8] rounded-[8px] p-4 text-[15px] text-[#0f0f10] placeholder:text-[#b7b7b7] outline-none focus:border-[#1a73e8] resize-none"
              />
              <span className="absolute bottom-3 right-3 text-[12px] text-[#9e9e9e]">{(data.bio[tag] ?? "").length}/{MAX}</span>
            </div>
          </div>
        ))}
      </div>
      <NextBtn active={valid} onClick={onNext} label="완료" />
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ProfileData>({
    nickname: "", location: "", job: "", jobDetail: "",
    height: "", smoking: "", drinking: "", datingPurpose: "",
    politics: "", religion: "", income: "", photos: [],
    bioTags: [], bio: {},
  })

  function update(d: Partial<ProfileData>) { setData(prev => ({ ...prev, ...d })) }

  function next() {
    // TOTAL_STEPS=12 are the form steps; step 13 is the bio writing step
    if (step < TOTAL_STEPS + 1) setStep(s => s + 1)
    else finish()
  }

  function back() {
    if (step === 0) bridgeBack()
    else setStep(s => s - 1)
  }

  async function finish() {
    const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, ...data, photos: JSON.stringify(data.photos), bioTags: JSON.stringify(data.bioTags), bio: JSON.stringify(data.bio) }),
    }).catch(() => {})
    bridgeNavigate("Home")
  }

  // progress bar shows 1–12; step 0 (intro) has no bar, step 13 (bio writing) shares 12
  const displayStep = Math.min(Math.max(step, 1), TOTAL_STEPS)
  const props = { data, onChange: update, onNext: next, onBack: back, step: displayStep }

  if (step === 0)  return <StepIntro onNext={next} onBack={bridgeBack} />
  if (step === 1)  return <StepNickname {...props} />
  if (step === 2)  return <StepLocation {...props} />
  if (step === 3)  return <StepJob {...props} />
  if (step === 4)  return <StepHeight {...props} />
  if (step === 5)  return <StepRadio {...props} title="흡연 여부를 알려주세요." options={SMOKING_OPTIONS} value={data.smoking} onChange={v => update({ smoking: v })} />
  if (step === 6)  return <StepRadio {...props} title="음주 빈도를 알려주세요." options={DRINKING_OPTIONS} value={data.drinking} onChange={v => update({ drinking: v })} />
  if (step === 7)  return <StepRadio {...props} title="연애 목적을 알려주세요." options={DATING_OPTIONS} value={data.datingPurpose} onChange={v => update({ datingPurpose: v })} />
  if (step === 8)  return <StepRadio {...props} title="정치 성향을 알려주세요." options={POLITICS_OPTIONS} value={data.politics} onChange={v => update({ politics: v })} />
  if (step === 9)  return <StepRadio {...props} title="종교를 알려주세요." options={RELIGION_OPTIONS} value={data.religion} onChange={v => update({ religion: v })} />
  if (step === 10) return <StepIncome {...props} />
  if (step === 11) return <StepPhotos {...props} />
  if (step === 12) return <StepBioTags {...props} />
  if (step === 13) return <StepBio {...props} />
  return null
}
