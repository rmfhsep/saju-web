"use client"

import { useEffect } from "react"
import { useAppRouter } from "@/lib/useAppRouter"
import AppBottomNav, { APP_BOTTOM_NAV_HEIGHT } from "@/components/ui/app-bottom-nav"
import { useConversations } from "@/lib/queries/useMessages"
import { timeAgo } from "@/lib/time"

export default function MessagesPage() {
  const router = useAppRouter()
  const conversationsQuery = useConversations()
  const conversations = conversationsQuery.data ?? null

  // 앱이 다시 포그라운드로 올 때 새 메시지를 반영 — refetchOnWindowFocus는 전역에서
  // 꺼뒀으므로(WebView 환경 특성) 이 화면에서만 명시적으로 재요청한다.
  useEffect(() => {
    const refetch = () => conversationsQuery.refetch()
    const handleVisible = () => {
      if (document.visibilityState === "visible") refetch()
    }
    window.addEventListener("focus", refetch)
    document.addEventListener("visibilitychange", handleVisible)
    return () => {
      window.removeEventListener("focus", refetch)
      document.removeEventListener("visibilitychange", handleVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT }}>
      <div className="h-[52px] flex items-center px-5 py-3.5 shrink-0">
        <h1 className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">메시지</h1>
      </div>

      {conversations == null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5">
          <p className="text-[15px] font-semibold text-[#1f1f1f]">아직 메시지가 없어요</p>
          <p className="text-[13px] text-[#777]">추천 프로필에서 먼저 말을 걸어보세요.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-1 px-5 pt-2">
          {conversations.map(c => {
            const photos: string[] = c.user.photos ? JSON.parse(c.user.photos) : []
            const displayName = c.user.nickname || c.user.name || ""
            return (
              <button
                key={c.user.id}
                onClick={() => router.push(`/messages/${c.user.id}`)}
                className="flex items-center gap-3 py-3 text-left active:opacity-70"
              >
                <div className="w-14 h-14 rounded-full bg-[#f4f4f5] overflow-hidden shrink-0">
                  {photos[0] && <img src={photos[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">{displayName}</span>
                  <span className="text-[13px] text-[#777] truncate">
                    {c.lastFromMe ? "나: " : ""}
                    {c.lastMessage}
                  </span>
                </div>
                <span className="text-[12px] text-[#b7b7b7] shrink-0">{timeAgo(c.lastAt)}</span>
              </button>
            )
          })}
        </div>
      )}

      <AppBottomNav />
    </div>
  )
}
