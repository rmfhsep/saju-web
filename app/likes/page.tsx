"use client"

import { useAppRouter } from "@/lib/useAppRouter"
import AppBottomNav, { APP_BOTTOM_NAV_HEIGHT } from "@/components/ui/app-bottom-nav"
import { useLikes } from "@/lib/queries/useLikes"
import { calcAge } from "@/lib/age"
import { timeAgo } from "@/lib/time"

export default function LikesPage() {
  const router = useAppRouter()
  const likesQuery = useLikes()
  const likes = likesQuery.data ?? null

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT }}>
      <div className="h-[52px] flex items-center px-5 py-3.5 shrink-0">
        <h1 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">호감</h1>
      </div>

      {likes == null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : likes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5">
          <p className="text-[15px] font-semibold text-[#1f1f1f]">아직 받은 호감이 없어요</p>
          <p className="text-[13px] text-[#777]">추천 프로필에 먼저 호감을 보내보세요.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-1 px-5 pt-2">
          {likes.map(u => {
            const photos: string[] = u.photos ? JSON.parse(u.photos) : []
            const tags: string[] = u.bioTags ? JSON.parse(u.bioTags) : []
            const age = calcAge(u.birthDate)
            const displayName = u.nickname || u.name || ""
            return (
              <button
                key={u.id}
                onClick={() => router.push(`/recommend/${u.id}`)}
                className="flex items-center gap-3 py-3 text-left active:opacity-70"
              >
                <div className="w-16 h-16 rounded-[8px] bg-[#f4f4f5] overflow-hidden shrink-0">
                  {photos[0] && <img src={photos[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">
                    <span>{displayName}</span>
                    {age != null && <span className="font-normal text-[#777]">{age}살</span>}
                  </div>
                  {tags[0] && <span className="text-[13px] text-[#777] truncate">{tags[0]}</span>}
                </div>
                <span className="text-[12px] text-[#b7b7b7] shrink-0">{timeAgo(u.likedAt)}</span>
              </button>
            )
          })}
        </div>
      )}

      <AppBottomNav />
    </div>
  )
}
