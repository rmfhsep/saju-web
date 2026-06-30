"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import type { ProfileData } from "@/modules/profile/types"

const MAX_PHOTOS = 5

const INFO_ROWS: { key: keyof ProfileData | "birth"; label: string; format?: (data: EditData) => string }[] = [
  { key: "birth", label: "출생 정보", format: d => d.birthDisplay },
  { key: "nickname", label: "닉네임" },
  { key: "location", label: "거주지" },
  { key: "job", label: "직업", format: d => [d.job, d.jobDetail].filter(Boolean).join(" · ") },
  { key: "height", label: "키", format: d => (d.height ? `${d.height}cm` : "") },
  { key: "smoking", label: "흡연 여부" },
  { key: "drinking", label: "음주 빈도" },
  { key: "datingPurpose", label: "연애 목적" },
  { key: "politics", label: "정치 성향" },
  { key: "religion", label: "종교" },
  { key: "income", label: "연봉" },
]

const ROW_PATH: Record<string, string> = {
  birth: "/my/edit/birth",
  nickname: "/my/edit/nickname",
  location: "/my/edit/location",
  job: "/my/edit/job",
  height: "/my/edit/height",
  smoking: "/my/edit/smoking",
  drinking: "/my/edit/drinking",
  datingPurpose: "/my/edit/datingPurpose",
  politics: "/my/edit/politics",
  religion: "/my/edit/religion",
  income: "/my/edit/income",
}

type EditData = ProfileData & { birthDisplay: string }

function formatBirthDisplay(calendarType: string, birthDate: string, birthTime: string | null): string {
  const calLabel = calendarType === "LUNAR" ? "음력" : calendarType === "LUNAR_LEAP" ? "음력(윤달)" : "양력"
  if (!birthDate || birthDate.length !== 8) return ""
  const y = birthDate.slice(0, 4), m = parseInt(birthDate.slice(4, 6)), d = parseInt(birthDate.slice(6, 8))
  const dateStr = `${y}년 ${m}월 ${d}일`
  return birthTime ? `${calLabel} ${dateStr} · ${birthTime}` : `${calLabel} ${dateStr}`
}

