"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"

export interface MeUser {
  id: number
  phone: string
  name: string | null
  gender: string | null
  nickname: string | null
  location: string | null
  job: string | null
  jobDetail: string | null
  height: number | null
  smoking: string | null
  drinking: string | null
  datingPurpose: string | null
  politics: string | null
  religion: string | null
  income: string | null
  photos: string | null
  bioTags: string | null
  bio: string | null
  profileComplete: boolean
  filterComplete: boolean
  preferredFilterType: string | null
  preferredHeightMin: number | null
  preferredHeightMax: number | null
  preferredSmoking: string | null
  preferredDrinking: string | null
  preferredPolitics: string | null
  preferredReligion: string | null
  stars: number
  trialStars: number
  miniGamePlayed: boolean
}

async function fetchMe(): Promise<MeUser | null> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  if (!token) return null
  const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  return res.json()
}

/**
 * 로그인한 유저 프로필(보유 별 stars 포함) 쿼리. 모든 화면이 이 훅 하나로 별 개수를 읽으면,
 * 어디서 별을 쓰거나 충전하든 invalidateQueries(queryKeys.me) 한 번으로 전 화면에 즉시 반영된다
 * — 기존에는 화면마다 useState로 따로 들고 있어 다른 화면에서 별을 쓰고 돌아와도 갱신되지 않았다.
 * @param enabled - false면 쿼리를 실행하지 않는다(토큰 없는 화면 등에서 사용)
 */
export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    enabled: options?.enabled ?? true,
  })
}

/**
 * 온보딩 미니게임 별 적립(POST /api/stars/add). 성공 시 me 쿼리를 무효화해 최종 별 개수를 반영한다.
 */
export function useAwardStarsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bestSeconds: number): Promise<{ earned: number }> => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/stars/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bestSeconds }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "별 적립에 실패했어요.")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}
