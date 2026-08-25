"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"

export interface StarTransactionItem {
  type: "charge" | "spend"
  amount: number
  reason: string
  balanceAfter: number
  createdAt: string
}

async function fetchStarHistory(): Promise<StarTransactionItem[]> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch("/api/stars/history", { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error("이용 내역을 불러오지 못했어요.")
  const data = await res.json()
  return data?.transactions ?? []
}

/** 마이 > 스토어 > 이용 내역 — 별 충전/사용 히스토리 쿼리. */
export function useStarHistory() {
  return useQuery({ queryKey: queryKeys.starHistory, queryFn: fetchStarHistory })
}
