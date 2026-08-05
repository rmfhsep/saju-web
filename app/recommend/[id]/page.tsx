"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import CtaButton from "@/components/ui/cta-button"
import StarIcon from "@/components/ui/star-icon"
import {
  ProfileChipIcon,
  MoreDotsIcon,
  FlirtingHeartIcon,
  FlirtingMessageIcon,
  CarouselIndicator,
  type ChipIconState,
} from "@/components/ui/profile-detail-icons"
import { calcAge, birthYearLabel } from "@/lib/age"

const LIKE_COST = 1
const MESSAGE_COST = 3
const MESSAGE_MAX = 100

const PURPOSE_SHORT_LABEL: Record<string, string> = {
  "아직은 연애에만 집중하고 싶어요.": "연애에만 집중",
  "결혼을 고려한 연애를 하고 싶어요.": "결혼 고려",
  "잘 모르겠어요.": "고민 중",
}

type TargetUser = {
  id: number
  nickname: string | null
  name: string | null
  birthDate: string | null
  height: number | null
  job: string | null
  jobDetail: string | null
  location: string | null
  smoking: string | null
  drinking: string | null
  datingPurpose: string | null
  politics: string | null
  religion: string | null
  photos: string | null
  bioTags: string | null
  bio: string | null
  likedByMe: boolean
  hasConversation: boolean
}

function InfoChip({ state, label }: { state: ChipIconState; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#f4f4f5] shrink-0">
      <ProfileChipIcon state={state} size={20} />
      <span className="text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px] whitespace-nowrap">{label}</span>
    </div>
  )
}

function BioCard({ tag, desc }: { tag: string; desc: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-[4px] border border-[#cbdeff] bg-[#e9f1ff]">
      <p className="text-[17px] font-bold text-[#1f1f1f] tracking-[-0.34px]">{tag}</p>
      <p className="text-[15px] font-normal leading-[1.5] text-[#555] tracking-[-0.3px]">{desc}</p>
    </div>
  )
}

function StarCostRow({ cost, balance }: { cost: number; balance: number }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1">
        <StarIcon size={20} />
        <span className="text-[15px] tracking-[-0.3px]">
          <b className="text-[#ff9f00] font-bold">{cost}</b>
          <span className="text-[#1f1f1f] font-medium">개 차감</span>
        </span>
      </div>
      <p className="text-[15px] text-[#777] tracking-[-0.3px]">현재 보유 : {balance}개</p>
    </div>
  )
}

