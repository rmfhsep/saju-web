"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import CtaButton from "@/components/ui/cta-button"
import StarIcon from "@/components/ui/star-icon"
import TextareaField from "@/components/ui/textarea-field"
import {
  ProfileChipIcon,
  MoreDotsIcon,
  FlirtingHeartIcon,
  FlirtingMessageIcon,
  CarouselIndicator,
  type ChipIconState,
} from "@/components/ui/profile-detail-icons"
import { calcAge, birthYearLabel } from "@/lib/age"
import type { CompatibilitySectionViewModel } from "@/lib/matching"
import { useMe } from "@/lib/queries/useMe"
import { useUserDetail, useLikeMutation, useMessageMutation } from "@/lib/queries/useUserDetail"

const LIKE_COST = 1
const MESSAGE_COST = 3
const MESSAGE_MAX = 100

const PURPOSE_SHORT_LABEL: Record<string, string> = {
  "아직은 연애에만 집중하고 싶어요.": "연애에만 집중",
  "결혼을 고려한 연애를 하고 싶어요.": "결혼 고려",
  "잘 모르겠어요.": "고민 중",
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

function Avatar({ src, size }: { src: string | null; size: number }) {
  return (
    <div
      className="rounded-full overflow-hidden bg-[#f4f4f5] shrink-0"
      style={{ width: size, height: size }}
    >
      {src && <img src={src} alt="" className="w-full h-full object-cover" />}
    </div>
  )
}

function CompatBadge({ type }: { type: "similar" | "complement" }) {
  return type === "similar" ? (
    <span className="flex items-center justify-center px-1 py-0.5 rounded-[4px] bg-[#fff5e5] text-[12px] font-semibold text-[#ff9f00]">
      유사
    </span>
  ) : (
    <span className="flex items-center justify-center px-1 py-0.5 rounded-[4px] bg-[#e2ffdf] text-[12px] font-semibold text-[#41de35]">
      보완
    </span>
  )
}

function AxisBar({
  axis,
  myPhoto,
  candidatePhoto,
}: {
  axis: CompatibilitySectionViewModel["axes"][number]
  myPhoto: string | null
  candidatePhoto: string | null
}) {
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <div className="flex gap-1 items-center w-full">
        <p className="text-[13px] font-medium text-[#1f1f1f] whitespace-nowrap">{axis.label}</p>
        <CompatBadge type={axis.relationType} />
      </div>
      <div className="flex flex-col gap-1 items-start w-full">
        <div
          className="relative h-7 w-full rounded-[40px] overflow-hidden"
          style={{ background: "linear-gradient(to right, #e3dfff, #f4ddff)" }}
        >
          <div className="absolute top-0.5" style={{ left: `calc(${axis.userValue}% - 12px)` }}>
            <Avatar src={myPhoto} size={24} />
          </div>
          <div className="absolute top-0.5" style={{ left: `calc(${axis.candidateValue}% - 12px)` }}>
            <Avatar src={candidatePhoto} size={24} />
          </div>
        </div>
        <div className="flex items-center justify-between w-full text-[11px] font-medium text-[#949494]">
          <span>{axis.leftLabel}</span>
          <span>{axis.rightLabel}</span>
        </div>
      </div>
    </div>
  )
}

