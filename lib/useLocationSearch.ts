"use client"

import { useEffect, useState } from "react"

// 전국 시·군·구 전체 목록(/api/locations, VWorld 기반)을 모듈 스코프에 캐싱해서
// 이 훅을 쓰는 페이지를 여러 번 드나들어도 한 세션에 한 번만 fetch 하도록 한다.
let cachedLocations: string[] | null = null
let pendingFetch: Promise<string[]> | null = null

function fetchAllLocations(): Promise<string[]> {
  if (cachedLocations) return Promise.resolve(cachedLocations)
  if (!pendingFetch) {
    pendingFetch = fetch("/api/locations")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        cachedLocations = d?.results ?? []
        return cachedLocations
      })
      .catch(() => {
        cachedLocations = []
        return cachedLocations
      })
  }
  return pendingFetch
}

/**
 * 시·군·구 검색 — /api/locations(VWorld 행정구역 API)에서 전체 목록을 한 번 받아온 뒤
 * 이후로는 클라이언트에서 즉시 필터링한다. 검색어가 비어있으면 전체 목록을 그대로 보여준다.
 */
export function useLocationSearch(query: string): { results: string[] | null; loading: boolean } {
  const [allLocations, setAllLocations] = useState<string[] | null>(cachedLocations)

  useEffect(() => {
    if (allLocations) return
    fetchAllLocations().then(setAllLocations)
  }, [allLocations])

  if (!allLocations) return { results: null, loading: true }

  const trimmed = query.trim().replace(/\s/g, "")
  const results = trimmed
    ? allLocations.filter(l => l.replace(/\s/g, "").includes(trimmed))
    : allLocations

  return { results, loading: false }
}