export default function ProfileDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [target, setTarget] = useState<TargetUser | null>(null)
  const [myStars, setMyStars] = useState(0)
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)

  const [liked, setLiked] = useState(false)
  const [hasConversation, setHasConversation] = useState(false)
  const [showLikeConfirm, setShowLikeConfirm] = useState(false)
  const [showMessageSheet, setShowMessageSheet] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [messageBusy, setMessageBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // 연타/중복 터치로 같은 요청이 겹쳐 나가는 걸 막는 동기 가드 (state는 리렌더 전까지 반영이 늦다)
  const likeInFlightRef = useRef(false)
  const messageInFlightRef = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    fetch(`/api/users/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        setTarget(d)
        if (d) {
          setLiked(!!d.likedByMe)
          setHasConversation(!!d.hasConversation)
        }
      })
      .finally(() => setLoading(false))

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.stars != null) setMyStars(d.stars) })
  }, [params.id])

  // 모달/바텀시트가 떠 있는 동안, 그 위에서 드래그해도 뒤쪽 스크롤 영역이 같이
  // 스크롤되지 않도록 잠근다 (iOS WebView에서 fixed 오버레이 위 터치가 뒤로 새는 문제).
  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return
    if (showLikeConfirm || showMessageSheet) {
      el.style.overflow = "hidden"
    } else {
      el.style.overflow = ""
    }
  }, [showLikeConfirm, showMessageSheet])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  async function handleConfirmLike() {
    if (likeInFlightRef.current || !target) return
    likeInFlightRef.current = true
    setLikeBusy(true)
    const token = localStorage.getItem("auth_token")
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: target.id }),
      })
      const data = await res.json().catch(() => ({}))
      setShowLikeConfirm(false)
      if (!res.ok) {
        setMyStars(data.stars ?? myStars)
        showToast("별이 부족해요.")
        return
      }
      setMyStars(data.stars)
      setLiked(true)
      showToast(`${displayName}님에게 호감을 보냈어요.`)
    } finally {
      likeInFlightRef.current = false
      setLikeBusy(false)
    }
  }

  function handleMessageTap() {
    if (!target || hasConversation) return
    setShowMessageSheet(true)
  }

  async function handleSendMessage() {
    if (messageInFlightRef.current || !messageText.trim() || !target) return
    messageInFlightRef.current = true
    setMessageBusy(true)
    const token = localStorage.getItem("auth_token")
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: target.id, body: messageText.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMyStars(data.stars ?? myStars)
        showToast("별이 부족해요.")
        return
      }
      setMyStars(data.stars)
      setHasConversation(true)
      setShowMessageSheet(false)
      setMessageText("")
      showToast(`${displayName}님에게 메시지를 보냈어요.`)
    } finally {
      messageInFlightRef.current = false
      setMessageBusy(false)
    }
  }

  if (loading) {
    return (
      <Screen>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </Screen>
    )
  }

  if (!target) {
    return (
      <Screen>
        <div className="h-[52px] flex items-center gap-3 px-5 py-3.5 shrink-0">
          <BackButton onClick={() => router.back()} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[15px] text-[#777]">프로필을 찾을 수 없어요.</p>
        </div>
      </Screen>
    )
  }

  const photos: string[] = target.photos ? JSON.parse(target.photos) : []
  const tags: string[] = target.bioTags ? JSON.parse(target.bioTags) : []
  const bio: Record<string, string> = target.bio ? JSON.parse(target.bio) : {}
  const displayName = target.nickname || target.name || ""
  const age = calcAge(target.birthDate)
  const messageCost = hasConversation ? 0 : MESSAGE_COST
  const insufficientForMessage = myStars < messageCost

  return (
    <Screen className="relative">
      <div className="h-[52px] flex items-center gap-3 px-5 py-3.5 shrink-0 z-10 bg-white">
        <BackButton onClick={() => router.back()} />
        <h1 className="flex-1 text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">
          {displayName}
        </h1>
        <button
          type="button"
          onClick={() => showToast("준비 중이에요.")}
          className="w-8 h-8 flex items-center justify-center"
        >
          <MoreDotsIcon />
        </button>
      </div>

      <div ref={scrollAreaRef} className="flex-1 scroll-area overflow-y-auto pb-[140px]">
        <div className="relative w-full h-[500px] bg-[#f4f4f5] shrink-0">
          {photos.length > 0 ? (
            <div
              className="flex h-full overflow-x-auto snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
              onScroll={e => {
                const w = e.currentTarget.clientWidth
                setPhotoIndex(Math.round(e.currentTarget.scrollLeft / w))
              }}
            >
              {photos.map((p, i) => (
                <img key={i} src={p} alt="" className="w-full h-full object-cover shrink-0 snap-center" />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src="/logo.svg" alt="" className="w-16 h-16" />
            </div>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <CarouselIndicator count={photos.length} activeIndex={photoIndex} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[48px] px-5 pt-10">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-1 text-[24px] font-bold text-[#1f1f1f] tracking-[-0.48px]">
              <span>{displayName}</span>
              {age != null && (
                <>
                  <span>/</span>
                  <span>{age}살</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {birthYearLabel(target.birthDate) && (
                <InfoChip state="birthday" label={birthYearLabel(target.birthDate)!} />
              )}
              {target.height != null && <InfoChip state="tall" label={`${target.height}cm`} />}
              {target.job && (
                <InfoChip state="job" label={target.jobDetail ? `${target.job} · ${target.jobDetail}` : target.job} />
              )}
              {target.location && <InfoChip state="location" label={target.location} />}
              {target.smoking && <InfoChip state="tabacco" label={target.smoking} />}
              {target.drinking && <InfoChip state="alchohol" label={target.drinking} />}
              {target.datingPurpose && (
                <InfoChip state="purpose" label={PURPOSE_SHORT_LABEL[target.datingPurpose] ?? target.datingPurpose} />
              )}
              {target.politics && <InfoChip state="politics" label={target.politics} />}
              {target.religion && <InfoChip state="religion" label={target.religion} />}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-col gap-4">
              {tags.map(tag => (
                <BioCard key={tag} tag={tag} desc={bio[tag] ?? ""} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed left-0 right-0 flex justify-center gap-5"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
      >
        <button
          type="button"
          disabled={liked}
          onClick={() => setShowLikeConfirm(true)}
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-[0_4px_5px_rgba(0,0,0,0.28)]"
          style={{ backgroundColor: liked ? "#e8e8e8" : "#90b7ff" }}
        >
          <FlirtingHeartIcon size={36} />
        </button>
        <button
          type="button"
          disabled={hasConversation}
          onClick={handleMessageTap}
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-[0_4px_5px_rgba(0,0,0,0.28)]"
          style={{ backgroundColor: hasConversation ? "#e8e8e8" : "#37383c" }}
        >
          <FlirtingMessageIcon size={36} />
        </button>
      </div>

      {showLikeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ touchAction: "none" }}>
          <div className="absolute inset-0 bg-black/61" onClick={() => setShowLikeConfirm(false)} />
          <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">
                {displayName}님에게 호감을 보낼까요?
              </p>
              <StarCostRow cost={LIKE_COST} balance={myStars} />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLikeConfirm(false)}
                className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] active:opacity-80"
              >
                취소
              </button>
              <CtaButton loading={likeBusy} onClick={handleConfirmLike} className="flex-1">보내기</CtaButton>
            </div>
          </div>
        </div>
      )}

      {showMessageSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ touchAction: "none" }}>
          <div className="absolute inset-0 bg-black/61" onClick={() => setShowMessageSheet(false)} />
          <div className="relative bg-white rounded-t-[28px] w-full max-w-[430px] pt-3 flex flex-col items-center gap-6">
            <div className="w-11 h-1 rounded-full bg-[#dfdfdf]" />
            <div className="w-full px-5 flex flex-col gap-7">
              <div className="flex flex-col gap-2 text-center">
                <p className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">
                  {displayName}님에게 메시지 보내기
                </p>
                {insufficientForMessage && (
                  <p className="text-[14px] text-[#ff334b] tracking-[-0.14px]">
                    별이 부족해요.<br />별을 충전하고 메시지를 보내보세요.
                  </p>
                )}
              </div>

              <div className="px-4 py-3 rounded-[4px] bg-[#fff5e5]">
                <StarCostRow cost={messageCost} balance={myStars} />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-semibold text-[#1f1f1f] tracking-[-0.14px]">메시지 작성</p>
                <div className={`rounded-[4px] border border-[#dbdcdf] px-4 py-3 ${insufficientForMessage ? "bg-[#f5f5f5]" : "bg-white"}`}>
                  <textarea
                    disabled={insufficientForMessage}
                    value={messageText}
                    onChange={e => setMessageText(e.target.value.slice(0, MESSAGE_MAX))}
                    placeholder="메시지를 작성해주세요."
                    rows={3}
                    className="w-full resize-none text-[15px] tracking-[-0.3px] placeholder:text-[#b7b7b7] outline-none bg-transparent text-[#1f1f1f]"
                  />
                  <div className="text-right text-[12px] font-medium text-[#777]">{messageText.length}/{MESSAGE_MAX}</div>
                </div>
              </div>
            </div>

            <div className="w-full px-5 pb-5" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}>
              {insufficientForMessage ? (
                <CtaButton onClick={() => router.push("/my/store")}>별 충전하기</CtaButton>
              ) : (
                <CtaButton disabled={!messageText.trim()} loading={messageBusy} onClick={handleSendMessage}>
                  메시지 보내기
                </CtaButton>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[60] bg-black/74 text-white text-[14px] font-medium tracking-[-0.14px] px-6 py-3 rounded-[6px] whitespace-nowrap max-w-[296px] text-center"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 100px)" }}
        >
          {toast}
        </div>
      )}
    </Screen>
  )
}
