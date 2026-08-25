"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"

export interface LikeUser {
  id: number
  nickname: string | null
  name: string | null
  photos: string | null
  birthDate: string | null
  bioTags: string | null
  likedAt: string
}

async function fetchLikes(): Promise<LikeUser[]> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch("/api/likes", { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error("호감 목록을 불러오지 못했어요.")
  const data = await res.json()
  return data?.likes ?? []
}

/** "호감" 탭 — 나에게 호감을 보낸 유저 목록 쿼리. */
export function useLikes() {
  return useQuery({ queryKey: queryKeys.likes, queryFn: fetchLikes })
}
