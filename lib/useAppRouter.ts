"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { bridgeBack, bridgePush, bridgeReplace, isInNativeApp } from "@/lib/bridge"

/**
 * next/navigation의 useRouter()를 대체하는 훅 — 네이티브 앱(WebView) 안에서는
 * push/replace/back이 전부 네이티브 스택 push/pop으로 브릿지되고, 일반 브라우저에서는
 * 기존 Next.js 클라이언트 라우팅 그대로 동작한다. 탭 루트(추천/호감/메시지/내 정보) 밑의
 * 모든 서브페이지 이동은 이 훅을 통해야 네이티브 스택에 쌓인다.
 */
export function useAppRouter() {
  const router = useRouter()

  return useMemo(
    () => ({
      push: (path: string) => (isInNativeApp() ? bridgePush(path) : router.push(path)),
      replace: (path: string) => (isInNativeApp() ? bridgeReplace(path) : router.replace(path)),
      back: () => (isInNativeApp() ? bridgeBack() : router.back()),
    }),
    [router],
  )
}
