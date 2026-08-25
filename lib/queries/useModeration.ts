"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"
import type { ReportReason } from "@/lib/reportReasons"

/** 프로필 신고(POST /api/report). 신고는 열람/추천을 막지 않아 캐시 무효화가 필요 없다. */
export function useReportMutation(targetId: string) {
  return useMutation({
    mutationFn: async (input: { reason: ReportReason; detail?: string }) => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: Number(targetId), reason: input.reason, detail: input.detail }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "신고에 실패했어요.")
      }
    },
  })
}

/**
 * 유저 차단(POST /api/block). 성공 시 상대가 추천/호감 목록에서 즉시 사라지도록
 * 관련 쿼리를 모두 무효화한다(userDetail은 이후 404가 되므로 캐시에서 제거).
 */
export function useBlockMutation(targetId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: Number(targetId) }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "차단에 실패했어요.")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discover })
      queryClient.invalidateQueries({ queryKey: ["likes"] })
      queryClient.removeQueries({ queryKey: queryKeys.userDetail(targetId) })
    },
  })
}
