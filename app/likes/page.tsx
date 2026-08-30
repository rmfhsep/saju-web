"use client"

import { useState } from "react"
import { useAppRouter } from "@/lib/useAppRouter"
import AppBottomNav, { APP_BOTTOM_NAV_HEIGHT } from "@/components/ui/app-bottom-nav"
import { LikeToggleHeartIcon } from "@/components/ui/profile-detail-icons"
import { useLikes, useReciprocateLikeMutation, type LikeUser } from "@/lib/queries/useLikes"
import { calcAge } from "@/lib/age"

type Tab = "received" | "sent"

function TabToggle({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="bg-[#f4f4f5] flex gap-1 items-center p-1 rounded-[8px] w-full">
      {(["received", "sent"] as const).map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex-1 h-9 flex items-center justify-center rounded-[4px] text-[14px] tracking-[-0.14px] transition-colors ${
            tab === t ? "bg-white font-semibold text-[#1f1f1f]" : "font-normal text-[#777]"
          }`}
        >
          {t === "received" ? "받은 호감" : "보낸 호감"}
        </button>
      ))}
    </div>
  )
}

function HeartToggleButton({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className="absolute right-2 top-2 w-7 h-7"
    >
      <LikeToggleHeartIcon on={on} size={28} />
    </button>
  )
}

function LikeCard({
  user,
  showHeart,
  onClick,
  onReciprocate,
}: {
  user: LikeUser
  showHeart: boolean
  onClick: () => void
  onReciprocate?: () => void
}) {
  const photos: string[] = user.photos ? JSON.parse(user.photos) : []
  const displayName = user.nickname || user.name || ""
  const age = calcAge(user.birthDate)

  return (
    <div onClick={onClick} className="relative w-full h-[218px] rounded-[4px] overflow-hidden bg-[#f4f4f5] cursor-pointer">
      {photos[0] && <img src={photos[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-black/22" />
      {showHeart && <HeartToggleButton on={!!user.reciprocated} onClick={() => onReciprocate?.()} />}
      <div className="absolute left-3 bottom-3 flex flex-col text-white">
        <div className="flex items-center gap-0.5 text-[14px] font-semibold tracking-[-0.14px] whitespace-nowrap">
          <span>{displayName}</span>
          {age != null && (
            <>
              <span>/</span>
              <span>{age}살</span>
            </>
          )}
        </div>
        <p className="text-[12px] font-medium opacity-80">{user.daysLeft}일 후 사라짐</p>
      </div>
    </div>
  )
}

export default function LikesPage() {
  const router = useAppRouter()
  const [tab, setTab] = useState<Tab>("received")
  const likesQuery = useLikes(tab)
  const likes = likesQuery.data ?? null
  const reciprocateMutation = useReciprocateLikeMutation()
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  function handleReciprocate(user: LikeUser) {
    if (reciprocateMutation.isPending) return
    // 캐시가 아직 안 따라온 경우를 대비한 1차 방어 — 실제 최종 판단은 서버의 alreadyLiked로 한다.
    if (user.reciprocated) {
      showToast("이미 호감을 보냈어요.")
      return
    }
    reciprocateMutation.mutate(user.id, {
      onSuccess: result => {
        if (!result.ok) {
          showToast("별이 부족해요.")
          return
        }
        if (result.alreadyLiked) showToast("이미 호감을 보냈어요.")
      },
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT }}>
      <div className="h-[52px] flex items-center px-5 py-3.5 shrink-0">
        <h1 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">호감</h1>
      </div>

      <div className="px-5 pt-1 pb-4 shrink-0">
        <TabToggle tab={tab} onChange={setTab} />
      </div>

      {likes == null ? (
        <div className="grid grid-cols-2 gap-2 px-5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-full h-[218px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
          ))}
        </div>
      ) : likes.length === 0 ? (
        <div className="flex flex-col gap-5 px-5">
          <p className="text-[14px] text-[#777] leading-[1.5] tracking-[-0.14px] whitespace-pre-line">
            {tab === "received"
              ? "아직 받은 호감이 없어요.\n당신과 잘 맞는 인연을 찾아보고, 마음에 드는 사람에게 먼저\n호감을 보내보세요."
              : "아직 보낸 호감이 없어요\n마음에 드는 사람이 있다면 먼저 호감을 보내보세요."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="self-start h-[40px] px-5 bg-[#e9f1ff] rounded-[4px] text-[14px] font-semibold text-[#1a75ff] tracking-[-0.14px]"
          >
            {tab === "received" ? "인연 찾아보기" : "추천 프로필 보러가기"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-5 pb-4">
          {likes.map(u => (
            <LikeCard
              key={u.id}
              user={u}
              showHeart={tab === "received"}
              onClick={() => router.push(`/recommend/${u.id}?from=likes`)}
              onReciprocate={() => handleReciprocate(u)}
            />
          ))}
        </div>
      )}

      <AppBottomNav />

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[60] bg-black/74 text-white text-[14px] font-medium px-6 py-3 rounded-[6px] whitespace-nowrap max-w-[296px] text-center"
          style={{ bottom: `calc(env(safe-area-inset-bottom) + ${APP_BOTTOM_NAV_HEIGHT + 16}px)` }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
