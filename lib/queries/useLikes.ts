"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"

export interface LikeUser {
  id: number
  nickname: string | null
  name: string | null
  photos: string | null
  birthDate: string | null
  bioTags: string | null
  likedAt: string
  daysLeft: number
  /** type=received에서만 내려온다 — 내가 이미 맞호감을 보냈는지 여부 */
  reciprocated?: boolean
}

async function fetchLikes(type: "received" | "sent"): Promise<LikeUser[]> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`/api/likes?type=${type}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error("호감 목록을 불러오지 못했어요.")
  const data = await res.json()
  return data?.likes ?? []
}

/** "호감" 탭 — 받은/보낸 호감 목록 쿼리. */
export function useLikes(type: "received" | "sent") {
  return useQuery({ queryKey: queryKeys.likes(type), queryFn: () => fetchLikes(type) })
}

/**
 * "받은 호감" 카드의 하트 버튼 — 상세 화면에 들어가지 않고 바로 맞호감(호감 보내기)을 보낸다.
 * 내부적으로 기존 호감 보내기(POST /api/likes)와 동일한 API를 쓴다.
 */
export function useReciprocateLikeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      toUserId: number,
    ): Promise<{ ok: boolean; stars?: number; error?: string; alreadyLiked?: boolean }> => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId }),
      })
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, stars: data.stars, error: data.error, alreadyLiked: data.alreadyLiked }
    },
    onSuccess: (result, toUserId) => {
      if (result.stars != null) {
        queryClient.setQueryData(queryKeys.me, (prev: { stars: number } | null | undefined) =>
          prev ? { ...prev, stars: result.stars } : prev,
        )
      }
      if (result.ok) {
        queryClient.setQueryData<LikeUser[] | undefined>(queryKeys.likes("received"), prev =>
          prev?.map(u => (u.id === toUserId ? { ...u, reciprocated: true } : u)),
        )
        queryClient.invalidateQueries({ queryKey: queryKeys.likes("sent") })
      }
    },
  })
}