function CompatSection({
  compat,
  myPhoto,
  candidatePhoto,
}: {
  compat: CompatibilitySectionViewModel
  myPhoto: string | null
  candidatePhoto: string | null
}) {
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <p className="text-[17px] font-semibold text-[#1f1f1f] tracking-[-0.34px] w-full">나와의 궁합</p>
      <div className="flex flex-col gap-3 items-center w-full">
        {compat.showSiJuNotice && compat.siJuNoticeText && (
          <p className="text-[12px] text-[#949494] w-full">{compat.siJuNoticeText}</p>
        )}

        <div className="bg-[#f7f7f8] rounded-[4px] p-4 flex flex-col gap-3 items-center w-full">
          <div className="flex flex-col gap-0.5 items-center">
            <div className="flex gap-2 items-center justify-center">
              <Avatar src={myPhoto} size={100} />
              <img src="/icons/compat-link.svg" alt="" className="w-[42px] h-[42px] shrink-0" />
              <Avatar src={candidatePhoto} size={100} />
            </div>
            <p className="text-[22px] font-bold text-[#1f1f1f] tracking-[-0.44px] whitespace-nowrap">{compat.score}점</p>
          </div>
          <div className="flex flex-wrap gap-2 items-start justify-center w-full">
            {compat.chips.map(chip => (
              <span
                key={chip.slot}
                className="h-6 flex items-center px-2 py-[3px] rounded-[4px] bg-[#cbdeff] text-[12px] font-medium text-[#1f1f1f] whitespace-nowrap"
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#eaf2fe] rounded-[4px] p-4 w-full">
          <p className="text-[15px] font-normal leading-[1.5] text-[#1f1f1f] tracking-[-0.3px] w-full">
            {compat.interpretation.sentence1}. {compat.interpretation.sentence2}. {compat.interpretation.sentence3}.
          </p>
        </div>

        <div className="bg-white border border-[#dfdfdf] rounded-[4px] p-4 flex flex-col gap-4 items-start w-full">
          <p className="text-[15px] font-semibold leading-[1.5] text-[#1f1f1f] tracking-[-0.3px] w-full">기질 비교</p>
          {compat.axes.map(axis => (
            <AxisBar key={axis.axisKey} axis={axis} myPhoto={myPhoto} candidatePhoto={candidatePhoto} />
          ))}
        </div>
      </div>
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
  const router = useAppRouter()
  const params = useParams<{ id: string }>()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const targetQuery = useUserDetail(params.id)
  const target = targetQuery.data ?? null
  const meQuery = useMe()
  const myStars = meQuery.data?.stars ?? 0
  const myPhotos: string[] = meQuery.data?.photos ? JSON.parse(meQuery.data.photos) : []
  const myPhoto = myPhotos[0] ?? null
  const loading = targetQuery.isLoading

  const likeMutation = useLikeMutation(params.id)
  const messageMutation = useMessageMutation(params.id)
  const liked = !!target?.likedByMe
  const hasConversation = !!target?.hasConversation

  const [photoIndex, setPhotoIndex] = useState(0)
  const [showLikeConfirm, setShowLikeConfirm] = useState(false)
  const [showMessageSheet, setShowMessageSheet] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [toast, setToast] = useState<string | null>(null)

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

  function handleConfirmLike() {
    if (likeMutation.isPending || !target) return
    likeMutation.mutate(undefined, {
      onSuccess: result => {
        setShowLikeConfirm(false)
        if (!result.ok) {
          showToast("별이 부족해요.")
          return
        }
        showToast(`${displayName}님에게 호감을 보냈어요.`)
      },
    })
  }

  function handleMessageTap() {
    if (!target || hasConversation) return
    setShowMessageSheet(true)
  }

  function handleSendMessage() {
    if (messageMutation.isPending || !messageText.trim() || !target) return
    messageMutation.mutate(messageText.trim(), {
      onSuccess: result => {
        if (!result.ok) {
          showToast("별이 부족해요.")
          return
        }
        setShowMessageSheet(false)
        setMessageText("")
        showToast(`${displayName}님에게 메시지를 보냈어요.`)
      },
    })
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

          {target.compat && (
            <CompatSection compat={target.compat} myPhoto={myPhoto} candidatePhoto={photos[0] ?? null} />
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
              <CtaButton loading={likeMutation.isPending} onClick={handleConfirmLike} className="flex-1">보내기</CtaButton>
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

              <TextareaField
                label="메시지 작성"
                disabled={insufficientForMessage}
                value={messageText}
                onChange={setMessageText}
                placeholder="메시지를 작성해주세요."
                maxLength={MESSAGE_MAX}
                rows={3}
              />
            </div>

            <div className="w-full px-5 pb-5" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}>
              {insufficientForMessage ? (
                <CtaButton onClick={() => router.push("/my/store")}>별 충전하기</CtaButton>
              ) : (
                <CtaButton disabled={!messageText.trim()} loading={messageMutation.isPending} onClick={handleSendMessage}>
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
