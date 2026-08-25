"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"
import type { CompatibilitySectionViewModel } from "@/lib/matching"

export interface TargetUser {
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
  compat: CompatibilitySectionViewModel | null
}

async function fetchUserDetail(id: string): Promise<TargetUser> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error("프로필을 찾을 수 없어요.")
  return res.json()
}

/** 추천/매칭 상대 프로필 상세 쿼리. */
export function useUserDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.userDetail(id),
    queryFn: () => fetchUserDetail(id),
    enabled: !!id,
  })
}

interface SpendResult {
  ok: boolean
  stars?: number
  error?: string
}

interface LikeResult extends SpendResult {
  /** 이미 보낸 호감에 재요청한 경우(별 재차감 없이 200으로 응답) — "이미 호감을 보냈어요." 토스트 분기용 */
  alreadyLiked?: boolean
}

/**
 * 호감 보내기(POST /api/likes). 별 부족 등 실패도 throw하지 않고 { ok:false } 로 반환한다 —
 * 실패 응답에도 서버가 현재 별 잔액을 함께 내려주므로, 성공/실패 관계없이 me 쿼리 캐시를
 * 최신 잔액으로 맞추기 위함이다(토스트 문구는 페이지에서 result.ok로 분기).
 */
export function useLikeMutation(targetId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<LikeResult> => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: Number(targetId) }),
      })
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, stars: data.stars, error: data.error, alreadyLiked: data.alreadyLiked }
    },
    onSuccess: result => {
      if (result.stars != null) {
        queryClient.setQueryData(queryKeys.me, (prev: { stars: number } | null | undefined) =>
          prev ? { ...prev, stars: result.stars } : prev,
        )
      }
      if (result.ok) {
        queryClient.setQueryData<TargetUser | undefined>(queryKeys.userDetail(targetId), prev =>
          prev ? { ...prev, likedByMe: true } : prev,
        )
      }
    },
  })
}

/** 메시지 보내기(POST /api/messages). 별 차감 실패도 던지지 않는 방식은 useLikeMutation과 동일. */
export function useMessageMutation(targetId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: string): Promise<SpendResult> => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: Number(targetId), body }),
      })
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, stars: data.stars, error: data.error }
    },
    onSuccess: result => {
      if (result.stars != null) {
        queryClient.setQueryData(queryKeys.me, (prev: { stars: number } | null | undefined) =>
          prev ? { ...prev, stars: result.stars } : prev,
        )
      }
      if (result.ok) {
        queryClient.setQueryData<TargetUser | undefined>(queryKeys.userDetail(targetId), prev =>
          prev ? { ...prev, hasConversation: true } : prev,
        )
        // 새로 시작된 대화가 "메시지" 탭 목록에도 바로 보이도록 무효화한다.
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
      }
    },
  })
}