export default function ProfileEditPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState<EditData | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (!user) return
        setData({
          nickname: user.nickname ?? "",
          location: user.location ?? "",
          job: user.job ?? "",
          jobDetail: user.jobDetail ?? "",
          height: user.height ? String(user.height) : "",
          smoking: user.smoking ?? "",
          drinking: user.drinking ?? "",
          datingPurpose: user.datingPurpose ?? "",
          politics: user.politics ?? "",
          religion: user.religion ?? "",
          income: user.income ?? "",
          photos: user.photos ? JSON.parse(user.photos) : [],
          bioTags: user.bioTags ? JSON.parse(user.bioTags) : [],
          bio: user.bio ? JSON.parse(user.bio) : {},
          birthDisplay: formatBirthDisplay(user.calendarType, user.birthDate, user.birthTimeUnknown ? null : user.birthTime),
        })
      })
  }, [])

  async function savePhotos(photos: string[]) {
    setData(prev => (prev ? { ...prev, photos } : prev))
    const phone = localStorage.getItem("user_phone") ?? ""
    await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, photos }),
    }).catch(() => {})
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0 || activeSlot === null || !data) return

    setUploading(true)
    try {
      const phone = localStorage.getItem("user_phone") ?? ""
      const formData = new FormData()
      formData.append("phone", phone)
      files.slice(0, MAX_PHOTOS - activeSlot).forEach(file => formData.append("files", file))

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const result = await res.json()
      if (!res.ok || !Array.isArray(result.urls)) return

      const next = [...data.photos]
      let slot = activeSlot
      for (const url of result.urls as string[]) {
        if (slot >= MAX_PHOTOS) break
        if (slot < next.length) next[slot] = url
        else next.push(url)
        slot++
      }
      await savePhotos(next.slice(0, MAX_PHOTOS))
    } finally {
      setUploading(false)
    }
  }

  function openSlot(idx: number) {
    if (uploading) return
    setActiveSlot(idx)
    fileRef.current?.click()
  }
  function deletePhoto(idx: number) {
    if (!data) return
    savePhotos(data.photos.filter((_, i) => i !== idx))
  }

  if (!data) {
    return (
      <Screen>
        <EditHeader title="프로필 편집" onBack={() => router.back()} />
      </Screen>
    )
  }

  const slots = [...data.photos, ...Array(Math.max(0, MAX_PHOTOS - data.photos.length)).fill("")]

  return (
    <Screen>
      <EditHeader title="프로필 편집" onBack={() => router.back()} />
      <div className="flex-1 scroll-area overflow-y-auto pb-10 flex flex-col gap-10">

        {/* 프로필 사진 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] text-center">프로필 사진</h2>
          <div className="flex flex-col gap-2 px-5">
            <div className="flex gap-2">
              {[0, 1].map(i => (
                <EditPhotoSlot key={i} url={slots[i]} required onClick={() => openSlot(i)} onDelete={() => deletePhoto(i)} />
              ))}
            </div>
            <div className="flex gap-2">
              {[2, 3, 4].map(i => (
                <EditPhotoSlot key={i} url={slots[i]} onClick={() => openSlot(i)} onDelete={() => deletePhoto(i)} />
              ))}
            </div>
          </div>
          <p className="text-[12px] text-[#777] text-center">
            {uploading ? "사진을 업로드하는 중이에요..." : "길게 눌러 순서를 변경할 수 있어요."}
          </p>
        </section>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

        {/* 자기 소개 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] text-center">자기 소개</h2>
          <div className="flex flex-col gap-4 px-5">
            {data.bioTags.map((tag, idx) => (
              <button
                key={tag + idx}
                onClick={() => router.push(`/my/edit/bio/${idx}`)}
                className="flex flex-col gap-2 text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="h-[36px] flex items-center px-4 bg-[#e9f1ff] border border-[#b6d0ff] rounded-[4px] text-[13px] font-medium text-[#1f1f1f]">{tag}</span>
                  <span className="text-[14px] font-semibold text-[#777]">수정</span>
                </div>
                <div className="w-full bg-white border border-[#dbdcdf] rounded-[4px] px-4 py-3">
                  <p className="text-[15px] text-[#1f1f1f] leading-normal tracking-[-0.3px] line-clamp-3">
                    {data.bio[tag] || "아직 작성하지 않았어요."}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 내 정보 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] text-center">내 정보</h2>
          <div className="flex flex-col">
            {INFO_ROWS.map(row => (
              <button
                key={row.key}
                onClick={() => router.push(ROW_PATH[row.key])}
                className="flex flex-col gap-4 pt-4 px-5"
              >
                <div className="w-full flex items-center gap-3">
                  <div className="flex-1 flex flex-col gap-0.5 items-start text-left">
                    <span className="text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px]">{row.label}</span>
                    <span className="text-[12px] text-[#949494]">{(row.format ? row.format(data) : (data[row.key as keyof ProfileData] as string)) || "미입력"}</span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 4l6 6-6 6" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="w-full h-px bg-[#eaebec]" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </Screen>
  )
}

function EditPhotoSlot({ url, required, onClick, onDelete }: {
  url: string
  required?: boolean
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div className="relative flex-1" style={{ aspectRatio: "1/1" }}>
      <button
        onClick={onClick}
        className="absolute inset-0 rounded-[8px] border-[1.5px] border-dashed border-[#dfdfdf] bg-white flex items-center justify-center overflow-hidden"
      >
        {url ? (
          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#d0d0d0" strokeWidth="1.5" />
            <path d="M16 10v12M10 16h12" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
        {!url && required && (
          <span className="absolute top-2 left-2 bg-[#1a75ff] text-white text-[12px] font-medium px-[6px] py-px rounded-full leading-[1.4]">필수</span>
        )}
      </button>
      {url && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
