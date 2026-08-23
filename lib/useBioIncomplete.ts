"use client"

import { useMemo } from "react"

type BioUser = { bioTags?: string | null; bio?: string | null } | null | undefined

/** 자기소개(bioTags 전부)를 다 작성했는지 여부 — 홈/마이페이지의 작성 유도 배너 노출 판단에 쓴다. */
export function useBioIncomplete(user: BioUser): boolean {
  return useMemo(() => {
    if (!user) return false
    const tags: string[] = user.bioTags ? JSON.parse(user.bioTags) : []
    const bioMap: Record<string, string> = user.bio ? JSON.parse(user.bio) : {}
    return tags.length === 0 || tags.some(tag => !bioMap[tag]?.trim())
  }, [user])
}
