"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import type { ProfileData } from "@/modules/profile/types"

const MAX_PHOTOS = 5
const LONG_PRESS_MS = 350
// 손가락 미세 흔들림(2~10px)에 롱프레스가 취소되지 않도록 임계값을 키움
const MOVE_CANCEL_PX = 14

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
  const [loadingSlots, setLoadingSlots] = useState<Set<number>>(new Set())
  const uploading = loadingSlots.size > 0
  const [data, setData] = useState<EditData | null>(null)

  // 사진 롱프레스 드래그 순서 변경
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const gridRef = useRef<HTMLDivElement>(null)
  const activePointerId = useRef<number | null>(null)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressStart = useRef<{ x: number; y: number } | null>(null)
  const orderChanged = useRef(false)

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

    // 업로드될 슬롯 인덱스를 미리 계산해 슬롯별 스피너 표시 (온보딩과 동일)
    const count = Math.min(files.length, MAX_PHOTOS - activeSlot)
    setLoadingSlots(new Set(Array.from({ length: count }, (_, k) => activeSlot + k)))
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
      setLoadingSlots(new Set())
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

  // 순서 변경은 드래그 중 로컬 상태만 갱신하고, 드롭 시 한 번만 서버에 저장한다.
  function persistPhotos(photos: string[]) {
    const phone = localStorage.getItem("user_phone") ?? ""
    fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, photos }),
    }).catch(() => {})
  }

  function clearPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = null
    pressStart.current = null
  }

  function handleSlotPointerDown(idx: number, e: React.PointerEvent) {
    if (!data || idx >= data.photos.length) return
    activePointerId.current = e.pointerId
    pressStart.current = { x: e.clientX, y: e.clientY }
    // 눌리는 즉시 포인터 캡처 — 이후 move/up 이벤트를 그리드가 확실히 수신
    if (gridRef.current) {
      try { gridRef.current.setPointerCapture(e.pointerId) } catch { /* noop */ }
    }
    pressTimer.current = setTimeout(() => {
      setDragIndex(idx)
    }, LONG_PRESS_MS)
  }

  function handleGridPointerMove(e: React.PointerEvent) {
    if (!data) return
    if (dragIndex === null) {
      if (pressStart.current) {
        const dx = Math.abs(e.clientX - pressStart.current.x)
        const dy = Math.abs(e.clientY - pressStart.current.y)
        if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) clearPress()
      }
      return
    }
    const overIdx = slotRefs.current.findIndex(el => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    })
    if (overIdx === -1 || overIdx === dragIndex || overIdx >= data.photos.length) return
    const next = [...data.photos]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(overIdx, 0, moved)
    setData(prev => (prev ? { ...prev, photos: next } : prev))
    orderChanged.current = true
    setDragIndex(overIdx)
  }

  function handleGridPointerUp() {
    if (gridRef.current && activePointerId.current != null) {
      try { gridRef.current.releasePointerCapture(activePointerId.current) } catch { /* noop */ }
    }
    activePointerId.current = null
    clearPress()
    setDragIndex(null)
    if (orderChanged.current) {
      orderChanged.current = false
      if (data) persistPhotos(data.photos)
    }
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
      <div className="flex-1 scroll-area overflow-y-auto pb-9 flex flex-col gap-10">

        {/* 프로필 사진 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] px-5">프로필 사진</h2>
          <div
            ref={gridRef}
            className="flex flex-col gap-2 px-5"
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
            onPointerCancel={handleGridPointerUp}
          >
            <div className="flex gap-2">
              {[0, 1].map(i => (
                <EditPhotoSlot
                  key={i}
                  url={slots[i]}
                  required
                  loading={loadingSlots.has(i)}
                  dragging={dragIndex === i}
                  onClick={() => openSlot(i)}
                  onDelete={() => deletePhoto(i)}
                  onPointerDown={e => handleSlotPointerDown(i, e)}
                  slotRef={el => { slotRefs.current[i] = el }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {[2, 3, 4].map(i => (
                <EditPhotoSlot
                  key={i}
                  url={slots[i]}
                  loading={loadingSlots.has(i)}
                  dragging={dragIndex === i}
                  onClick={() => openSlot(i)}
                  onDelete={() => deletePhoto(i)}
                  onPointerDown={e => handleSlotPointerDown(i, e)}
                  slotRef={el => { slotRefs.current[i] = el }}
                />
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
          <h2 className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] px-5">자기 소개</h2>
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
          <h2 className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] px-5">내 정보</h2>
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

function EditPhotoSlot({ url, required, loading, dragging, onClick, onDelete, onPointerDown, slotRef }: {
  url: string
  required?: boolean
  loading?: boolean
  dragging?: boolean
  onClick: () => void
  onDelete: () => void
  onPointerDown: (e: React.PointerEvent) => void
  slotRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={slotRef}
      onPointerDown={url ? onPointerDown : undefined}
      style={{ aspectRatio: "1/1", touchAction: url ? "none" : "auto" }}
      className={`relative flex-1 transition-transform ${dragging ? "scale-105 opacity-80 z-10" : ""}`}
    >
      <button
        onClick={url || loading ? undefined : onClick}
        className="absolute inset-0 rounded-[8px] border-[1.5px] border-dashed border-[#dfdfdf] bg-white flex items-center justify-center overflow-hidden"
      >
        {loading ? (
          /* 업로드 중 슬롯별 스피너 — 온보딩과 동일 */
          <div className="absolute inset-0 bg-[#f4f4f5] flex items-center justify-center rounded-[8px]">
            <div className="w-6 h-6 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : url ? (
          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#d0d0d0" strokeWidth="1.5" />
            <path d="M16 10v12M10 16h12" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
        {!url && required && (
          <span className="absolute top-2 left-2 bg-[#1a75ff] text-white text-[12px] font-medium px-[6px] py-px rounded-full leading-[1.4] pointer-events-none">필수</span>
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
