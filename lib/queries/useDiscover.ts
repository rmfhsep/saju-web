"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"

export interface RecoUser {
  id: number
  nickname: string | null
  name: string | null
  photos: string | null
  birthDate: string | null
  bioTags: string | null
}

interface DiscoverResult {
  users: RecoUser[]
  noNewToday: boolean
}

async function fetchDiscover(): Promise<DiscoverResult> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch("/api/users/discover", { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error("추천 목록을 불러오지 못했어요.")
  return res.json()
}

/** 홈 화면 "오늘의 추천" 누적 목록 쿼리. */
export function useDiscover(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.discover,
    queryFn: fetchDiscover,
    enabled: options?.enabled ?? true,
  })
}

/**
 * "더 소개 받기"(POST /api/users/discover/more) — 별을 소모해 추천 후보를 추가한다.
 * 성공 시 discover 캐시를 새 목록으로 교체하고 me(별 개수) 쿼리를 무효화한다.
 * 실패(후보 없음/별 부족)는 던진 에러의 message로 구분해 페이지에서 토스트 문구를 고른다.
 */
export function useMoreIntroMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<{ users: RecoUser[]; stars: number }> => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/users/discover/more", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "요청에 실패했어요.")
      return data
    },
    onSuccess: data => {
      queryClient.setQueryData<DiscoverResult | undefined>(queryKeys.discover, prev =>
        prev ? { ...prev, users: data.users } : prev,
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}
