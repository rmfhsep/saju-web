"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // 네이티브 WebView는 포커스/가시성 이벤트가 브라우저 탭과 다르게 동작해
            // 화면 전환마다 불필요한 리페치가 발생할 수 있어 꺼둔다 — 갱신은 각 뮤테이션의
            // invalidateQueries로 명시적으로 트리거한다.
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
