"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"

export interface Conversation {
  user: { id: number; nickname: string | null; name: string | null; photos: string | null }
  lastMessage: string
  lastAt: string
  lastFromMe: boolean
}

async function fetchConversations(): Promise<Conversation[]> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error("대화 목록을 불러오지 못했어요.")
  const data = await res.json()
  return data?.conversations ?? []
}

/** "메시지" 탭 — 대화 목록 쿼리. */
export function useConversations() {
  return useQuery({ queryKey: queryKeys.conversations, queryFn: fetchConversations })
}
