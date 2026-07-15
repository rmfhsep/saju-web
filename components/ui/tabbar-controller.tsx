"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { bridgeSetTabBar } from "@/lib/bridge"

// GNB(하단 탭바)가 보여야 하는 메인 탭 루트. 이 외 모든 하위 페이지에서는 숨긴다.
const TAB_ROOTS = new Set(["/", "/my"])

/**
 * 라우트가 바뀔 때마다 네이티브에 탭바 표시/숨김을 알린다.
 * 하위 페이지는 같은 WebView 안에서 client 라우팅으로 이동해 네이티브가
 * 전환을 감지하지 못하므로, 웹이 명시적으로 신호를 보낸다.
 */
export default function TabBarController() {
  const pathname = usePathname()

  useEffect(() => {
    bridgeSetTabBar(TAB_ROOTS.has(pathname))
  }, [pathname])

  return null
}
